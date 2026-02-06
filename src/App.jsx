import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Billing from './pages/Billing.jsx'
import Orders from './pages/Orders.jsx'

function App() {
  return (
    <>
      <div className="mesh-background" />
      <Navbar />
      <Routes>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/billing' element={<Billing />} />
        <Route path='/orders' element={<Orders />} />
      </Routes>
    </>
  )
}

export default App
