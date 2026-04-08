import mongoose from "mongoose";

const furSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    isDealActive: { type: Boolean, default: false },
    discountType: { type: String, enum: ["percentage", "flat"], default: "percentage" },
    discountValue: { type: Number, default: 0 },
})

const furModel = mongoose.models.fur || mongoose.model("fur", furSchema);
export default furModel;