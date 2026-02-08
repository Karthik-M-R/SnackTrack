import React from "react";

function Orders({ orders, setOrders }) {

	// Toggle payment status (mark/unmark as paid)
	const togglePayment = (orderId) => {
		setOrders(prev =>
			prev.map(order =>
				order.id === orderId
					? { ...order, paymentDone: !order.paymentDone }
					: order
			)
		);
	};

	// Delete pending order
	const deleteOrder = (orderId) => {
		setOrders(prev => prev.filter(order => order.id !== orderId));
	};

	return (
		<div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-8 text-gray-800 tracking-tight">
					📋 Orders
				</h1>

				{orders.length === 0 && (
					<div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
						<p className="text-gray-400 text-lg">No orders yet</p>
						<p className="text-gray-300 text-sm mt-2">Create your first order from Billing</p>
					</div>
				)}

				<div className="space-y-5">
					{orders.map((order, index) => (
						<div
							key={order.id}
							className={`rounded-2xl p-6 shadow-lg transition-all duration-300 ${order.paymentDone
									? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400"
									: "bg-white border-2 border-yellow-400 shadow-yellow-100"
								}`}
						>
							{/* Header */}
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-bold text-gray-800">
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
							<p className="text-sm text-gray-400 mb-3">
								🕐 Created at: {order.createdAt}
							</p>

							{/* Items */}
							<div className="bg-gray-50 rounded-xl p-4 mb-4">
								<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
									Items
								</h3>
								<ul className="space-y-2">
									{order.items.map((item, i) => (
										<li key={i} className="flex justify-between items-center text-base text-gray-700">
											<span className="font-medium">{item.name}</span>
											<span className="text-gray-500">
												{item.qty} × ₹{item.price} = <strong className="text-gray-800">₹{item.total}</strong>
											</span>
										</li>
									))}
								</ul>
							</div>

							{/* Total Amount */}
							<div className="flex justify-between items-center py-3 px-4 bg-gray-800 text-white rounded-xl mb-4">
								<span className="text-lg font-medium">Total Amount</span>
								<span className="text-2xl font-bold">₹{order.total}</span>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-6">
								{/* Paid Checkbox - only for unpaid orders */}
								{!order.paymentDone && (
									<label className="flex items-center gap-3 cursor-pointer text-base font-medium text-gray-600 hover:text-green-600 transition-colors">
										<input
											type="checkbox"
											checked={order.paymentDone}
											onChange={() => togglePayment(order.id)}
											className="w-5 h-5 accent-green-500 cursor-pointer"
										/>
										Mark as Paid
									</label>
								)}

								{/* Undo Payment Button - only for paid orders */}
								{order.paymentDone && (
									<button
										onClick={() => togglePayment(order.id)}
										className="flex items-center gap-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium transition-all"
									>
										↩️ Undo Payment
									</button>
								)}

								{/* Delete Button - only for unpaid orders */}
								{!order.paymentDone && (
									<button
										onClick={() => deleteOrder(order.id)}
										className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-all"
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
