// Order routes
import express from "express";
import {
    createOrder,
    getOrders,
    markOrderPaid,
    deleteOrder
} from "../controllers/orderController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

// Owner + Staff
router.post("/", protect, authorize("owner", "staff"), createOrder);
router.get("/", protect, authorize("owner", "staff"), getOrders);
router.patch("/:id/pay", protect, authorize("owner", "staff"), markOrderPaid);
router.delete("/:id", protect, authorize("owner", "staff"), deleteOrder);

export default router;
