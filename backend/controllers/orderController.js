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
const deliveryCharge = 20;

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
                paid: i === 0, // first one paid now
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
}

// Placing User Order for Frontend using Razorpay
const placeOrder = async (req, res) => {
    try {
        const installments = generateInstallments(req.body.items);

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            installments,
        })
        await newOrder.save();

        if (req.body.couponCode) {
            await couponModel.findOneAndUpdate(
                { code: req.body.couponCode },
                { $push: { usedBy: req.body.userId } }
            )
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
        res.json({ success: false, message: "Error" })
    }
}

// Placing User Order for Frontend using COD
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
        })
        await newOrder.save();

        if (req.body.couponCode) {
            await couponModel.findOneAndUpdate(
                { code: req.body.couponCode },
                { $push: { usedBy: req.body.userId } }
            )
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
        res.json({ success: true, message: "Order Placed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Listing Order for Admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        const serialized = orders.map(order => order.toObject());
        res.json({ success: true, data: serialized });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });

        const serialized = orders.map(order => {
            const obj = order.toObject();
            // No Map conversion needed anymore
            return obj;
        });

        res.json({ success: true, data: serialized });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        res.json({ success: false, message: "Error" })
    }
}

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
            res.json({ success: true, message: "Paid" })
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Not Verified" })
    }
}
// Pay a single installment OR multiple (pay all remaining)
const payInstallment = async (req, res) => {
    try {
        const { orderId, itemId, installmentNos } = req.body;
        // installmentNos is an array like [2] or [2,3] for pay-all

        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        const installmentData = order.installments[itemId];
        if (!installmentData) return res.json({ success: false, message: "Item not found" });

        const totalAmount = installmentData.pricePerMonth * installmentNos.length;

        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `inst_${orderId}_${itemId}_${installmentNos.join("_")}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: razorpayOrder,
            key_id: process.env.RAZORPAY_KEY_ID,
            meta: { orderId, itemId, installmentNos }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating installment payment" });
    }
};

// Verify installment payment and mark those installment nos as paid
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

      const installmentData = order.installments[itemId];

installmentData.schedule = installmentData.schedule.map(s => {
    if (installmentNos.includes(s.no)) {
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

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod, payInstallment, verifyInstallment };