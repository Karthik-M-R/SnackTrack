// Dashboard controller
import Order from "../models/Order.js";

// GET DASHBOARD SUMMARY (OWNER ONLY)
export const getDashboardSummary = async (req, res) => {
    // today range
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // current month range
    const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

    // 1️⃣ Today's earnings (paid only)
    const todayOrders = await Order.find({
        paymentDone: true,
        createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    const todayEarnings = todayOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
    );

    // 2️⃣ Monthly earnings (paid only)
    const monthOrders = await Order.find({
        paymentDone: true,
        createdAt: { $gte: startOfMonth }
    });

    const monthlyEarnings = monthOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
    );

    // 3️⃣ Total paid orders
    const totalPaidOrders = monthOrders.length;

    // 4️⃣ Top snacks (for pie chart)
    const snackMap = {};

    monthOrders.forEach((order) => {
        order.items.forEach((item) => {
            snackMap[item.name] =
                (snackMap[item.name] || 0) + item.qty;
        });
    });

    const topSnacks = Object.entries(snackMap).map(
        ([name, qty]) => ({ name, qty })
    );

    res.json({
        todayEarnings,
        monthlyEarnings,
        totalPaidOrders,
        topSnacks
    });
};
