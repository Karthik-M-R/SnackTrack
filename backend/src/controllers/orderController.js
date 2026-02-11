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

    const order = await Order.create({
        items,
        totalAmount,
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
