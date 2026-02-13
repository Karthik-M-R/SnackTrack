// Server entry point
import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { sendTelegramMessage } from "./src/services/telegram_service.js";
import "./src/jobs/daily_summary_job.js";




dotenv.config();

const PORT = process.env.PORT || 5000;

// connect DB
connectDB();

// start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// sendTelegramMessage("✅ SnackTrack backend is connected to Telegram!");