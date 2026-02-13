import cron from "node-cron";
import { sendTelegramMessage } from "../services/telegram_service.js";
import { buildDailySummary } from "../services/dashboard_summary_service.js";

// Prevent duplicate cron jobs in nodemon
if (global.dailySummaryJobStarted) {
    console.log("Daily summary job already running");
} else {
    global.dailySummaryJobStarted = true;

    // Run at 10:00 PM every day
    cron.schedule("0 22 * * *", async () => {
        try {
            console.log("⏰ Running daily summary job...");
            const summary = await buildDailySummary();

            const message = `
🙏 Namasthe Boss

📊 Today's Summary
💰 Earnings: ₹${summary.todayEarnings}
📦 Paid Orders: ${summary.totalPaidOrders}
⏳ Pending Orders: ${summary.pendingOrders}
🔥 Top Snack: ${summary.topSnack}

Good night 🌙
      `;

            await sendTelegramMessage(message);
            // console.log("Daily summary sent to Telegram"); // just for testing
        } catch (error) {
            console.error("Error in daily summary job:", error);
        }
    }, {
        timezone: "Asia/Kolkata"
    });
}
