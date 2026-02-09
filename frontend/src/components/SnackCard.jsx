import React from "react";
function SnackCard({ snack, onQuantityChange }) {
  return (
    <div className="border border-orange-100 dark:border-slate-700 rounded-xl p-4 flex gap-4 items-center bg-white dark:bg-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-slate-900/50 transition-all duration-200">
      <img
        src={snack.image}
        alt={snack.name}
        className="w-20 h-20 object-cover rounded-lg bg-gray-100 dark:bg-slate-700"
      />

      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{snack.name}</h3>
        <p className="text-orange-600 dark:text-orange-400 font-medium">₹{snack.price}</p>
      </div>

      <input
        type="number"
        min="0"
        defaultValue="0"
        className="w-20 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 focus:border-orange-400 dark:focus:border-orange-500 text-center font-medium"
        onChange={(e) =>
          onQuantityChange(snack.id, Number(e.target.value))
        }
      />
    </div>
  );
}

export default SnackCard;
