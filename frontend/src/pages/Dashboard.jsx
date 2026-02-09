import React from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
	AreaChart,
	Area,
} from "recharts";

// Color palette for charts
const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e", "#ec4899", "#6366f1", "#14b8a6"];

function Dashboard({ orders }) {
	// CRITICAL: Only consider PAID orders for dashboard
	const paidOrders = orders.filter((order) => order.paymentDone);

	// ===== EARNINGS CALCULATIONS =====
	const today = new Date().toDateString();
	const currentMonth = new Date().getMonth();
	const currentYear = new Date().getFullYear();

	// Today's earnings
	const todaysEarnings = paidOrders
		.filter((order) => order.createdAtDate === today)
		.reduce((sum, order) => sum + order.total, 0);

	// Monthly earnings
	const monthlyEarnings = paidOrders
		.filter((order) => {
			const orderDate = new Date(order.createdAtFull);
			return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
		})
		.reduce((sum, order) => sum + order.total, 0);

	// Total earnings (all time)
	const totalEarnings = paidOrders.reduce((sum, order) => sum + order.total, 0);

	// Total orders count
	const totalOrders = orders.length;
	const pendingOrders = orders.filter((o) => !o.paymentDone).length;

	// Average order value
	const avgOrderValue = paidOrders.length > 0 ? Math.round(totalEarnings / paidOrders.length) : 0;

	// ===== LAST 7 DAYS EARNINGS DATA =====
	const getLast7DaysData = () => {
		const data = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dateStr = date.toDateString();
			const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

			const dayEarnings = paidOrders
				.filter((order) => order.createdAtDate === dateStr)
				.reduce((sum, order) => sum + order.total, 0);

			data.push({
				day: dayName,
				earnings: dayEarnings,
				date: dateStr,
			});
		}
		return data;
	};

	// ===== TOP SELLING SNACKS =====
	const getTopSnacksData = () => {
		const snackCounts = {};
		paidOrders.forEach((order) => {
			order.items?.forEach((item) => {
				snackCounts[item.name] = (snackCounts[item.name] || 0) + item.qty;
			});
		});

		return Object.entries(snackCounts)
			.map(([name, qty]) => ({ name, qty }))
			.sort((a, b) => b.qty - a.qty)
			.slice(0, 6);
	};

	// ===== PEAK HOURS ANALYSIS =====
	const getPeakHoursData = () => {
		const hourCounts = {};
		for (let i = 8; i <= 22; i++) {
			hourCounts[i] = 0;
		}

		paidOrders.forEach((order) => {
			const hour = new Date(order.createdAtFull).getHours();
			if (hour >= 8 && hour <= 22) {
				hourCounts[hour] = (hourCounts[hour] || 0) + 1;
			}
		});

		return Object.entries(hourCounts).map(([hour, orders]) => ({
			hour: `${hour}:00`,
			orders: orders,
		}));
	};

	// ===== PAYMENT STATUS =====
	const getPaymentStatusData = () => {
		const paid = orders.filter((o) => o.paymentDone).length;
		const pending = orders.filter((o) => !o.paymentDone).length;
		return [
			{ name: "Paid", value: paid },
			{ name: "Pending", value: pending },
		].filter((item) => item.value > 0);
	};

	// ===== TOP REVENUE ITEMS =====
	const getTopRevenueItems = () => {
		const revenueMap = {};
		paidOrders.forEach((order) => {
			order.items?.forEach((item) => {
				revenueMap[item.name] = (revenueMap[item.name] || 0) + item.total;
			});
		});

		return Object.entries(revenueMap)
			.map(([name, revenue]) => ({ name, revenue }))
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5);
	};

	const last7DaysData = getLast7DaysData();
	const topSnacksData = getTopSnacksData();
	const peakHoursData = getPeakHoursData();
	const paymentStatusData = getPaymentStatusData();
	const topRevenueItems = getTopRevenueItems();

	// Custom tooltip style
	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
					<p className="font-semibold">{label}</p>
					<p className="text-green-400">₹{payload[0].value}</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-1">Track your snack business performance</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
					{/* Today's Earnings */}
					<div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-violet-100 text-sm font-medium">Today's Earnings</p>
								<p className="text-3xl font-bold mt-1">₹{todaysEarnings}</p>
							</div>
							<div className="bg-white/20 p-3 rounded-xl">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
					</div>

					{/* Monthly Earnings */}
					<div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/30">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-cyan-100 text-sm font-medium">This Month</p>
								<p className="text-3xl font-bold mt-1">₹{monthlyEarnings}</p>
							</div>
							<div className="bg-white/20 p-3 rounded-xl">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
						</div>
					</div>

					{/* Total Orders */}
					<div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-amber-100 text-sm font-medium">Total Orders</p>
								<p className="text-3xl font-bold mt-1">{totalOrders}</p>
								{pendingOrders > 0 && (
									<p className="text-amber-100 text-xs mt-1">{pendingOrders} pending</p>
								)}
							</div>
							<div className="bg-white/20 p-3 rounded-xl">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
							</div>
						</div>
					</div>

					{/* Avg Order Value */}
					<div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-emerald-100 text-sm font-medium">Avg Order Value</p>
								<p className="text-3xl font-bold mt-1">₹{avgOrderValue}</p>
							</div>
							<div className="bg-white/20 p-3 rounded-xl">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Charts Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Last 7 Days Earnings */}
					<div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
						<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Last 7 Days Earnings</h2>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={last7DaysData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
									<XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
									<YAxis stroke="#6b7280" fontSize={12} />
									<Tooltip content={<CustomTooltip />} />
									<Bar dataKey="earnings" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
									<defs>
										<linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="#8b5cf6" />
											<stop offset="100%" stopColor="#6366f1" />
										</linearGradient>
									</defs>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Top Selling Snacks */}
					<div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
						<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Top Selling Snacks</h2>
						<div className="h-64">
							{topSnacksData.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={topSnacksData}
											cx="50%"
											cy="50%"
											outerRadius={80}
											innerRadius={40}
											dataKey="qty"
											nameKey="name"
											label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
											labelLine={false}
										>
											{topSnacksData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-gray-400">
									No sales data yet
								</div>
							)}
						</div>
					</div>

					{/* Peak Hours */}
					<div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
						<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
							Peak Hours Analysis
							<span className="text-sm font-normal text-gray-500 ml-2">(Orders by Hour)</span>
						</h2>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={peakHoursData}>
									<defs>
										<linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
											<stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
									<XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
									<YAxis stroke="#6b7280" fontSize={12} />
									<Tooltip />
									<Area
										type="monotone"
										dataKey="orders"
										stroke="#06b6d4"
										fill="url(#areaGradient)"
										strokeWidth={2}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Payment Status */}
					<div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
						<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Payment Status</h2>
						<div className="h-64">
							{paymentStatusData.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={paymentStatusData}
											cx="50%"
											cy="50%"
											outerRadius={90}
											innerRadius={60}
											dataKey="value"
											nameKey="name"
										>
											<Cell fill="#22c55e" />
											<Cell fill="#f59e0b" />
										</Pie>
										<Legend />
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className="h-full flex items-center justify-center text-gray-400">
									No orders yet
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Top Revenue Items - Business Insight */}
				<div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 mb-8">
					<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
						💰 Top Revenue Generators
						<span className="text-sm font-normal text-gray-500 ml-2">(Items bringing most money)</span>
					</h2>
					{topRevenueItems.length > 0 ? (
						<div className="space-y-3">
							{topRevenueItems.map((item, index) => (
								<div key={item.name} className="flex items-center gap-4">
									<span className="text-2xl font-bold text-gray-300 w-8">#{index + 1}</span>
									<div className="flex-1">
										<div className="flex items-center justify-between mb-1">
											<span className="font-medium text-gray-800 dark:text-white">{item.name}</span>
											<span className="text-green-600 font-semibold">₹{item.revenue}</span>
										</div>
										<div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
											<div
												className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
												style={{
													width: `${(item.revenue / topRevenueItems[0].revenue) * 100}%`,
												}}
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center text-gray-400 py-8">No revenue data yet</div>
					)}
				</div>

				{/* Business Insights Panel */}
				<div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
					<h2 className="text-lg font-semibold mb-4">📊 Quick Insights</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-white/10 rounded-xl p-4">
							<p className="text-violet-200 text-sm">Conversion Rate</p>
							<p className="text-2xl font-bold">
								{totalOrders > 0 ? Math.round((paidOrders.length / totalOrders) * 100) : 0}%
							</p>
							<p className="text-xs text-violet-200 mt-1">Orders paid vs total</p>
						</div>
						<div className="bg-white/10 rounded-xl p-4">
							<p className="text-violet-200 text-sm">All-Time Revenue</p>
							<p className="text-2xl font-bold">₹{totalEarnings}</p>
							<p className="text-xs text-violet-200 mt-1">From {paidOrders.length} paid orders</p>
						</div>
						<div className="bg-white/10 rounded-xl p-4">
							<p className="text-violet-200 text-sm">Best Performer</p>
							<p className="text-2xl font-bold truncate">
								{topRevenueItems.length > 0 ? topRevenueItems[0].name : "N/A"}
							</p>
							<p className="text-xs text-violet-200 mt-1">
								{topRevenueItems.length > 0 ? `₹${topRevenueItems[0].revenue} revenue` : "No data"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
