import express from 'express';
import { addFur, listFur, removeFur } from '../controllers/furController.js';
import multer from 'multer';
const furRouter = express.Router();

//Image Storage Engine (Saving Image to uploads folder & rename it)

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null,`${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage})

furRouter.get("/list",listFur);
furRouter.post("/add",upload.single('image'),addFur);
furRouter.post("/remove",removeFur);

export default furRouter;