import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Billing from "./pages/Billing";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";

function App() {
  const [orders, setOrders] = useState([]);

  return (
    <>
      <Navbar />
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
