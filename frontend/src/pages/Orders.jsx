import React, { useEffect, useState } from "react";
import API from "../api/api";

function Orders() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchOrders = async () => {
		try {
			const { data } = await API.get("/orders");
			setOrders(data);
		} catch (err) {
			console.error("Failed to fetch orders", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	// Mark order as paid (one-way, no undo)
	const markPaid = async (orderId) => {
		try {
			await API.patch(`/orders/${orderId}/pay`);
			fetchOrders();
		} catch (err) {
			console.error("Failed to mark order as paid", err);
		}
	};

	// Undo payment (mark as unpaid)
	const undoPayment = async (orderId) => {
		try {
			await API.patch(`/orders/${orderId}/unpay`);
			fetchOrders();
		} catch (err) {
			console.error("Failed to undo payment", err);
		}
	};

	// Delete order with confirmation
	const deleteOrder = async (orderId) => {
		if (!window.confirm("Delete this order?")) return;

		try {
			await API.delete(`/orders/${orderId}`);
			fetchOrders();
		} catch (err) {
			console.error("Failed to delete order", err);
		}
	};

	return (
		<div className="p-8 min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white tracking-tight">
					📋 Orders
				</h1>

				{loading && (
					<p className="text-center text-gray-400">Loading orders...</p>
				)}

				{!loading && orders.length === 0 && (
					<div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-orange-100/50 dark:border-slate-700">
						<p className="text-gray-400 dark:text-gray-500 text-lg">No orders yet</p>
						<p className="text-gray-300 dark:text-gray-600 text-sm mt-2">Create your first order from Billing</p>
					</div>
				)}

				<div className="space-y-5">
					{orders.map((order, index) => (
						<div
							key={order._id}
							className={`rounded-2xl p-6 shadow-lg transition-all duration-300 ${order.paymentDone
								? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-400 dark:border-green-600"
								: "bg-white dark:bg-slate-800 border-2 border-yellow-400 dark:border-yellow-600 shadow-yellow-100 dark:shadow-yellow-900/20"
								}`}
						>
							{/* Header */}
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-bold text-gray-800 dark:text-white">
									🧾 Order #{index + 1}
								</h2>

								<span
									className={`text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm ${order.paymentDone
										? "bg-green-500 text-white"
										: "bg-yellow-400 text-yellow-900"
										}`}
								>
									{order.paymentDone ? "✓ Paid" : "⏳ Pending"}
								</span>
							</div>

							{/* Time */}
							<p className="text-sm text-gray-400 dark:text-gray-500 mb-3">
								🕐 Created at: {new Date(order.createdAt).toLocaleString()}
							</p>

							{/* Items */}
							<div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
								<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
									Items
								</h3>
								<ul className="space-y-2">
									{order.items.map((item, i) => (
										<li key={i} className="flex justify-between items-center text-base text-gray-700 dark:text-gray-300">
											<span className="font-medium">{item.name}</span>
											<span className="text-gray-500 dark:text-gray-400">
												{item.qty} × ₹{item.price} = <strong className="text-gray-800 dark:text-white">₹{item.total}</strong>
											</span>
										</li>
									))}
								</ul>
							</div>

							{/* Total Amount */}
							<div className="flex justify-between items-center py-3 px-4 bg-gray-800 dark:bg-slate-900 text-white rounded-xl mb-4">
								<span className="text-lg font-medium">Total Amount</span>
								<span className="text-2xl font-bold">₹{order.totalAmount}</span>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-6">
								{/* Mark as Paid Button - only for unpaid orders */}
								{!order.paymentDone && (
									<button
										onClick={() => markPaid(order._id)}
										className="flex items-center gap-2 text-green-600 hover:text-green-800 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 px-4 py-2 rounded-lg font-medium transition-all"
									>
										✅ Mark as Paid
									</button>
								)}

								{/* Undo Payment Button - only for paid orders */}
								{order.paymentDone && (
									<button
										onClick={() => undoPayment(order._id)}
										className="flex items-center gap-2 text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 px-4 py-2 rounded-lg font-medium transition-all"
									>
										↩️ Undo Payment
									</button>
								)}

								{/* Delete Button - only for unpaid orders */}
								{!order.paymentDone && (
									<button
										onClick={() => deleteOrder(order._id)}
										className="text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-2 rounded-lg font-medium transition-all"
									>
										🗑️ Delete
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default Orders;
