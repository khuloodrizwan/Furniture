import furModel from "../models/furModel.js";
import fs from 'fs'

// all fur list
const listFur = async (req, res) => {
    try {
        const furs = await furModel.find({})
        res.json({ success: true, data: furs })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// add fur
const addFur = async (req, res) => {
    try {
        const image_filename = req.files['image'][0].filename;
        const extra_images = req.files['images']
            ? req.files['images'].map(f => f.filename)
            : [];

        const fur = new furModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
            images: extra_images,
            isDealActive: req.body.isDealActive === "true",
            discountType: req.body.discountType || "percentage",
            discountValue: Number(req.body.discountValue) || 0,
        })

        await fur.save();
        res.json({ success: true, message: "Fur Added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// delete fur
const removeFur = async (req, res) => {
    try {
        const fur = await furModel.findById(req.body.id);
        fs.unlink(`uploads/${fur.image}`, () => {})
        if (fur.images && fur.images.length > 0) {
            fur.images.forEach(img => {
                fs.unlink(`uploads/${img}`, () => {})
            })
        }
        await furModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Fur Removed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

export { listFur, addFur, removeFur }