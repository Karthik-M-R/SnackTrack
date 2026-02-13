import Order from "../models/Order.js";

export const buildDailySummary = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const paidOrders = await Order.find({
        paymentDone: true,
        createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const pendingCount = await Order.countDocuments({
        paymentDone: false,
        createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    let todayEarnings = 0;
    const snackCount = {};

    paidOrders.forEach(order => {
        todayEarnings += order.totalAmount;
        order.items.forEach(item => {
            snackCount[item.name] =
                (snackCount[item.name] || 0) + item.qty;
        });
    });

    const topSnack =
        Object.entries(snackCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
        todayEarnings,
        totalPaidOrders: paidOrders.length,
        pendingOrders: pendingCount,
        topSnack
    };
};
