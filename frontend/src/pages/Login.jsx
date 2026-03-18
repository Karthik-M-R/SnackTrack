import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Login() {
    const navigate = useNavigate();
    const [posId, setPosId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { data } = await API.post("/auth/login", {
                email: posId,
                password
            });

            // store auth data
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);
            localStorage.setItem("email", data.user.email);

            // redirect based on role
            if (data.user.role === "owner") {
                navigate("/dashboard");
            } else {
                navigate("/billing");
            }

        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed"
            );
        } finally {
            setIsLoading(false);
        }
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
                                {error}
                            </div>
                        )}

                        {/* POS ID */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                POS ID
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your POS ID"
                                value={posId}
                                onChange={(e) => setPosId(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl border"
                            />
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                {/* Demo Credentials */}
                <div className="mt-5 bg-amber-50 dark:bg-slate-700/60 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-5 text-sm">
                    <p className="font-bold text-amber-700 dark:text-amber-400 mb-2">🔑 Demo Credentials</p>
                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                        <p><span className="font-semibold">Owner POS ID:</span> owner@shop.com</p>
                        <p><span className="font-semibold">Staff POS ID:</span> staff@shop.com</p>
                        <p><span className="font-semibold">Password:</span> 123456</p>
                    </div>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
                        These are demo credentials only. For a personal POS system, contact{" "}
                        <a href="mailto:karthikmr135@gmail.com" className="text-orange-500 underline hover:text-orange-600">karthikmr135@gmail.com</a>{" "}
                        or connect on{" "}
                        <a href="https://www.linkedin.com/in/karthik-mr-714558294/" target="_blank" rel="noreferrer" className="text-orange-500 underline hover:text-orange-600">LinkedIn</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
