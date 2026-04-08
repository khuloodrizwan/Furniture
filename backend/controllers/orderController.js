import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import couponModel from "../models/couponModel.js"
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const currency = "INR";

// Generate installment schedule for all items
const generateInstallments = (items) => {
    const today = new Date();
    const scheduleMap = {};

    items.forEach(item => {
        const months = item.months || 1;
        const schedule = [];
        for (let i = 0; i < months; i++) {
            const date = new Date(today);
            date.setMonth(date.getMonth() + i);
            schedule.push({
                no: i + 1,
                date: date.toISOString(),
                amount: item.price,
                paid: i === 0, // first installment paid at checkout
            });
        }
        scheduleMap[item._id] = {
            itemName: item.name,
            pricePerMonth: item.price,
            totalMonths: months,
            schedule
        };
    });

    return scheduleMap;
};

// ─── REFUND CALCULATION HELPER ────────────────────────────────────────────────
// Policy:
//   - Refund is based on REMAINING unpaid months only
//   - If return is requested mid-month, the current month is charged in full
//   - Pickup can be scheduled either mid-month or at end of month
//   - Refund = sum of all future unpaid installment amounts across all items
const calculateRefund = (order) => {
    let refundAmount = 0;
    let remainingMonthsTotal = 0;

    if (!order.installments) return { refundAmount: 0, remainingMonthsTotal: 0 };

    Object.values(order.installments).forEach(inst => {
        // Only unpaid installments are refundable (paid months already collected)
        const unpaidInstallments = inst.schedule.filter(s => !s.paid);
        unpaidInstallments.forEach(s => {
            refundAmount += s.amount;
            remainingMonthsTotal++;
        });
    });

    return { refundAmount, remainingMonthsTotal };
};

// Placing User Order using Razorpay
const placeOrder = async (req, res) => {
    try {
        const installments = generateInstallments(req.body.items);

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            installments,
        });
        await newOrder.save();

        if (req.body.couponCode) {
            await couponModel.findOneAndUpdate(
                { code: req.body.couponCode },
                { $push: { usedBy: req.body.userId } }
            );
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const options = {
            amount: req.body.amount * 100,
            currency: currency,
            receipt: newOrder._id.toString(),
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: razorpayOrder,
            orderId: newOrder._id,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// Placing User Order using COD
const placeOrderCod = async (req, res) => {
    try {
        const installments = generateInstallments(req.body.items);

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: true,
            installments,
        });
        await newOrder.save();

        if (req.body.couponCode) {
            await couponModel.findOneAndUpdate(
                { code: req.body.couponCode },
                { $push: { usedBy: req.body.userId } }
            );
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
        res.json({ success: true, message: "Order Placed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// List all Orders (Admin)
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        const serialized = orders.map(order => order.toObject());
        res.json({ success: true, data: serialized });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        const serialized = orders.map(order => order.toObject());
        res.json({ success: true, data: serialized });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// Update order status (Admin)
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

// Verify initial checkout payment
const verifyOrder = async (req, res) => {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    try {
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Not Verified" });
    }
};

// Create Razorpay order for installment(s) — single or pay-all
const payInstallment = async (req, res) => {
    try {
        const { orderId, itemId, installmentNos } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        const installmentData = order.installments[itemId];
        if (!installmentData) return res.json({ success: false, message: "Item installment data not found" });

        const nos = installmentNos.map(Number);

        const targetInstallments = installmentData.schedule.filter(s => nos.includes(Number(s.no)));
        if (targetInstallments.length !== nos.length) {
            return res.json({ success: false, message: "Some installments not found" });
        }
        const alreadyPaid = targetInstallments.filter(s => s.paid);
        if (alreadyPaid.length > 0) {
            return res.json({ success: false, message: "Some installments are already paid" });
        }

        const totalAmount = installmentData.pricePerMonth * nos.length;

        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `inst_${orderId.slice(-6)}_${itemId.slice(-6)}_${nos.join("_")}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: razorpayOrder,
            key_id: process.env.RAZORPAY_KEY_ID,
            meta: { orderId, itemId, installmentNos: nos }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating installment payment" });
    }
};

// Verify installment payment signature and mark installments paid in DB
const verifyInstallment = async (req, res) => {
    const {
        orderId, itemId, installmentNos,
        razorpay_order_id, razorpay_payment_id, razorpay_signature
    } = req.body;

    try {
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.json({ success: false, message: "Payment verification failed" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        const installmentData = order.installments[itemId];
        if (!installmentData) return res.json({ success: false, message: "Item not found in installments" });

        const nos = installmentNos.map(Number);

        installmentData.schedule = installmentData.schedule.map(s => {
            if (nos.includes(Number(s.no))) {
                return { no: s.no, date: s.date, amount: s.amount, paid: true };
            }
            return s;
        });

        order.installments[itemId] = installmentData;
        order.markModified("installments");
        await order.save();

        res.json({ success: true, message: "Installment paid successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Verification error" });
    }
};

// ─── RETURN MANAGEMENT ────────────────────────────────────────────────────────

// POST /api/order/requestreturn — User submits return request
const requestReturn = async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        if (!orderId || !reason || reason.trim() === "") {
            return res.json({ success: false, message: "Order ID and reason are required" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        // Prevent duplicate requests
        if (order.returnRequest && order.returnRequest.requested) {
            return res.json({ success: false, message: "Return already requested for this order" });
        }

        // Calculate refund based on remaining unpaid months
        const { refundAmount, remainingMonthsTotal } = calculateRefund(order);

        // Rental policy: if mid-month, charge current month in full,
        // pickup is scheduled at end of month by default
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const pickupSchedule = `End of month — ${endOfMonth.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;

        order.returnRequest = {
            requested: true,
            reason: reason.trim(),
            status: "Requested",
            requestedAt: new Date(),
            refundAmount,
            pickupSchedule,
        };

        order.markModified("returnRequest");
        await order.save();

        res.json({
            success: true,
            message: "Return request submitted successfully",
            refundAmount,
            remainingMonthsTotal,
            pickupSchedule,
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error submitting return request" });
    }
};

// GET /api/order/allreturns — Admin fetches all orders with return requests
const getAllReturns = async (req, res) => {
    try {
        const orders = await orderModel.find({ "returnRequest.requested": true });

        // Populate user details
        const populated = await Promise.all(
            orders.map(async (order) => {
                const obj = order.toObject();
                try {
                    const user = await userModel.findById(order.userId).select("name email");
                    obj.userDetails = user ? { name: user.name, email: user.email } : { name: "Unknown", email: "" };
                } catch {
                    obj.userDetails = { name: "Unknown", email: "" };
                }
                return obj;
            })
        );

        res.json({ success: true, data: populated });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching return requests" });
    }
};

// POST /api/order/updatereturnstatus — Admin approves or rejects return
const updateReturnStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.json({ success: false, message: "Order ID and status are required" });
        }

        if (!["Approved", "Rejected"].includes(status)) {
            return res.json({ success: false, message: "Status must be 'Approved' or 'Rejected'" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        if (!order.returnRequest || !order.returnRequest.requested) {
            return res.json({ success: false, message: "No return request found for this order" });
        }

        order.returnRequest.status = status;
        order.markModified("returnRequest");
        await order.save();

        res.json({
            success: true,
            message: `Return request ${status.toLowerCase()} successfully`,
            refundAmount: status === "Approved" ? order.returnRequest.refundAmount : 0,
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating return status" });
    }
};

export {
    placeOrder,
    listOrders,
    userOrders,
    updateStatus,
    verifyOrder,
    placeOrderCod,
    payInstallment,
    verifyInstallment,
    requestReturn,
    getAllReturns,
    updateReturnStatus,
};