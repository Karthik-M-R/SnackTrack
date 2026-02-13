import Order from "../models/Order.js";

export const getDashboardSummary = async (req, res) => {
    const orders = await Order.find();

    const paidOrders = orders.filter(o => o.paymentDone);

    const now = new Date();
    const todayStr = now.toDateString();
    const month = now.getMonth();
    const year = now.getFullYear();

    // ===== BASIC METRICS =====
    const todayEarnings = paidOrders
        .filter(o => new Date(o.createdAt).toDateString() === todayStr)
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const monthlyEarnings = paidOrders
        .filter(o => {
            const d = new Date(o.createdAt);
            return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalPaidOrders = paidOrders.length;

    // ===== LAST 7 DAYS =====
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toDateString();
        const label = d.toLocaleDateString("en-US", { weekday: "short" });

        const earnings = paidOrders
            .filter(o => new Date(o.createdAt).toDateString() === dayStr)
            .reduce((sum, o) => sum + o.totalAmount, 0);

        last7Days.push({ day: label, earnings });
    }

    // ===== TOP SNACKS =====
    const snackMap = {};
    paidOrders.forEach(o => {
        o.items.forEach(item => {
            snackMap[item.name] = (snackMap[item.name] || 0) + item.qty;
        });
    });

    const topSnacks = Object.entries(snackMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 6);

    // ===== PEAK HOURS =====
    const hourMap = {};
    for (let h = 8; h <= 22; h++) hourMap[h] = 0;

    paidOrders.forEach(o => {
        const h = new Date(o.createdAt).getHours();
        if (hourMap[h] !== undefined) hourMap[h]++;
    });

    const peakHours = Object.entries(hourMap).map(([hour, orders]) => ({
        hour: `${hour}:00`,
        orders
    }));

    // ===== PAYMENT STATUS =====
    const paymentStatus = {
        paid: paidOrders.length,
        pending: orders.length - paidOrders.length
    };

    // ===== TOP REVENUE ITEMS =====
    const revenueMap = {};
    paidOrders.forEach(o => {
        o.items.forEach(item => {
            revenueMap[item.name] =
                (revenueMap[item.name] || 0) + item.total;
        });
    });

    const topRevenueItems = Object.entries(revenueMap)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    res.json({
        todayEarnings,
        monthlyEarnings,
        totalPaidOrders,
        last7Days,
        topSnacks,
        peakHours,
        paymentStatus,
        topRevenueItems
    });
};
