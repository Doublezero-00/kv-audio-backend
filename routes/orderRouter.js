import express from 'express';
import { approveOrRejectOrder, createOrder, getOrders, getQuote } from '../controllers/orderController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';  // import your auth middleware

const orderRouter = express.Router();

orderRouter.use(verifyToken);  // add auth middleware to all routes below

orderRouter.post("/", createOrder);
orderRouter.post("/quote", getQuote);
orderRouter.get("/", getOrders);
orderRouter.put("/status/:orderId", approveOrRejectOrder);

export default orderRouter;
