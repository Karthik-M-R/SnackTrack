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

// middlewares
app.use(cors());
app.use(express.json());

// basic test route
app.get("/", (req, res) => {
    res.send("SnackTrack API running");
});

// 🔴 MongoDB READ + WRITE TEST ROUTE
app.get("/db-test", async (req, res) => {
    try {
        const TestSchema = new mongoose.Schema({
            name: String,
            createdAt: { type: Date, default: Date.now }
        });

        const Test =
            mongoose.models.Test || mongoose.model("Test", TestSchema);

        const doc = await Test.create({ name: "MongoDB OK" });
        const count = await Test.countDocuments();

        res.json({
            message: "MongoDB write & read successful",
            insertedDocument: doc,
            totalDocuments: count
        });
    } catch (error) {
        res.status(500).json({
            message: "MongoDB test failed",
            error: error.message
        });
    }
});

app.use("/api/auth", authRoutes);

app.get("/protected-test", protect, (req, res) => {
    res.json({
        message: "Protected route accessed",
        user: req.user
    });
});


app.use("/api/orders", orderRoutes);


app.use("/api/dashboard", dashboardRoutes);





export default app;
