// Order controller
import Order from "../models/Order.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({
            message: "Order must have items"
        });
    }

    // Get today's date range (00:00 to 23:59)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find the last order created TODAY
    const lastOrder = await Order.findOne({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: -1 });

    // If there's an order today, increment its ID. Otherwise, start at 1.
    // robust check: lastOrder.orderId might be undefined for old records
    const orderId = (lastOrder && lastOrder.orderId) ? lastOrder.orderId + 1 : 1;

    const order = await Order.create({
        items,
        totalAmount,
        orderId,
        createdBy: req.user._id
    });

    res.status(201).json(order);
};

// GET ALL ORDERS
export const getOrders = async (req, res) => {
    const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate("createdBy", "email role");
    /**
     * If you just wrote .populate("createdBy"), it would bring back everything about that user—including their hashed password, their address, and their phone number.

     By adding "email role", you are being specific: "Only give me the email and the role; leave the sensitive stuff in the database.
     */

    res.json(orders);
};

// MARK ORDER AS PAID
export const markOrderPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    order.paymentDone = true;
    await order.save();

    res.json(order);
};

// UNDO PAYMENT (mark as unpaid)
export const undoPayment = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    order.paymentDone = false;
    await order.save();

    res.json(order);
};

// DELETE ORDER
export const deleteOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    await order.deleteOne();
    res.json({ message: "Order deleted" });
};
