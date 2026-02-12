import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { snacks } from "../data/snacks";
import SnackCard from "../components/SnackCard";
import BillSummary from "../components/BillSummary";
import API from "../api/api";

function Billing() {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({});
  const [creating, setCreating] = useState(false);

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

  const handleCreateOrder = async () => {
    if (subtotal === 0) return;

    const orderItems = snacks
      .filter(snack => quantities[snack.id] > 0)
      .map(snack => ({
        name: snack.name,
        qty: quantities[snack.id],
        price: snack.price,
        total: snack.price * quantities[snack.id]
      }));

    setCreating(true);
    try {
      await API.post("/orders", {
        items: orderItems,
        totalAmount: subtotal
      });
      setQuantities({});  // Reset form
      navigate('/orders');  // Redirect to Orders page
    } catch (err) {
      console.error("Failed to create order", err);
      alert("Failed to create order. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 min-h-screen pb-24 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-orange-100/50 dark:border-slate-700/50">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Create Order</h1>

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
          disabled={creating || subtotal === 0}
          className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-green-200 dark:shadow-green-900/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? "Creating Order..." : "Create Order"}
        </button>
      </div>
    </div>
  );
}

export default Billing;
