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

        // Validate installments exist and are unpaid
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
        // Step 1: Verify Razorpay signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.json({ success: false, message: "Payment verification failed" });
        }

        // Step 2: BUG FIX — fetch order (was missing in original, caused ReferenceError crash)
        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        const installmentData = order.installments[itemId];
        if (!installmentData) return res.json({ success: false, message: "Item not found in installments" });

        // Step 3: BUG FIX — cast to Number on both sides to avoid type mismatch
        const nos = installmentNos.map(Number);

        installmentData.schedule = installmentData.schedule.map(s => {
            if (nos.includes(Number(s.no))) {
                return { no: s.no, date: s.date, amount: s.amount, paid: true };
            }
            return s;
        });

        // Step 4: Write back — markModified required for nested Object type in Mongoose
        order.installments[itemId] = installmentData;
        order.markModified("installments");
        await order.save();

        res.json({ success: true, message: "Installment paid successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Verification error" });
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
    verifyInstallment
};