import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Billing from "./pages/Billing";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";

function App() {
  const [orders, setOrders] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Routes>
        <Route
          path="/billing"
          element={<Billing setOrders={setOrders} />}
        />
        <Route
          path="/orders"
          element={<Orders orders={orders} setOrders={setOrders} />}
        />
        <Route
          path="/dashboard"
          element={<Dashboard orders={orders} />}
        />
      </Routes>
    </>
  );
}

export default App;
