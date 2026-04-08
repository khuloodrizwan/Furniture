import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Fur Processing" },
    date: { type: Date, default: Date.now() },
    payment: { type: Boolean, default: false },
    installments: { type: Object, default: {} },
    returnRequest: {
        requested: { type: Boolean, default: false },
        reason: { type: String, default: "" },
        status: { type: String, default: "None" }, // "None" | "Requested" | "Approved" | "Rejected"
        requestedAt: { type: Date },
        refundAmount: { type: Number, default: 0 },
        pickupSchedule: { type: String, default: "" }, // "end-of-month" or "mid-month"
    }
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;