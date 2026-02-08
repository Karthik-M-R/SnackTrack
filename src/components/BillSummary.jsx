import React from "react";

function BillSummary({ subtotal }) {
  const TAX_RATE = 0.05; // 5%
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between mb-3 text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between mb-4 text-gray-600">
          <span>Tax (5%)</span>
          <span className="font-medium">₹{tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-dashed border-gray-300 my-3"></div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold text-gray-800">Total</span>
          <span className="text-2xl font-bold text-orange-600">₹{total.toFixed(2)}</span>
        </div>

      </div>
    </div>
  );
}

export default BillSummary;
