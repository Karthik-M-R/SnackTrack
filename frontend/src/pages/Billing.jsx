import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { snacks } from "../data/snacks";
import SnackCard from "../components/SnackCard";
import BillSummary from "../components/BillSummary";


function Billing({ setOrders }) {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (snackId, qty) => {
    setQuantities((prev) => ({
      ...prev,
      [snackId]: qty,
    }));
  };
  const subtotal = snacks.reduce((sum, snack) => {
    const qty = quantities[snack.id] || 0;
    return sum + snack.price * qty;
  }, 0);

  const handleCreateOrder = () => {
    if (subtotal === 0) return;

    const orderItems = snacks
      .filter(snack => quantities[snack.id] > 0)
      .map(snack => ({
        name: snack.name,
        qty: quantities[snack.id],
        price: snack.price,
        total: snack.price * quantities[snack.id]
      }));

    const newOrder = {
      id: Date.now(),
      items: orderItems,
      total: subtotal,
      paymentDone: false,
      createdAtFull: new Date(),
      createdAtDate: new Date().toDateString()
    };

    setOrders(prev => [...prev, newOrder]);
    setQuantities({});  // Reset form
    navigate('/orders');  // Redirect to Orders page
  };

  return (
    <div className="p-6 min-h-screen pb-24">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Create Order</h1>

        <div className="space-y-4">
          {snacks.map((snack) => (
            <SnackCard
              key={snack.id}
              snack={snack}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>

        <BillSummary subtotal={subtotal} />
        <button
          onClick={handleCreateOrder}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded"
        >
          Create Order
        </button>
      </div>
    </div>
  );
}

export default Billing;
