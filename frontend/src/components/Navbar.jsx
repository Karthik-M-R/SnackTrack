import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'text-orange-500 after:w-full' : 'text-gray-600 hover:text-orange-500 after:w-0 hover:after:w-full'
  }

  const linkStyles = "relative font-medium transition-colors duration-300 py-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-orange-400 after:rounded-full after:transition-all after:duration-300"

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
              <img 
                src="/Images/Logo.png" 
                alt="SnackTrack Logo" 
                className="object-contain w-full h-full drop-shadow-md"
              />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent tracking-tight">
                SnackTrack
              </span>
              {/* Upward Growth Arrow Icon */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4 text-green-500 mb-1 transform group-hover:-translate-y-1 transition-transform duration-300"
              >
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            </div>
          </Link>

          {/* Navigation Links */}
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <Link to="/dashboard" className={`${linkStyles} ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/billing" className={`${linkStyles} ${isActive('/billing')}`}>
                Billing
              </Link>
            </li>
            <li>
              <Link to="/orders" className={`${linkStyles} ${isActive('/orders')}`}>
                Orders
              </Link>
            </li>
          </ul>

          {/* Mobile Menu Button (Optional placeholder) */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

