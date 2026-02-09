import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ darkMode, toggleDarkMode }) {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path) => {
    return location.pathname === path ? 'text-orange-500 after:w-full' : 'text-gray-600 hover:text-orange-500 after:w-0 hover:after:w-full'
  }

  const isActiveMobile = (path) => {
    return location.pathname === path ? 'text-orange-500 bg-orange-50' : 'text-gray-600 hover:text-orange-500 hover:bg-gray-50'
  }

  const linkStyles = "relative font-medium transition-colors duration-300 py-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-orange-400 after:rounded-full after:transition-all after:duration-300"

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo Section */}
          <Link to="/dashboard" className="flex items-center gap-3 group" onClick={closeMenu}>
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

          {/* Desktop Navigation Links */}
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

          {/* Right Side: Dark Mode Toggle + Mobile Menu */}
          <div className="flex items-center gap-4">

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                // Sun Icon (for light mode)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon Icon (for dark mode)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 text-gray-600 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  // Close Icon (X)
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  // Hamburger Icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 opacity-100 pb-4' : 'max-h-0 opacity-0'
            }`}
        >
          <ul className="flex flex-col gap-2 pt-2 border-t border-gray-200">
            <li>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActiveMobile('/dashboard')}`}
              >
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/billing"
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActiveMobile('/billing')}`}
              >
                🧾 Billing
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActiveMobile('/orders')}`}
              >
                📋 Orders
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
