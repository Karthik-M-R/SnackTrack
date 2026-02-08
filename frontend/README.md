🚀 Project Overview: SnackTrack
SnackTrack is a specialized Point of Sale (POS) and business intelligence tool designed to streamline operations for small-scale retail food outlets. It moves beyond simple paper-billing by digitizing the entire order lifecycle—from item selection to payment tracking and growth analysis.

🛑 The Problem
Small snack shop owners often face three major challenges:

Revenue Leakage: Orders are placed, but in a rush, it’s hard to track who has paid and who is still eating.

Lack of Insights: Business owners don't know exactly which snacks are their "best-sellers" or how their daily revenue is growing.

Manual Reporting: Calculating the day's profit at night is a manual, error-prone task.

✅ The Solution
SnackTrack solves these by providing:

High-Speed POS Interface: A grid-based UI that allows for 2-click billing.

Order Lifecycle Management: An "Order Queue" that keeps track of unpaid bills until a "Payment Done" confirmation is triggered.

Automated Analytics: Instant visualization of earnings and product performance through interactive charts.

Telegram Integration: Automated daily sales summaries sent directly to the owner's phone.

🛠️ The Technical Flow
1. The Billing Engine (Frontend Logic)
User selects items from a dynamic grid.

State is managed locally using React Hooks, calculating subtotals and taxes (GST) in real-time.

When "Place Order" is clicked, a new document is created in the database with a status: "Pending".

2. The Order Queue (State Transition)
The system displays a list of active orders.

The owner can toggle the "Payment Done" status, which transitions the order from Pending to Completed.

This ensures that only actually paid money is reflected in the business graphs.

3. Data Visualization (The Dashboard)
The system aggregates data from the MongoDB collections.

Recharts is used to plot daily earnings and category-wise sales (Pie Charts), allowing the owner to make data-driven decisions on stock.

4. Automated Reporting (The Backend Task)
A Node-Cron job runs a daily script at the shop’s closing time.

It calculates the day's "Paid" total and sends a formatted message to the owner via the Telegram Bot API.