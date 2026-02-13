// Dashboard routes
import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";
import { sendTelegramMessage } from "../services/telegram_service.js"; // ✅ FIX
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

// Owner only
router.get(
    "/summary",
    protect,
    authorize("owner"),
    getDashboardSummary
);

// Test route
router.get("/test-daily-summary", async (req, res) => {
    await sendTelegramMessage("🧪 Test: Daily summary working!");
    res.json({ ok: true });
});

export default router;
