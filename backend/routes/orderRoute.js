import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
    listOrders,
    placeOrder,
    updateStatus,
    userOrders,
    verifyOrder,
    placeOrderCod,
    payInstallment,
    verifyInstallment,
    requestReturn,
    getAllReturns,
    updateReturnStatus,
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// Existing routes
orderRouter.get("/list", listOrders);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/status", updateStatus);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/placecod", authMiddleware, placeOrderCod);
orderRouter.post("/payinstallment", authMiddleware, payInstallment);
orderRouter.post("/verifyinstallment", authMiddleware, verifyInstallment);

// ─── Return Management Routes ─────────────────────────────────────────────────
orderRouter.post("/requestreturn", authMiddleware, requestReturn);   // User: submit return
orderRouter.get("/allreturns", getAllReturns);                        // Admin: get all returns
orderRouter.post("/updatereturnstatus", updateReturnStatus);          // Admin: approve/reject

export default orderRouter;