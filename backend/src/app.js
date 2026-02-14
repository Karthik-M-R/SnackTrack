// Express app configuration
import express from "express";
import authRoutes from "./routes/authRoutes.js";


import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import protect from "./middleware/authMiddleware.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";




dotenv.config();

const app = express();

// Security Packages
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// middlewares

// 1. Helmet: Secure HTTP headers (XSS protection, etc.)
app.use(helmet());

// 2. Rate Limiting: Prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api", limiter); // Apply to all API routes

// 3. CORS: Restrict access to specific domains
app.use(cors({
    origin: [
        "http://localhost:5173", // Local Development
        // "https://your-production-url.vercel.app" // ADD PRODUCTION URL HERE
    ],
    credentials: true // Allow cookies/sessions
}));

app.use(express.json());

// basic test route - just for testing
// app.get("/", (req, res) => {
//     res.send("SnackTrack API running");
// });

// 🔴 MongoDB READ + WRITE TEST ROUTE - just for testing
// app.get("/db-test", async (req, res) => {
//     try {
//         const TestSchema = new mongoose.Schema({
//             name: String,
//             createdAt: { type: Date, default: Date.now }
//         });
//
//         const Test =
//             mongoose.models.Test || mongoose.model("Test", TestSchema);
//
//         const doc = await Test.create({ name: "MongoDB OK" });
//         const count = await Test.countDocuments();
//
//         res.json({
//             message: "MongoDB write & read successful",
//             insertedDocument: doc,
//             totalDocuments: count
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "MongoDB test failed",
//             error: error.message
//         });
//     }
// });

app.use("/api/auth", authRoutes);

// app.get("/protected-test", protect, (req, res) => {
//     res.json({
//         message: "Protected route accessed",
//         user: req.user
//     });
// });


app.use("/api/orders", orderRoutes);


app.use("/api/dashboard", dashboardRoutes);





export default app;
