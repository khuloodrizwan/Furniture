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
        let image_filename = `${req.file.filename}`

        const fur = new furModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category:req.body.category,
            image: image_filename,
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
        fs.unlink(`uploads/${fur.image}`, () => { })

        await furModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Fur Removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

export { listFur, addFur, removeFur}