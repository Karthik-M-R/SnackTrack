import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Hardcoded credentials (will be replaced with backend later)
    const USERS = {
        "owner@snacktrack.com": { password: "owner123", role: "owner" },
        "staff@snacktrack.com": { password: "staff123", role: "staff" },
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            const user = USERS[email.toLowerCase()];

            if (user && user.password === password) {
                // Store auth data
                localStorage.setItem("token", "demo-token-" + Date.now());
                localStorage.setItem("role", user.role);
                localStorage.setItem("email", email.toLowerCase());

                // Redirect based on role
                if (user.role === "owner") {
                    navigate("/dashboard");
                } else {
                    navigate("/billing");
                }
            } else {
                setError("Invalid email or password");
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/Images/Logo.png"
                            alt="SnackTrack Logo"
                            className="w-16 h-16 drop-shadow-lg"
                        />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                        SnackTrack
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Sign in to your account
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-orange-100/50 dark:border-slate-700/50">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-900 focus:border-orange-400 dark:focus:border-orange-500 outline-none transition-all duration-200"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-900 focus:border-orange-400 dark:focus:border-orange-500 outline-none transition-all duration-200"
                            />
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-200 dark:shadow-orange-900/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4 font-medium uppercase tracking-wide">
                            Demo Credentials
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-violet-50 dark:bg-violet-900/30 rounded-xl p-3 text-center">
                                <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">👑 Owner</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">owner@snacktrack.com</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">owner123</p>
                            </div>
                            <div className="bg-cyan-50 dark:bg-cyan-900/30 rounded-xl p-3 text-center">
                                <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-1">👤 Staff</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">staff@snacktrack.com</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">staff123</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-6">
                    © 2026 SnackTrack. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default Login;
