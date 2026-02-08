import React from "react";
function SnackCard({ snack, onQuantityChange }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 flex gap-4 items-center bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <img
        src={snack.image}
        alt={snack.name}
        className="w-20 h-20 object-cover rounded-lg bg-gray-100"
      />

      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-800">{snack.name}</h3>
        <p className="text-orange-600 font-medium">₹{snack.price}</p>
      </div>

      <input
        type="number"
        min="0"
        defaultValue="0"
        className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-center font-medium"
        onChange={(e) =>
          onQuantityChange(snack.id, Number(e.target.value))
        }
      />
    </div>
  );
}

export default SnackCard;
