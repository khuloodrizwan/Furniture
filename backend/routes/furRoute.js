import express from 'express';
import { addFur, listFur, removeFur } from '../controllers/furController.js';
import multer from 'multer';
const furRouter = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage })

furRouter.get("/list", listFur);
furRouter.post("/add", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]), addFur);
furRouter.post("/remove", removeFur);

export default furRouter;