# SNACKTRACK INTERVIEW DEFENSE MANUAL

> **Purpose:** A complete, codebase-verified interview preparation handbook for SnackTrack.
> **Rule:** Every claim in this document is backed by actual code found in the repository.
> Claims that cannot be verified are explicitly marked **NOT VERIFIED**.
> Partial implementations are marked **PARTIALLY VERIFIED**.

---

# TABLE OF CONTENTS

1. [Codebase Inventory](#1-codebase-inventory)
2. [What Exactly Is SnackTrack?](#2-what-exactly-is-snacktrack)
3. [Complete System Architecture](#3-complete-system-architecture)
4. [Complete User Journeys](#4-complete-user-journeys)
5. [Feature-by-Feature Deep Dive](#5-feature-by-feature-implementation)
6. [POS and Billing Architecture](#6-pos-and-billing-architecture)
7. [Order Management](#7-order-management)
8. [Payment Tracking](#8-payment-tracking)
9. [MongoDB Database Design](#9-mongodb-database-design)
10. [Mongoose ODM Deep Dive](#10-mongoose-odmdeep-dive)
11. [Authentication](#11-authentication)
12. [Role-Based Access Control](#12-authorization-and-role-based-access-control)
13. [Analytics Engine](#13-analytics-dashboard-and-engine)
14. [MongoDB Aggregation Pipeline Analysis](#14-mongodb-aggregation-used-in-snacktrack)
15. [React Frontend Architecture](#15-react-frontend-architecture)
16. [Telegram Automation](#16-telegram-automation)
17. [Security Analysis](#17-security-analysis)
18. [API Security Middleware](#18-api-security-middleware)
19. [Complete API Reference](#19-complete-api-reference)
20. [Error Handling and Edge Cases](#20-error-handling-and-edge-cases)
21. [Deployment and Production Architecture](#21-deployment-and-production-architecture)
22. [CI/CD Analysis](#22-cicd-analysis)
23. [Resume Bullet-by-Bullet Defense](#23-resume-bullet-by-bullet-defense)
24. [Interview Question Bank](#24-snacktrack-interview-question-bank)
25. [Brutal Mock Interview](#25-brutal-snacktrack-mock-interview)
26. [Personal Contribution](#26-how-to-explain-my-contribution)
27. [Engineering Decisions and Trade-offs](#27-engineering-decisions-and-trade-offs)
28. [Limitations and Future Improvements](#28-current-limitations-and-future-improvements)
29. [Interview Cheat Sheets](#29-snacktrack-interview-cheat-sheets)
30. [Implementation Verification Report](#30-implementation-verification-report)

---

# 1. CODEBASE INVENTORY

## 1.1 Meaningful Folder Structure

```
SnackTrack/
├── About.md                          ← Detailed technical reference doc (exists in repo)
├── Architecture.md                   ← System architecture diagrams (exists in repo)
├── README.md                         ← Public-facing project documentation
├── Demo/                             ← Screenshot images for README/portfolio
│   ├── BIlling.png
│   ├── Dashboard.png
│   ├── Login_Page.png
│   ├── Orders.png
│   └── Staff_Light_mode.png
│
├── backend/
│   ├── server.js                     ← Entry point: loads env, connects DB, starts Express, registers cron
│   ├── package.json                  ← Backend dependencies and scripts
│   ├── .env                          ← Secrets (MongoDB URI, JWT secret, Telegram tokens)
│   └── src/
│       ├── app.js                    ← Express app: middleware setup, route registration
│       ├── config/
│       │   ├── db.js                 ← mongoose.connect() — single function connecting to Atlas
│       │   └── env.js                ← Empty placeholder file (env loaded via dotenv in server.js)
│       ├── controllers/
│       │   ├── authController.js     ← loginUser function (register is commented out)
│       │   ├── orderController.js    ← createOrder, getOrders, markOrderPaid, undoPayment, deleteOrder
│       │   └── dashboardController.js← getDashboardSummary — all analytics computed here in JS
│       ├── middleware/
│       │   ├── authMiddleware.js     ← protect: extracts/verifies JWT, attaches req.user
│       │   └── roleMiddleware.js     ← authorize(...roles): checks req.user.role
│       ├── models/
│       │   ├── User.js               ← User schema: email, password (bcrypt hashed), role enum
│       │   └── Order.js              ← Order schema: items[], totalAmount, orderId, paymentDone, createdBy
│       ├── routes/
│       │   ├── authRoutes.js         ← POST /api/auth/login
│       │   ├── orderRoutes.js        ← CRUD for /api/orders (protect + authorize)
│       │   └── dashboardRoutes.js    ← GET /api/dashboard/summary (owner only)
│       ├── services/
│       │   ├── dashboard_summary_service.js ← buildDailySummary(): today's earnings, top snack
│       │   └── telegram_service.js          ← sendTelegramMessage(): HTTP POST to Telegram Bot API via axios
│       ├── jobs/
│       │   └── daily_summary_job.js  ← node-cron at "0 22 * * *" IST — triggers daily Telegram report
│       └── utils/
│           └── generateToken.js      ← jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" })
│
└── frontend/
    ├── index.html                    ← Single HTML shell with <div id="root">
    ├── package.json                  ← Frontend dependencies (React 19, Vite 7, Tailwind 4, Recharts 3, Axios)
    ├── vite.config.js                ← Vite + React plugin + Tailwind CSS plugin
    ├── vercel.json                   ← SPA rewrite rule: all routes → index.html
    └── src/
        ├── main.jsx                  ← ReactDOM.createRoot → <BrowserRouter><App/>
        ├── App.jsx                   ← Route definitions, dark mode state, Navbar conditional render
        ├── index.css                 ← Global CSS (Tailwind base + dark mode utilities)
        ├── api/
        │   └── api.js                ← Axios instance with baseURL (Render), request interceptor (JWT)
        ├── data/
        │   └── snacks.js             ← Hardcoded array of 7 snack items (id, name, price, image)
        ├── pages/
        │   ├── Login.jsx             ← Login form → POST /api/auth/login → localStorage → redirect
        │   ├── Billing.jsx           ← POS screen: snack grid + local cart state + order creation
        │   ├── Orders.jsx            ← Fetches all orders, mark paid/unpay/delete, separated pending/completed
        │   └── Dashboard.jsx         ← Fetches /dashboard/summary → renders 6 Recharts charts + stat cards
        └── components/
            ├── Navbar.jsx            ← Role-aware nav (owner sees Dashboard link), logout, dark mode
            ├── SnackCard.jsx         ← Single snack row: image, name, price, quantity input
            └── BillSummary.jsx       ← Displays subtotal, 5% tax, and total (UI display only)
```

### Folder Responsibilities Summary

| Folder                    | Responsibility             | Key Files                                             | Used By                        |
| ------------------------- | -------------------------- | ----------------------------------------------------- | ------------------------------ |
| `backend/src/controllers` | Business logic execution   | `orderController.js`, `dashboardController.js`        | All route handlers             |
| `backend/src/middleware`  | Request filtering / gating | `authMiddleware.js`, `roleMiddleware.js`              | All protected routes           |
| `backend/src/models`      | MongoDB schema definitions | `User.js`, `Order.js`                                 | Controllers, services          |
| `backend/src/routes`      | URL-to-controller mapping  | `orderRoutes.js`, `dashboardRoutes.js`                | `app.js`                       |
| `backend/src/services`    | Shared reusable logic      | `dashboard_summary_service.js`, `telegram_service.js` | Dashboard controller, cron job |
| `backend/src/jobs`        | Scheduled background tasks | `daily_summary_job.js`                                | Imported in `server.js`        |
| `backend/src/utils`       | Small utility functions    | `generateToken.js`                                    | Auth controller                |
| `backend/src/config`      | Configuration bootstrap    | `db.js`                                               | `server.js`                    |
| `frontend/src/pages`      | Full page components       | `Billing.jsx`, `Dashboard.jsx`                        | React Router routes            |
| `frontend/src/components` | Reusable UI components     | `Navbar.jsx`, `SnackCard.jsx`                         | Pages                          |
| `frontend/src/api`        | Centralized HTTP client    | `api.js`                                              | All pages making API calls     |
| `frontend/src/data`       | Static hardcoded data      | `snacks.js`                                           | `Billing.jsx`                  |

---

## 1.2 Technology Stack — VERIFIED

| Technology             | Version (from package.json) | Actual Usage                           | Why Used in THIS Project                          | Key Files                               |
| ---------------------- | --------------------------- | -------------------------------------- | ------------------------------------------------- | --------------------------------------- |
| **Node.js**            | v18+ (required)             | Backend runtime                        | JavaScript server-side execution                  | `server.js`, all backend                |
| **Express.js**         | ^5.2.1                      | HTTP server, routing, middleware       | Lightweight REST API framework                    | `app.js`, all route files               |
| **MongoDB** (Atlas)    | Cloud                       | Persistent data store                  | Document storage for orders and users             | Configured via `MONGO_URI` env var      |
| **Mongoose**           | ^9.1.6                      | ODM — schema definitions, queries      | Structured access to MongoDB                      | `User.js`, `Order.js`, all controllers  |
| **bcryptjs**           | ^3.0.3                      | Password hashing in `pre("save")` hook | Secure password storage                           | `User.js`                               |
| **jsonwebtoken**       | ^9.0.3                      | JWT sign/verify                        | Stateless authentication                          | `generateToken.js`, `authMiddleware.js` |
| **node-cron**          | ^4.2.1                      | Cron scheduler at 10 PM IST            | Automated daily Telegram report                   | `daily_summary_job.js`                  |
| **axios** (backend)    | ^1.13.5                     | HTTP POST to Telegram Bot API          | Sends Telegram messages                           | `telegram_service.js`                   |
| **helmet**             | ^8.1.0                      | Adds 11 security HTTP headers          | Protects against common web attacks               | `app.js`                                |
| **express-rate-limit** | ^8.2.1                      | 100 req/15min per IP on `/api`         | Brute-force and DoS mitigation                    | `app.js`                                |
| **cors**               | ^2.8.6                      | Cross-origin request policy            | Allows frontend (Vercel) to call backend (Render) | `app.js`                                |
| **dotenv**             | ^17.2.4                     | Loads `.env` file into `process.env`   | Secret management                                 | `server.js`, `app.js`                   |
| **React**              | ^19.2.0                     | Frontend SPA framework                 | Component-based UI                                | `main.jsx`, all page/component files    |
| **react-router-dom**   | ^7.13.0                     | Client-side routing                    | Multi-page SPA navigation                         | `App.jsx`, `Navbar.jsx`, all pages      |
| **Recharts**           | ^3.7.0                      | Chart rendering library                | Bar, Pie/Donut, Area charts in Dashboard          | `Dashboard.jsx`                         |
| **axios** (frontend)   | ^1.13.5                     | HTTP client with interceptors          | All API calls from frontend                       | `api.js`                                |
| **Vite**               | ^7.2.4                      | Build tool and dev server              | Fast bundling and HMR                             | `vite.config.js`                        |
| **Tailwind CSS**       | ^4.1.18                     | Utility-first CSS framework            | All UI styling                                    | `index.css`, all JSX files              |
| **nodemon** (dev)      | ^3.1.11                     | Auto-restart on file changes           | Development convenience                           | Dev script in `package.json`            |

> **NOTE:** `@tailwindcss/vite` is used as a Vite plugin, not the traditional PostCSS setup. This is the Tailwind v4 integration approach.

---

# 2. WHAT EXACTLY IS SNACKTRACK?

## Business Context (Verified from Code)

**What real-world problem does it solve?**

Small Indian food stalls and snack shops typically manage billing with paper and cash registers. There's no way to track what was sold, when, or how much money came in. A day ends and the owner has no data. SnackTrack replaces this with a digital POS that tracks every order, records payment status, and sends the owner an evening summary on Telegram.

**Who uses it?**

Exactly two types of users, enforced at the schema level:

- **Owner** (`role: "owner"`) — has access to Dashboard (analytics), Billing, and Orders
- **Staff** (`role: "staff"`) — has access to Billing and Orders only

Both roles log in with an email (called "POS ID" in the UI) and password. There is no self-registration — accounts are pre-seeded in the database.

**What type of food business?**

A single snack stall serving 7 hardcoded items: Tea/Coffee (₹15), Pakoda (₹25), Samosa (₹15), Kachori (₹20), Pav Bhaji (₹60), Vada Pav (₹25), and Sandwich (₹40). These are Indian street food items, priced for a small stall.

**What can an owner do?** (verified from `Navbar.jsx`, `dashboardRoutes.js`)

- View Dashboard analytics: today's earnings, monthly earnings, last 7 days trend, top-selling items, peak hours, payment status, top revenue generators
- Create billing orders (Billing page)
- Manage orders: mark paid, undo payment, delete unpaid orders

**What can a staff member do?** (verified from `Navbar.jsx`, `orderRoutes.js`)

- Create billing orders (Billing page)
- View and manage orders: mark paid, undo payment, delete unpaid orders
- Staff CANNOT access Dashboard (owner-only API, returns 403)

**What happens during a typical sale?**

1. Staff opens the Billing page and sees 7 snack cards
2. Staff enters quantities in number inputs for each item
3. The subtotal is computed live as quantities change
4. BillSummary shows: subtotal, 5% tax, and total
5. Staff clicks "Create Order"
6. Frontend POSTs to `/api/orders` with items and totalAmount (pre-tax subtotal)
7. Backend creates an Order document and redirects staff to Orders page
8. Customer pays; staff clicks "Mark as Paid" on the order

**IMPORTANT INCONSISTENCY FOUND:** `BillSummary.jsx` displays a 5% tax and shows the total including tax to the user on screen. However, `Billing.jsx` sends `totalAmount: subtotal` (the pre-tax amount) to the backend. The `totalAmount` stored in MongoDB does NOT include the 5% tax displayed on screen. This is a real bug/inconsistency in the implementation.

**What business information does the application track?**

- All orders with their exact items, quantities, prices, and timestamps
- Payment status (paid vs. pending) per order
- Which user created each order (`createdBy` reference to User)
- Daily, monthly, and 7-day revenue trends
- Top-selling snacks by quantity
- Peak business hours (8 AM – 10 PM)
- Top revenue-generating items by money earned

**How does the analytics system provide value?**

The owner sees a Dashboard (owner-only) showing:

- Today's paid earnings
- This month's paid earnings
- Total and pending order counts
- Average order value (today's earnings / today's paid orders)
- Bar chart: last 7 days earnings
- Donut chart: top 6 selling snacks by quantity
- Area chart: orders per hour (peak hours)
- Donut chart: paid vs. pending payment status ratio
- Progress bars: top 5 revenue-generating items
- Quick insights panel: conversion rate, monthly revenue, best performer

**What does Telegram automation add?**

At 10:00 PM IST every night, a `node-cron` job fires automatically. It queries today's paid orders, calculates earnings and top snack, and sends a formatted message to the owner's Telegram. The message reads: "Namasthe Boss, Today's Summary, Earnings: ₹X, Paid Orders: N, Pending: M, Top Snack: [name]".

---

## A. One-Line Project Description

SnackTrack is a full-stack MERN POS and analytics system for a single Indian snack stall, with JWT-authenticated roles for owner and staff, a billing interface with local cart state, real-time order management, an analytics dashboard with Recharts visualizations, and automated daily Telegram summaries via a node-cron job.

---

## B. 30-Second Interview Pitch

"SnackTrack is a web-based Point of Sale system I built for small Indian snack stalls. The problem is that these businesses have no digital way to track what they're selling or how much money they're making. I built a full-stack MERN app where staff can create orders using a grid-based billing screen, and owners get a live analytics dashboard showing daily and monthly earnings, their top-selling items, and peak hours. I also integrated a Telegram bot that sends the owner an automatic daily summary at 10 PM every night. On the technical side, I implemented JWT authentication with role-based access control, bcrypt password hashing, and API security middleware including Helmet, CORS configuration, and rate limiting."

---

## C. 1-Minute Interview Explanation

"SnackTrack solves a real problem for small food businesses: they have no visibility into their own sales data. I built a complete POS system using the MERN stack — MongoDB, Express, React, and Node.js.

The system has two user roles, owner and staff, enforced with JWT tokens and middleware. Staff log in and get a billing screen where they can quickly enter quantities for 7 menu items. When they hit 'Create Order', that order gets saved to MongoDB with all the items, quantities, prices, and a timestamp. Then on the Orders page, staff can track whether each order has been paid or is still pending.

The owner has an additional Dashboard that shows charts built with Recharts — earnings trends, top-selling items, peak hours, and revenue generators. All of this data is computed server-side by querying the Orders collection.

The most unique feature is the automated Telegram reporting. I used node-cron to schedule a job that fires every night at 10 PM, queries today's sales, and sends the owner a summary message directly to their phone via the Telegram Bot API. The backend is deployed on Render and the frontend on Vercel."

---

## D. 2-Minute Detailed Explanation

"Let me walk you through the entire system.

**Frontend:** Built with React 19 using Vite as the build tool. Styled entirely with Tailwind CSS v4. The app has four pages: Login, Billing, Orders, and Dashboard. React Router handles navigation. When the user logs in, the JWT token, role, and email are stored in localStorage. The role determines what the Navbar shows — only owners see the Dashboard link.

**Authentication:** Login posts to `/api/auth/login`. The backend looks up the user in MongoDB, compares the password using bcryptjs, and if it matches, returns a JWT token that contains only the user's MongoDB ObjectId. The token expires in 7 days. Every subsequent API request includes this token in the Authorization header, and my `protect` middleware verifies it before any controller runs.

**Billing and Orders:** The billing page maintains local React state — a `quantities` object mapping snack IDs to quantities. The total is derived on every render, not stored separately. When 'Create Order' is clicked, the backend receives the items array and totalAmount. The backend also auto-generates a daily orderId by finding the last order created today and incrementing its ID. The order is saved to MongoDB with a reference to the creating user.

**Analytics:** The Dashboard is owner-only, enforced by the `authorize("owner")` middleware. The backend loads all orders from MongoDB, filters to paid-only, and computes all metrics in JavaScript using array methods — filter, reduce, forEach, sort. The results are returned as one large JSON object and rendered with six different chart types in Recharts.

**Telegram:** node-cron runs a job every night at 10 PM IST. It calls the same `buildDailySummary` function used by the dashboard, formats the results into a text message, and sends it to the owner's Telegram chat ID using axios to call the Telegram Bot API.

**Security:** Helmet sets 11 security headers. CORS is configured to only allow the Vercel frontend domain. Rate limiting allows 100 requests per 15 minutes per IP on all `/api` routes. Passwords are hashed with bcrypt (10 salt rounds). The register endpoint is deliberately commented out to prevent unauthorized account creation."

---

## E. 5-Minute Technical Walkthrough

"Let me trace what happens from the moment a user opens the browser to a complete sale being recorded.

**Step 1 — Frontend Boot:**
`main.jsx` calls `createRoot(document.getElementById('root')).render(...)`, mounting the React app inside a `BrowserRouter`. `App.jsx` is the root component, which holds dark mode state in `localStorage` and uses `useEffect` to apply or remove a `dark` class on the document body. It renders a `Navbar` (unless on `/login`) and four routes.

**Step 2 — Login:**
The user lands on `/login`, which redirects from `/` via `<Navigate to="/login">`. The `Login.jsx` page shows a form with a 'POS ID' field (which is actually an email) and a password. On submit, it calls `API.post("/auth/login", { email: posId, password })`. The `API` object is an Axios instance configured in `api.js` with a base URL pointing to the Render deployment. A request interceptor automatically attaches the JWT from localStorage to every request as `Authorization: Bearer <token>`.

**Step 3 — Backend Login Processing:**
The request hits `POST /api/auth/login`. In `app.js`, this passes through CORS (allows the Vercel origin), Helmet (sets security headers), rate limiting (allows if under 100/15min). The `loginUser` controller in `authController.js` extracts `email` and `password`, uses `User.findOne({ email })`, calls `user.matchPassword(password)` (which runs `bcrypt.compare`), and if successful, returns a JSON with the token and `{ id, email, role }`.

**Step 4 — Post-Login Redirect:**
Back in `Login.jsx`, the response is received. `localStorage.setItem("token", data.token)` stores the JWT. `localStorage.setItem("role", data.user.role)` stores the role. If role is `"owner"`, the user is redirected to `/dashboard`. If `"staff"`, to `/billing`.

**Step 5 — Creating an Order (Staff):**
`Billing.jsx` renders all 7 snack items from the hardcoded `snacks.js` array using `SnackCard` components. Each `SnackCard` has a number input. When a quantity changes, `handleQuantityChange(snackId, qty)` calls `setQuantities(prev => ({ ...prev, [snackId]: qty }))`. The `subtotal` is computed on every render with `snacks.reduce(...)`. `BillSummary.jsx` shows the subtotal, 5% tax, and total. When 'Create Order' is clicked, `handleCreateOrder` filters snacks with qty > 0, maps to item objects with `{ name, qty, price, total }`, and calls `API.post("/orders", { items: orderItems, totalAmount: subtotal })`.

**Step 6 — Order Creation on Backend:**
`POST /api/orders` passes through `protect` (extracts JWT, attaches user as `req.user`), then `authorize("owner", "staff")` (both roles allowed). The `createOrder` controller finds today's last order to determine the next `orderId`, then calls `Order.create({ items, totalAmount, orderId, createdBy: req.user._id })`. Returns 201 with the created order document.

**Step 7 — Orders Page:**
On redirect to `/orders`, `Orders.jsx` calls `API.get("/orders")` via `useEffect`. The `getOrders` controller returns all orders sorted by `createdAt: -1`, with `createdBy` populated to show `email` and `role`. Frontend separates them into `pendingOrders` (paymentDone: false) and `completedOrders` (paymentDone: true). Each order card shows items, total, timestamp, and action buttons.

**Step 8 — Dashboard (Owner):**
`Dashboard.jsx` calls `API.get("/dashboard/summary")` on mount. Backend: `protect` + `authorize("owner")` — staff gets 403. `getDashboardSummary` calls `buildDailySummary()`, then loads ALL orders with `Order.find()`, filters paid orders, and computes in JavaScript: today's earnings, monthly earnings, last 7 days, top 6 snacks, peak hours (8–22), payment status ratio, top 5 revenue items. One large JSON response is sent back. Dashboard renders it with `BarChart`, `PieChart`, `AreaChart` from Recharts, plus stat cards.

**Step 9 — Nightly Telegram Report:**
At 10 PM IST, the `node-cron` job registered at server startup fires. `buildDailySummary()` queries MongoDB for today's paid orders and counts pending. A formatted message is constructed and sent via `axios.post` to `https://api.telegram.org/bot{TOKEN}/sendMessage` with the owner's `chat_id`. The owner receives: earnings, paid count, pending count, top snack."

---

# 3. COMPLETE SYSTEM ARCHITECTURE

## Architecture Diagram (Verified from Code)

```
USERS
  │
  ├── Owner Browser (Vercel: https://snack-track-theta.vercel.app)
  │     │
  │     └── React SPA (Vite build)
  │           ├── Login Page         → POST /api/auth/login
  │           ├── Billing Page       → POST /api/orders
  │           ├── Orders Page        → GET/PATCH/DELETE /api/orders
  │           └── Dashboard Page     → GET /api/dashboard/summary (owner only)
  │
  └── Staff Browser (same URL, different routes available)
        └── React SPA (same build, role-filtered nav)
              ├── Login Page
              ├── Billing Page
              └── Orders Page

          ↓  HTTPS (Axios with JWT in Authorization header)

BACKEND (Render: https://snacktrack-backend-y8nw.onrender.com)
  │
  ├── server.js                 ← Entry: loads env, connects DB, starts app, registers cron
  │
  └── src/app.js                ← Express middleware chain:
        1. CORS (origin whitelist)
        2. Helmet (security headers)
        3. Rate Limiter (100/15min per IP on /api)
        4. express.json()
        │
        ├── /api/auth           → authRoutes.js
        │     └── POST /login   → authController.loginUser (no auth required)
        │
        ├── /api/orders         → orderRoutes.js
        │     ├── protect (JWT verify → req.user)
        │     ├── authorize("owner","staff")
        │     ├── POST /          → createOrder
        │     ├── GET /           → getOrders
        │     ├── PATCH /:id/pay  → markOrderPaid
        │     ├── PATCH /:id/unpay→ undoPayment
        │     └── DELETE /:id     → deleteOrder
        │
        └── /api/dashboard      → dashboardRoutes.js
              ├── protect (JWT verify)
              ├── authorize("owner")
              └── GET /summary   → getDashboardSummary
                    │
                    └── buildDailySummary() ← dashboard_summary_service.js

          ↓  Mongoose (mongoose.connect to Atlas)

DATABASE (MongoDB Atlas: cluster0.ur4i6pw.mongodb.net/snacktrack)
  │
  ├── users collection           ← User model (email, hashed password, role)
  └── orders collection          ← Order model (items[], totalAmount, orderId, paymentDone, createdBy)

BACKGROUND JOB (In-process, same Node.js server)
  │
  └── daily_summary_job.js      ← node-cron: "0 22 * * *" IST
        ├── buildDailySummary() ← queries orders collection
        └── sendTelegramMessage()
              │
              └── axios.post    ── → Telegram Bot API (external)
                                          │
                                          ↓
                                   Owner's Telegram App 📱
```

## Layer Responsibilities

### Frontend Layer

**What:** React 19 SPA, Vite-built, Tailwind-styled, hosted on Vercel
**Files:** `main.jsx`, `App.jsx`, `pages/`, `components/`, `api/api.js`
**Data In:** User interactions (clicks, form inputs)
**Processing:** Local state management, UI rendering, API calls via Axios
**Data Out:** HTTP requests with JWT to backend

### Backend Layer

**What:** Node.js + Express 5 REST API, hosted on Render
**Files:** `server.js`, `src/app.js`, `src/controllers/`, `src/routes/`, `src/middleware/`
**Data In:** HTTP requests with JWT tokens and JSON bodies
**Processing:** JWT verification, role checking, business logic, DB queries
**Data Out:** JSON responses, Telegram HTTP requests

### Database Layer

**What:** MongoDB Atlas (cloud), accessed via Mongoose
**Files:** `src/models/User.js`, `src/models/Order.js`, `src/config/db.js`
**Data In:** Mongoose model operations (create, find, save, deleteOne)
**Processing:** Storage, indexing, retrieval
**Data Out:** Mongoose documents / JavaScript objects

### Authentication Layer

**What:** JWT-based stateless authentication
**Files:** `src/utils/generateToken.js`, `src/middleware/authMiddleware.js`
**Data In:** Bearer token in Authorization header
**Processing:** `jwt.verify()`, `User.findById(decoded.id).select("-password")`
**Data Out:** `req.user` object attached for downstream use

### Authorization Layer

**What:** Role-based access control (owner vs. staff)
**Files:** `src/middleware/roleMiddleware.js`
**Data In:** `req.user.role`
**Processing:** `roles.includes(req.user.role)` check
**Data Out:** `next()` or 403 response

### Analytics Layer

**What:** JavaScript-computed business metrics
**Files:** `src/controllers/dashboardController.js`, `src/services/dashboard_summary_service.js`
**Data In:** All orders from MongoDB (`Order.find()`)
**Processing:** In-memory JS: filter, reduce, forEach, sort, slice
**Data Out:** JSON with todayEarnings, monthlyEarnings, last7Days, topSnacks, peakHours, paymentStatus, topRevenueItems

### Automation Layer

**What:** Scheduled nightly reporting
**Files:** `src/jobs/daily_summary_job.js`, `src/services/telegram_service.js`
**Data In:** Time trigger (10 PM IST), MongoDB orders
**Processing:** buildDailySummary(), message formatting
**Data Out:** HTTP POST to Telegram Bot API

---

# 4. COMPLETE USER JOURNEYS

## Journey A — Registration

**NOT APPLICABLE.** Registration is deliberately disabled.

The `registerUser` function exists in `authController.js` but is entirely commented out. The comment explains:

> "Registration is disabled because SnackTrack uses pre-seeded owner/staff accounts (no self-signup needed). Security risk: the endpoint accepted a 'role' field from the request body, meaning anyone could POST { role: 'owner' } and gain full owner access."

The route `router.post("/register", registerUser)` is also commented out in `authRoutes.js`.

**Interview Answer:** "There is no self-registration in SnackTrack. Accounts are pre-created in the database. I disabled the registration endpoint intentionally because the original implementation had a critical security vulnerability — it accepted the `role` field directly from the request body, which would allow anyone to make themselves an owner. Since this is a POS system for a specific stall, there's no need for public sign-up. New accounts, if ever needed, would be created directly in the database by an admin."

---

## Journey B — Login

```
User opens app
  ↓
Browser loads / → App.jsx → <Navigate to="/login"> → Login.jsx renders
  ↓
User types email (POS ID) and password → clicks "Sign In"
  ↓
Login.jsx: handleLogin() called
  e.preventDefault() — prevents page refresh
  setIsLoading(true) — shows "Signing in..."
  ↓
API.post("/auth/login", { email: posId, password })
  ↓ (Axios interceptor checks localStorage for token — none at login time)
  ↓ HTTPS POST to https://snacktrack-backend-y8nw.onrender.com/api/auth/login
  ↓
app.js: CORS check ✓ → Helmet headers set → Rate limit check ✓
  ↓
authRoutes.js: router.post("/login", loginUser)
  ↓
authController.js: loginUser(req, res)
  1. Validates email and password present → 400 if missing
  2. User.findOne({ email }) → null if not found → 401 "Invalid email or password"
  3. user.matchPassword(password) → bcrypt.compare(entered, hashed)
     → false → 401 "Invalid email or password"
     → true → continue
  4. generateToken(user._id) → jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" })
  5. res.json({ token, user: { id, email, role } })
  ↓
Login.jsx: response received
  localStorage.setItem("token", data.token)
  localStorage.setItem("role", data.user.role)
  localStorage.setItem("email", data.user.email)
  ↓
Role-based redirect:
  role === "owner" → navigate("/dashboard")
  role === "staff"  → navigate("/billing")
  ↓ (error case)
  catch: setError(err.response?.data?.message || "Login failed") → shown in red box
  finally: setIsLoading(false)
```

---

## Journey C — Owner Workflow

**Verified from `Navbar.jsx`, `dashboardRoutes.js`, `orderRoutes.js`:**

1. Owner logs in → redirected to `/dashboard`
2. Dashboard link is visible in navbar (`isOwner && <Link to="/dashboard">`)
3. Dashboard loads → `GET /api/dashboard/summary` (owner-only API)
4. Can navigate to `/billing` to create orders themselves
5. Can navigate to `/orders` to see all orders and manage payment status
6. Can delete unpaid orders
7. Receives nightly Telegram summary at 10 PM IST

---

## Journey D — Staff Workflow

**Verified from `Navbar.jsx`, route analysis:**

1. Staff logs in → redirected to `/billing`
2. Dashboard link is NOT visible in navbar (`isOwner` is false)
3. Staff can navigate to `/billing` (create orders)
4. Staff can navigate to `/orders` (view all orders, mark paid, undo, delete unpaid)
5. If staff manually navigates to `/dashboard` in browser:
   - Page renders, `useEffect` fires, API call made
   - Backend returns **403 Forbidden** (authorize("owner") fails)
   - Dashboard shows "Failed to load dashboard data." error message
   - **No sensitive data is exposed**

---

## Journey E — Billing / POS Workflow

```
Staff is on /billing
  ↓
Billing.jsx renders
  ↓
const [quantities, setQuantities] = useState({})   ← empty initially
  ↓
snacks.js array (7 items, hardcoded) is imported
  ↓
Each snack renders as a <SnackCard> component
  (shows: image, name, price, number input defaultValue=0)
  ↓
Staff types a quantity into a number input
  ↓
SnackCard: onChange fires → onQuantityChange(snack.id, Number(e.target.value))
  ↓
Billing.jsx: handleQuantityChange(snackId, qty)
  setQuantities(prev => ({ ...prev, [snackId]: qty }))   ← functional updater
  ↓
React re-renders Billing.jsx
  ↓
subtotal recomputed from scratch:
  const subtotal = snacks.reduce((sum, snack) => {
    const qty = quantities[snack.id] || 0;
    return sum + snack.price * qty;
  }, 0);
  ↓
BillSummary receives subtotal prop
  BillSummary computes:
    const TAX_RATE = 0.05;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
  Displays: Subtotal, Tax (5%), and Total  ← DISPLAYED ONLY, not sent to backend
  ↓
Staff clicks "Create Order"
  ↓
handleCreateOrder() fires
  if (subtotal === 0) return  ← guard against empty order
  ↓
orderItems = snacks
  .filter(snack => quantities[snack.id] > 0)   ← exclude zero-qty items
  .map(snack => ({
    name: snack.name,
    qty: quantities[snack.id],
    price: snack.price,
    total: snack.price * quantities[snack.id]   ← per-item total (pre-tax)
  }));
  ↓
setCreating(true) → button shows "Creating Order..."
  ↓
API.post("/orders", { items: orderItems, totalAmount: subtotal })
  ← NOTE: totalAmount is the PRE-TAX subtotal, NOT the total shown in BillSummary
  ↓ HTTPS POST to backend
  ↓
protect middleware: JWT verified, req.user populated
authorize("owner", "staff"): both roles allowed
  ↓
createOrder(req, res):
  1. Validates items array not empty → 400 if empty
  2. Finds today's last order by timestamp → determines next orderId (sequential per day)
  3. Order.create({ items, totalAmount, orderId, createdBy: req.user._id })
  4. res.status(201).json(order)
  ↓
Frontend receives 201 response
  setQuantities({})  ← clears form
  navigate('/orders')  ← redirects to Orders page
  ↓ (error case)
  console.error("Failed to create order", err)
  alert("Failed to create order. Please try again.")
```

**CRITICAL INCONSISTENCY:** `BillSummary` displays `total = subtotal + 5% tax` to the user. But `Billing.jsx` sends `totalAmount: subtotal` to the backend. MongoDB stores the pre-tax amount. This means:

- What the customer sees on screen (with tax) ≠ what is recorded in the database (without tax)
- Analytics in Dashboard show pre-tax totals
- This is a real implementation inconsistency you must be able to explain honestly in interviews

---

## Journey F — Analytics Workflow

```
Owner navigates to /dashboard
  ↓
Dashboard.jsx renders, useEffect fires:
  const fetchDashboard = async () => {
    const { data } = await API.get("/dashboard/summary");
    setStats(data);
  };
  ↓
API.get("/dashboard/summary")
  + Axios interceptor adds: Authorization: Bearer <token>
  ↓ HTTPS GET to backend
  ↓
protect middleware:
  token = req.headers.authorization.split(" ")[1]
  decoded = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(decoded.id).select("-password")
  ↓
authorize("owner"):
  req.user.role === "owner" ? next() : 403
  ↓
getDashboardSummary(req, res):
  ↓
  Step 1: const summary = await buildDailySummary()
    → queries: Order.find({ paymentDone: true, createdAt: today range })
    → queries: Order.countDocuments({ paymentDone: false, createdAt: today range })
    → computes: todayEarnings, totalPaidOrders, pendingOrders, topSnack
  ↓
  Step 2: const orders = await Order.find()  ← ALL orders into memory
  const paidOrders = orders.filter(o => o.paymentDone)
  ↓
  Step 3: monthlyEarnings
    paidOrders.filter(same month/year).reduce(sum totalAmount)
  ↓
  Step 4: last7Days
    loop i = 6 down to 0:
      d = new Date(); d.setDate(d.getDate() - i)
      earnings = paidOrders.filter(same day string).reduce(sum)
      push { day: weekday label, earnings }
  ↓
  Step 5: topSnacks
    snackMap = {} — built from all paidOrders items
    sort by qty desc → slice top 6
  ↓
  Step 6: peakHours
    hourMap = {} for hours 8-22
    paidOrders.forEach → bucket by hour
    output: [{ hour: "8:00", orders: N }, ...]
  ↓
  Step 7: paymentStatus = { paid, pending }
  ↓
  Step 8: topRevenueItems
    revenueMap = {} — item.total summed across all paid orders
    sort desc → slice top 5
  ↓
  res.json({ todayEarnings, monthlyEarnings, totalPaidOrders,
             last7Days, topSnacks, peakHours, paymentStatus,
             topRevenueItems, topSnack })
  ↓
Dashboard.jsx:
  setStats(data)
  React re-renders with 6 chart components + stat cards
  ↓
Recharts renders:
  <BarChart>    — last7Days
  <PieChart>    — topSnacks (donut)
  <AreaChart>   — peakHours
  <PieChart>    — paymentStatus (donut)
  Progress bars — topRevenueItems
  Stat cards    — derived from stats
```

---

## Journey G — Telegram Daily Summary

```
server.js imports: import "./src/jobs/daily_summary_job.js"
  ↓ (runs at module load time, registering the cron job)
  ↓
global.dailySummaryJobStarted check:
  if already true → "Daily summary job already running" (nodemon guard)
  else → global.dailySummaryJobStarted = true
  ↓
cron.schedule("0 22 * * *", async () => { ... }, { timezone: "Asia/Kolkata" })
  Cron expression: "0 22 * * *" = minute 0, hour 22 = 10:00 PM every day
  Timezone: Asia/Kolkata (IST, UTC+5:30)
  ↓ (fires every night at 10:00 PM IST)
  ↓
try {
  const summary = await buildDailySummary()
    ↓
    Order.find({ paymentDone: true, createdAt: { $gte: todayStart, $lte: todayEnd } })
    Order.countDocuments({ paymentDone: false, createdAt: today range })
    ↓
    computes: todayEarnings, totalPaidOrders, pendingOrders, topSnack
  ↓
  const message = `
    🙏 Namasthe Boss
    📊 Today's Summary
    💰 Earnings: ₹${summary.todayEarnings}
    📦 Paid Orders: ${summary.totalPaidOrders}
    ⏳ Pending Orders: ${summary.pendingOrders}
    🔥 Top Snack: ${summary.topSnack}
    Good night 🌙
  `
  ↓
  await sendTelegramMessage(message)
    ↓
    axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message
    })
    ↓ (success) → returns res.data
    ↓ (failure) → console.error(err.response.data or err.message)
                  NO retry, NO alerting, message is lost
  ↓
} catch (error) {
  console.error("Error in daily summary job:", error)
  NO retry, NO fallback
}
```

**TRIGGER:** Time-based (`node-cron`), not event-driven. NOT manual. NOT API-triggered (there is a test route `/api/dashboard/test-daily-summary` but it just sends a test message, not the real summary).

---

# 5. FEATURE-BY-FEATURE IMPLEMENTATION

## Feature 1: JWT Authentication

**WHAT:** Verifies that API requests come from known logged-in users.

**WHERE:** `authMiddleware.js` (protect), `generateToken.js`, `authController.js`

**HOW:**

- Login: `authController.loginUser` verifies credentials, calls `generateToken(user._id)` which calls `jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })`
- JWT payload: only `{ id: userId, iat, exp }` — no role, no email
- Token stored: `localStorage.setItem("token", data.token)` — in browser localStorage
- Future requests: Axios interceptor reads `localStorage.getItem("token")` and adds `Authorization: Bearer <token>` header
- Middleware (`protect`): extracts token → `jwt.verify(token, JWT_SECRET)` → `User.findById(decoded.id).select("-password")` → `req.user = user`
- This means every authenticated request hits the database to fetch the user

**WHY:** JWT is stateless — no server-side session storage needed. Works across distributed deployments.

**FAILURE:** Invalid/expired token → 401 "Not authorized, token invalid". Missing token → 401 "Not authorized, no token".

**LIMITATION:** No refresh token mechanism. Token valid for 7 days with no revocation. If user changes password or is deleted, old token still works until 7-day expiry. Token in localStorage is vulnerable to XSS (vs HttpOnly cookies which are safer).

**IMPROVEMENT:** Short-lived access tokens (15 min) + refresh tokens in HttpOnly cookies. Redis-based token blacklist for immediate revocation.

---

## Feature 2: Role-Based Access Control

**WHAT:** Ensures owners and staff can only access their permitted resources.

**WHERE:** `roleMiddleware.js` (authorize), `orderRoutes.js`, `dashboardRoutes.js`, `Navbar.jsx` (frontend UI)

**HOW:**

```
authorize(...roles) — higher-order function
  returns middleware(req, res, next):
    if roles.includes(req.user.role) → next()
    else → 403 "Access denied: insufficient permissions"
```

Route usage:

- `router.get("/summary", protect, authorize("owner"), getDashboardSummary)` — owner only
- `router.post("/", protect, authorize("owner", "staff"), createOrder)` — both

Role stored in: MongoDB `User.role` field, JWT payload does NOT contain role. The role is fetched from DB on every request inside `protect` middleware.

**CURRENT RBAC MATRIX:**
| Operation | Owner | Staff |
|-----------|-------|-------|
| Login | ✅ | ✅ |
| Create Order | ✅ | ✅ |
| Get Orders | ✅ | ✅ |
| Mark Paid | ✅ | ✅ |
| Undo Payment | ✅ | ✅ |
| Delete Order | ✅ | ✅ |
| Dashboard Summary | ✅ | ❌ (403) |

**KNOWN GAPS:**

1. Order deletion is not scoped to the creator — staff can delete any order, not just their own
2. No frontend route guards — staff CAN navigate to `/dashboard` URL but gets API error
3. Registration was disabled (correctly) because it allowed self-assigning `role: "owner"`
4. No token blacklisting — fired staff's JWT works for up to 7 more days

---

## Feature 3: Billing / Order Creation

**WHAT:** Allows staff to create an order from a hardcoded menu.

**WHERE:**

- Frontend: `Billing.jsx`, `SnackCard.jsx`, `BillSummary.jsx`, `data/snacks.js`
- Backend: `orderController.js` (`createOrder`), `Order.js` model

**CRITICAL DETAIL — HARDCODED MENU:** The menu is NOT stored in MongoDB. The 7 snack items are hardcoded in `frontend/src/data/snacks.js`. This means:

- No product management feature exists
- Prices cannot be changed without editing source code and redeploying
- Adding a new item requires a code change

**HOW:** (See Journey E for complete trace)

**LIMITATION:** Menu is static. Tax shown on screen but not stored in DB. Frontend total is unverified by backend (backend trusts `totalAmount` from request body). No server-side price validation.

---

## Feature 4: Order Management

**WHAT:** Tracking and managing order payment status.

**WHERE:** `Orders.jsx`, `orderController.js`, `orderRoutes.js`

**HOW:**

- `getOrders`: `Order.find().sort({ createdAt: -1 }).populate("createdBy", "email role")` — all orders, newest first, with creator info
- `markOrderPaid`: finds order by `_id`, sets `paymentDone = true`, saves
- `undoPayment`: finds order, sets `paymentDone = false`, saves
- `deleteOrder`: only works on unpaid orders (frontend conditionally shows delete button for `!order.paymentDone`), calls `order.deleteOne()`

**LIMITATION:** No backend enforcement that only unpaid orders can be deleted — the backend `deleteOrder` controller will delete any order regardless of payment status. The restriction is frontend-only.

---

## Feature 5: Analytics Dashboard

**WHAT:** Owner-only view of business metrics.

**WHERE:** `Dashboard.jsx`, `dashboardController.js`, `dashboard_summary_service.js`

**HOW:** See Journey F for complete trace.

**LIMITATION:** `Order.find()` fetches ALL orders into memory. This doesn't use MongoDB aggregation pipelines. For a large dataset (100k+ orders), this would be very slow and memory-intensive. All computation happens in JavaScript in Node.js, not in the database engine.

---

## Feature 6: Telegram Automation

**WHAT:** Automated nightly business summary sent to owner's Telegram.

**WHERE:** `daily_summary_job.js`, `telegram_service.js`, `dashboard_summary_service.js`

**HOW:** See Journey G for complete trace.

---

## Feature 7: Dark Mode

**WHAT:** Light/dark theme toggle, persisted across sessions.

**WHERE:** `App.jsx`, `Navbar.jsx`, all JSX files (Tailwind `dark:` classes)

**HOW:**

- `App.jsx`: `const [darkMode, setDarkMode] = useState(() => { const saved = localStorage.getItem('darkMode'); return saved ? JSON.parse(saved) : false; })`
- `useEffect` applies/removes `dark` class on `document.body`
- `localStorage.setItem('darkMode', JSON.stringify(darkMode))` persists choice
- Tailwind v4 `dark:` prefix classes handle theme switching
- Toggle button in `Navbar.jsx` calls `toggleDarkMode` prop

---

# 6. POS AND BILLING ARCHITECTURE

## Complete Billing Flow Analysis

### Where products come from

`frontend/src/data/snacks.js` — a static JavaScript file with 7 hardcoded objects. No database involvement. The menu is fixed at build time.

### How cart state is stored

In `Billing.jsx`:

```javascript
const [quantities, setQuantities] = useState({});
// Structure: { 1: 2, 3: 5 } — snackId → quantity
```

This is local component state. If the user navigates away, the cart is lost.

### How prices are determined

Prices come from `snacks.js` (hardcoded). The frontend is the source of truth for prices. The backend does NOT have a product catalog or price list.

### How totals are calculated

**Frontend (display only):**

```
subtotal = snacks.reduce((sum, snack) => sum + snack.price * (quantities[snack.id] || 0), 0)
tax = subtotal * 0.05               ← 5% tax (BillSummary.jsx)
displayedTotal = subtotal + tax     ← shown to user on screen
```

**What is sent to backend:**

```
totalAmount: subtotal   ← PRE-TAX amount (NOT the displayed total)
```

**Backend (stored in MongoDB):**

```
order.totalAmount = subtotal (from request body)
order.items[i].total = item.price * item.qty (calculated in frontend, sent to backend)
```

**The inconsistency:** The user sees a total that includes 5% tax on the BillSummary screen. But the backend stores and uses the pre-tax subtotal. Dashboard analytics therefore show pre-tax revenue.

### Whether tax exists

Tax is calculated and **displayed** in `BillSummary.jsx` (5% hardcoded as `TAX_RATE = 0.05`). But it is **NOT stored in the database** because `Billing.jsx` sends `totalAmount: subtotal` (not `subtotal + tax`). This is a genuine inconsistency.

### Whether discounts exist

**NOT VERIFIED FROM THE CODEBASE.** No discount logic found anywhere.

### How payment type is selected

**NOT VERIFIED FROM THE CODEBASE.** There is no payment method selection in the UI or backend. No UPI, cash, card, or other payment type is recorded. Only a boolean `paymentDone` flag exists.

### How order is persisted

`Order.create({ items, totalAmount, orderId, createdBy: req.user._id })` — a single MongoDB write with no transactions.

### Whether inventory is updated

**NOT VERIFIED FROM THE CODEBASE.** No inventory model exists. No stock decrement on order creation.

---

## Difficult Interview Questions — Honest Answers

**Q: What prevents a user from modifying the price on the frontend?**

**Current answer:** Nothing. The backend trusts the `items[i].price` and `totalAmount` values from the request body. A technically skilled user could modify the Axios request and send any price they want, and the backend would store it without validation.

**Production fix:** Backend should fetch prices from a Products collection and recompute the total server-side. The request should only contain `{ productId, qty }`, not prices.

---

**Q: Should the backend trust the frontend total?**

**Current answer:** It does — and it shouldn't. The backend accepts `totalAmount` from the request body and stores it. There's no server-side recomputation.

**Production fix:** Backend should own the price catalog and calculate totalAmount itself.

---

**Q: How would you prevent duplicate orders?**

**Current implementation:** No duplicate prevention. Double-clicking "Create Order" could create two identical orders. The `creating` state flag disables the button during the API call, which is some protection, but not server-side idempotency.

**Production fix:** Idempotency key in the request header, checked server-side against a cache.

---

**Q: What happens if payment succeeds but the database write fails?**

**Current implementation:** If `Order.create()` throws, the server returns a 500 error. The frontend shows an `alert()`. The payment doesn't actually get processed anywhere (there's no real payment gateway) so this scenario doesn't apply directly. But if the database is unavailable after a real payment was processed, there would be no record of it.

**Production fix:** Implement idempotent database writes and a compensating transaction pattern.

---

**Q: How would you handle concurrent staff members?**

**Current implementation:** Not handled. If two staff members create orders simultaneously, both go through. The `orderId` sequential logic uses the last order created today — two simultaneous requests could get the same `lastOrder` and generate the same `orderId`. This is a race condition.

**Production fix:** MongoDB's `$inc` on a counter document, or use the MongoDB ObjectId timestamp for ordering instead of sequential orderId.

---

**Q: How would you make billing transactional?**

**Current implementation:** No transactions. A single `Order.create()` call.

**Production fix:** If inventory decrement is added, use MongoDB multi-document transactions (`session.withTransaction()`).

---

# 7. ORDER MANAGEMENT

## Order Schema (Verified from `Order.js`)

```javascript
const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        name: { type: String, required: true }, // snack name as string
        qty: { type: Number, required: true }, // quantity ordered
        price: { type: Number, required: true }, // price per unit
        total: { type: Number, required: true }, // qty * price
      },
    ],
    totalAmount: { type: Number, required: true }, // sum of all item totals (pre-tax)
    orderId: { type: Number }, // sequential per-day counter
    paymentDone: { type: Boolean, default: false }, // payment status
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // foreign key
  },
  { timestamps: true },
); // adds createdAt, updatedAt automatically
```

**Why `orderId` is not required:** Comment in the code: "Removed to allow updating old orders without IDs." This means some older records may not have an `orderId`. The UI shows `order.orderId || "N/A"`.

**Why items are embedded (not referenced):** Denormalization is deliberate. Even if the menu changes, historical orders retain the actual price at which they were sold. This is correct for accounting.

---

## Order APIs — Internal Behavior

### POST /api/orders (Create Order)

**Request:** `{ items: [{ name, qty, price, total }], totalAmount }`
**Auth:** protect + authorize("owner", "staff")
**Business Logic:**

1. Empty items array → 400
2. Find today's last order by `createdAt` range → determine `orderId`
3. `Order.create({ items, totalAmount, orderId, createdBy: req.user._id })`
4. Returns 201 with full order document

### GET /api/orders (Get All Orders)

**Auth:** protect + authorize("owner", "staff")
**Business Logic:**

- `Order.find().sort({ createdAt: -1 }).populate("createdBy", "email role")`
- Returns all orders, newest first, with creator email and role (password excluded)
- Returns all orders from all time — no pagination, no date filtering

### PATCH /api/orders/:id/pay (Mark Paid)

**Auth:** protect + authorize("owner", "staff")
**Business Logic:**

1. `Order.findById(req.params.id)` → 404 if not found
2. `order.paymentDone = true; await order.save()`

### PATCH /api/orders/:id/unpay (Undo Payment)

**Auth:** protect + authorize("owner", "staff")
**Business Logic:** Same as pay but sets `paymentDone = false`

### DELETE /api/orders/:id

**Auth:** protect + authorize("owner", "staff")
**Business Logic:**

1. `Order.findById(req.params.id)` → 404 if not found
2. `await order.deleteOne()`

- Note: No check for `paymentDone` status — backend would delete ANY order. Frontend only shows the delete button for unpaid orders, but this is not enforced server-side.

---

# 8. PAYMENT TRACKING

## What "Payment Tracking" Actually Means in SnackTrack

**IMPORTANT FOR INTERVIEWS:** SnackTrack does NOT integrate with any payment gateway. There is no Razorpay, Stripe, PayU, UPI, or any external payment service.

**What "payment tracking" actually is:**

A boolean flag (`paymentDone`) on each Order document that staff manually toggle:

- `paymentDone: false` → Pending (yellow badge, "⏳ Pending")
- `paymentDone: true` → Paid (green badge, "✓ Paid")

**What payment information is NOT recorded:**

- Payment method (cash, UPI, card) — NOT captured
- Transaction ID — NOT captured
- Who collected payment — NOT captured (only who created the order via `createdBy`)
- Payment timestamp — NOT captured separately (only order creation timestamp exists)

## Interview Answer for "Did You Process Payments?"

"No, SnackTrack doesn't integrate with a real payment gateway. What I implemented is payment tracking, which is different. When a customer pays, the staff member manually clicks 'Mark as Paid' on the order, which flips a boolean field called `paymentDone` to `true` in MongoDB. The system records that payment happened, but it doesn't process the actual money transfer. In a real POS system, you'd integrate Razorpay or Stripe, and the payment status would be updated automatically via a webhook after the customer completes the transaction. I could explain how I'd add that if you'd like."

---

# 9. MONGODB DATABASE DESIGN

## Models Overview

### User Model (`backend/src/models/User.js`)

```
Collection: users

Fields:
  email       String, required, unique, lowercase, trim
  password    String, required, minlength 6 (stored as bcrypt hash)
  role        String, enum: ["owner", "staff"], default: "staff"
  createdAt   Date (auto — timestamps: true)
  updatedAt   Date (auto — timestamps: true)
```

**Schema-level behaviors:**

- `unique: true` on email — MongoDB creates a unique index automatically
- `lowercase: true` — email is forced to lowercase before save
- `pre("save")` hook — hashes password before saving to DB (only if `isModified("password")`)
- `matchPassword()` method — bcrypt.compare for login

### Order Model (`backend/src/models/Order.js`)

```
Collection: orders

Fields:
  items[]
    name     String, required
    qty      Number, required
    price    Number, required
    total    Number, required
  totalAmount  Number, required
  orderId      Number, NOT required (see note)
  paymentDone  Boolean, default: false
  createdBy    ObjectId, ref: "User"
  createdAt    Date (auto — timestamps: true)
  updatedAt    Date (auto — timestamps: true)
```

## Data Relationship Diagram

```
users collection                  orders collection
─────────────────                ─────────────────────────────
_id: ObjectId         ←──────── createdBy: ObjectId (ref User)
email: "staff@shop.com"
password: "$2b$10$..." (hashed)  items: [
role: "staff"                      { name: "Samosa", qty: 2, price: 15, total: 30 },
createdAt: timestamp               { name: "Tea",    qty: 1, price: 15, total: 15 }
                                 ]
                                 totalAmount: 45
                                 orderId: 7
                                 paymentDone: false
                                 createdAt: 2026-08-31T10:30:00Z
```

**Relationship type:** One-to-many (one User can create many Orders). The relationship is stored as a reference (`ObjectId`) in the Order document.

## Database Design Questions

**Q: Why MongoDB for this project?**

"MongoDB's document model is a natural fit for orders with variable-length item arrays. In a relational database, I'd need a separate `order_items` table with foreign keys back to orders, and every query would require a JOIN. With MongoDB, each order is a self-contained document — items are embedded directly. This makes writes simple (one insert), reads fast (no joins), and the data structure maps directly to what I'd pass to the frontend as JSON anyway. The flexibility also helped during development — I could change the schema without migration scripts."

**Q: What are the trade-offs?**

"The main trade-off is that there's no ACID transaction support across multiple documents by default. If I needed to update inventory when an order is created, and the inventory update fails, I'd have an inconsistent state. MongoDB does support multi-document transactions with replica sets, but they add complexity. Also, since I'm using `Order.find()` for analytics, as the orders collection grows, this query gets slow. With PostgreSQL, I'd have more powerful query planner optimizations and better support for complex aggregations with JOINs across normalized tables."

**Q: What validations are handled at schema level?**

- `email`: required, unique, lowercase, trim
- `password`: required, minlength 6
- `role`: enum validation (only "owner" or "staff" accepted)
- `items[].name/qty/price/total`: required
- `totalAmount`: required

**Q: Which queries may become slow?**

- `Order.find()` in `dashboardController.js` — full collection scan, no filter
- `Order.find({ createdAt: ... })` for today's orders in `createOrder` — benefits from an index on `createdAt`

**Q: What indexes would be useful?**

- `{ createdAt: -1 }` — for sorting and date-range queries
- `{ paymentDone: 1, createdAt: -1 }` — compound index for filtering paid orders by date
- `{ createdBy: 1 }` — if querying orders by staff member

---

# 10. MONGOOSE ODM DEEP DIVE

## Mongoose Concepts as Used in SnackTrack

**ODM (Object Document Mapper):** Mongoose provides a schema-based layer on top of MongoDB's JavaScript driver. Instead of working with raw BSON documents, you define schemas, create models, and interact with typed JavaScript objects.

**Schema:** The blueprint for a document. Defines fields, types, validations, defaults. Example: `new mongoose.Schema({ email: { type: String, required: true } })`

**Model:** A compiled version of the schema, representing a MongoDB collection. `const User = mongoose.model("User", userSchema)` — Mongoose pluralizes this to the `users` collection.

**Document:** A single instance of a Model. When you do `User.findById(id)`, you get a document back — an object with schema methods like `matchPassword()` available.

**Collection:** The MongoDB equivalent of a table. `users` and `orders` are the two collections.

**ObjectId:** MongoDB's default unique identifier for every document. 12 bytes: 4 bytes timestamp + 5 bytes random + 3 bytes increment. In Mongoose, `createdBy: mongoose.Schema.Types.ObjectId` stores a reference.

---

## Operations Actually Used in SnackTrack

### `User.findOne({ email })` — in `authController.js`

**Question asked:** "Find the one user whose email matches the login input."

```javascript
const user = await User.findOne({ email });
// Returns: null if not found, User document if found
```

### `User.findById(decoded.id).select("-password")` — in `authMiddleware.js`

**Question asked:** "Find the user with this MongoDB ObjectId, but don't return the password field."

```javascript
req.user = await User.findById(decoded.id).select("-password");
```

The `.select("-password")` uses MongoDB projection to exclude sensitive fields.

### `Order.create({ items, totalAmount, orderId, createdBy })` — in `createOrder`

**Question asked:** "Insert a new order document into the orders collection."
Equivalent to `new Order({...}).save()` but shorter.

### `Order.find()` — in `dashboardController.js`

**Question asked:** "Give me all documents in the orders collection."

```javascript
const orders = await Order.find(); // Returns array of all Order documents
```

### `Order.find().sort({ createdAt: -1 }).populate("createdBy", "email role")` — in `getOrders`

**Question asked:** "Give me all orders, sorted newest first, and instead of just the ObjectId in createdBy, give me the email and role of that user."
`.populate()` replaces the ObjectId reference with actual document data from the `users` collection.

### `Order.findById(req.params.id)` — in `markOrderPaid`, `undoPayment`, `deleteOrder`

**Question asked:** "Find the single order with this specific ObjectId."

### `order.save()` — after modifying `paymentDone`

Persists changes to an existing document back to MongoDB.

### `order.deleteOne()` — in `deleteOrder`

Removes the document from the collection.

### `Order.find({ paymentDone: true, createdAt: { $gte: start, $lte: end } })` — in `buildDailySummary`

**Question asked:** "Find all orders that are paid AND were created today."
`$gte` (greater than or equal) and `$lte` (less than or equal) are MongoDB comparison operators.

### `Order.countDocuments({ paymentDone: false, ... })` — in `buildDailySummary`

**Question asked:** "Count (don't return) how many orders are pending today."

---

## Important: No Aggregation Pipelines Used

**CRITICAL FOR INTERVIEWS:** The analytics in SnackTrack do NOT use MongoDB's `$aggregate` pipeline. All computation happens in JavaScript in the Node.js process after loading data with `Order.find()`.

This is a deliberate trade-off (developer familiarity) but is not scalable. Know how to explain this honestly and describe the aggregation pipeline alternative.

---

# 11. AUTHENTICATION

## Complete Authentication Flow

```
Registration: DISABLED (commented out in authController.js + authRoutes.js)

Login:
User submits email + password
  ↓
POST /api/auth/login (no auth required)
  ↓
authController.loginUser:
  1. Input validation: email && password present → 400 if missing
  2. User.findOne({ email }) → search MongoDB users collection
  3. null → 401 "Invalid email or password" (same message — prevents email enumeration)
  4. user.matchPassword(password):
       bcrypt.compare(enteredPassword, this.password)  ← async
       false → 401 "Invalid email or password"
       true → continue
  5. generateToken(user._id):
       jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
       Returns: "<header>.<payload>.<signature>" (3 base64url segments)
  6. res.json({ token, user: { id, email, role } })
  ↓
Frontend stores in localStorage:
  token → for Authorization header
  role  → for UI role-checking
  email → for display purposes

Subsequent Requests:
  Axios interceptor: req.headers.Authorization = `Bearer ${localStorage.getItem("token")}`
  ↓
authMiddleware.js: protect(req, res, next)
  1. Check: req.headers.authorization?.startsWith("Bearer")
  2. token = header.split(" ")[1]
  3. jwt.verify(token, process.env.JWT_SECRET) → decoded = { id, iat, exp }
  4. User.findById(decoded.id).select("-password") → attaches full user to req.user
  5. next() — controller can now use req.user._id, req.user.role, etc.

Logout:
  Frontend only (Navbar.jsx handleLogout):
  localStorage.removeItem("token")
  localStorage.removeItem("role")
  localStorage.removeItem("email")
  navigate("/login")
  ← No server-side invalidation
```

## JWT Structure

A JWT has three base64url-encoded parts separated by dots:

**Header:** `{ "alg": "HS256", "typ": "JWT" }` — algorithm and type

**Payload (in SnackTrack):** `{ "id": "64b3f2a...", "iat": 1693..., "exp": 1694... }`

- `id` is the MongoDB `_id` string of the user
- `iat` = issued at timestamp
- `exp` = expiration timestamp (iat + 7 days)
- Role is NOT in the JWT — it's fetched from DB on every request

**Signature:** `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`
This is what prevents tampering. Only the server knows `JWT_SECRET`.

## Authentication vs Authorization

**Authentication** = "Who are you?" — handled by `protect` middleware using JWT
**Authorization** = "Are you allowed to do this?" — handled by `authorize` middleware checking role

## Token Storage: localStorage (Verified)

The token is stored in `localStorage`, not in an HttpOnly cookie.

**Security implication:** localStorage is accessible to JavaScript on the page. If the site had an XSS vulnerability, an attacker's script could read the token. HttpOnly cookies cannot be read by JavaScript, making them more secure against XSS. This is a known limitation to mention in interviews.

---

# 12. AUTHORIZATION AND ROLE-BASED ACCESS CONTROL

## Role Storage (Verified)

**In MongoDB:** `User.role` field — `enum: ["owner", "staff"]`, default `"staff"`, validated at schema level
**In JWT:** Role is NOT included in the JWT payload
**In localStorage:** `localStorage.setItem("role", data.user.role)` — for frontend UI decisions only (not security)
**In req.user:** Loaded from MongoDB by `protect` middleware on every request → `req.user.role`

## Who Creates Staff Accounts

Registration is disabled. Accounts are pre-seeded directly in MongoDB. There is no admin interface to create new users. New accounts must be created by someone with direct database access (the developer).

## The authorize() Middleware — Explained

```javascript
const authorize = (...roles) => {
  // "owner" or ["owner", "staff"]
  return (req, res, next) => {
    // returns actual middleware function
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};
```

This is a **higher-order function** — a function that returns a function. The outer function receives the allowed roles array. The inner function (the actual middleware) checks if `req.user.role` is in that array. If not, returns 403. If yes, calls `next()`.

## Frontend vs Backend Authorization

**Frontend role-hiding** (in `Navbar.jsx`):

```javascript
const role = localStorage.getItem("role");
const isOwner = role === "owner";
{
  isOwner && <Link to="/dashboard">Dashboard</Link>;
}
```

This hides the link from staff — but it is NOT security. It's only UX.

**Backend authorization** (in `dashboardRoutes.js`):

```javascript
router.get("/summary", protect, authorize("owner"), getDashboardSummary);
```

This is the actual security. Even if a staff member guesses the URL and calls the API directly, the `authorize("owner")` middleware rejects with 403.

## Interview Question: Can staff call owner-only APIs?

"The frontend won't show the Dashboard link to staff, and the Billing/Orders pages don't make calls to `/dashboard/summary`. But technically, staff could open browser dev tools or use curl/Postman with their valid JWT token to call `GET /api/dashboard/summary`. The request would reach the backend, but `authorize("owner")` would check `req.user.role === 'staff'` and return a 403 Forbidden response. The dashboard data is never sent. So frontend hiding is a UX convenience, but backend authorization is the actual enforcement."

---

# 13. ANALYTICS DASHBOARD AND ENGINE

## All Metrics — Verified from `dashboardController.js`

### Metric 1: Today's Earnings

**Definition:** Sum of `totalAmount` across all PAID orders created today
**Source:** `buildDailySummary()` in `dashboard_summary_service.js`
**Calculation:**

```javascript
const paidOrders = await Order.find({
  paymentDone: true,
  createdAt: { $gte: todayStart, $lte: todayEnd },
});
todayEarnings = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
```

**Output:** Single number (₹)
**Chart:** Stat card (violet gradient)
**Edge case:** No orders → 0

### Metric 2: Monthly Earnings

**Definition:** Sum of `totalAmount` across all PAID orders in the current calendar month/year
**Source:** `dashboardController.js`
**Calculation:**

```javascript
const monthlyEarnings = paidOrders
  .filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === month && d.getFullYear() === year;
  })
  .reduce((sum, o) => sum + o.totalAmount, 0);
```

Note: `paidOrders` here is ALL paid orders (loaded with `Order.find()`), then filtered in JS.
**Output:** Single number (₹)
**Chart:** Stat card (cyan gradient)

### Metric 3: Total Paid Orders (Count)

**Definition:** Count of today's paid orders
**Source:** `buildDailySummary()` — `paidOrders.length`
**Chart:** Stat card (amber gradient) — also shows pending count sub-label

### Metric 4: Average Order Value

**Definition:** Today's earnings divided by today's paid orders
**Source:** `Dashboard.jsx` (computed client-side)
**Calculation:**

```javascript
const avgOrderValue =
  totalOrders > 0 ? Math.round(stats.todayEarnings / stats.totalPaidOrders) : 0;
```

**Note:** This divides today's earnings by today's paid orders, which is correct AOV for today.
**Chart:** Stat card (emerald gradient)

### Metric 5: Last 7 Days Earnings

**Definition:** Daily paid earnings for each of the past 7 days
**Calculation:**

```javascript
for (let i = 6; i >= 0; i--) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const dayStr = d.toDateString();
  const label = d.toLocaleDateString("en-US", { weekday: "short" });
  const earnings = paidOrders
    .filter((o) => new Date(o.createdAt).toDateString() === dayStr)
    .reduce((sum, o) => sum + o.totalAmount, 0);
  last7Days.push({ day: label, earnings });
}
```

**Limitation:** Uses string comparison (`toDateString()`) for date matching — timezone issues could occur if server timezone differs from Asia/Kolkata.
**Output:** Array of 7 `{ day, earnings }` objects
**Chart:** `<BarChart>` with gradient bars

### Metric 6: Top Selling Snacks (by quantity)

**Definition:** Top 6 snacks by total quantity sold across all-time paid orders
**Calculation:**

```javascript
const snackMap = {};
paidOrders.forEach((o) => {
  o.items.forEach((item) => {
    snackMap[item.name] = (snackMap[item.name] || 0) + item.qty;
  });
});
const topSnacks = Object.entries(snackMap)
  .map(([name, qty]) => ({ name, qty }))
  .sort((a, b) => b.qty - a.qty)
  .slice(0, 6);
```

**Output:** Array of `{ name, qty }` sorted by qty descending
**Chart:** `<PieChart>` donut (innerRadius=40, outerRadius=80)

### Metric 7: Peak Hours

**Definition:** Count of paid orders per hour (8 AM to 10 PM)
**Calculation:**

```javascript
const hourMap = {};
for (let h = 8; h <= 22; h++) hourMap[h] = 0;
paidOrders.forEach((o) => {
  const h = new Date(o.createdAt).getHours();
  if (hourMap[h] !== undefined) hourMap[h]++;
});
const peakHours = Object.entries(hourMap).map(([hour, orders]) => ({
  hour: `${hour}:00`,
  orders,
}));
```

**Output:** Array of 15 `{ hour, orders }` objects
**Chart:** `<AreaChart>` with gradient fill

### Metric 8: Payment Status

**Definition:** Count of today's paid vs. pending orders
**Source:** `buildDailySummary()` — `totalPaidOrders` and `pendingOrders`
**Output:** `{ paid: N, pending: M }`
**Chart:** `<PieChart>` donut

### Metric 9: Top Revenue Generators

**Definition:** Top 5 items by total revenue (sum of item.total) across all-time paid orders
**Calculation:**

```javascript
const revenueMap = {};
paidOrders.forEach((o) => {
  o.items.forEach((item) => {
    revenueMap[item.name] = (revenueMap[item.name] || 0) + item.total;
  });
});
const topRevenueItems = Object.entries(revenueMap)
  .map(([name, revenue]) => ({ name, revenue }))
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5);
```

**Difference from Top Snacks:** Top Snacks ranks by unit quantity (how many sold). Top Revenue ranks by money earned. Tea might sell more units but Pav Bhaji (₹60) generates more revenue.
**Chart:** Progress bars with relative widths

### Metric 10: Conversion Rate

**Definition:** Percentage of total orders that are paid
**Source:** `Dashboard.jsx` (client-side calculation)
**Calculation:** `(stats.totalPaidOrders / totalOrders) * 100`
**Display:** Quick Insights panel

---

# 14. MONGODB AGGREGATION USED IN SNACKTRACK

## IMPORTANT: Aggregation Pipelines Are NOT Used

The analytics engine in SnackTrack does NOT use `$aggregate`. Instead, it uses `Order.find()` to load all documents and JavaScript array methods to compute results.

**For the interview:** You must know the difference, know that this doesn't scale, and be able to explain what the aggregation version would look like.

## How Each Metric Would Look as an Aggregation Pipeline

### Top Selling Snacks (current JS vs. aggregation)

**Current JS approach:**

```javascript
const orders = await Order.find();
const paidOrders = orders.filter((o) => o.paymentDone);
const snackMap = {};
paidOrders.forEach((o) =>
  o.items.forEach((item) => {
    snackMap[item.name] = (snackMap[item.name] || 0) + item.qty;
  }),
);
```

**Aggregation Pipeline equivalent:**

```javascript
Order.aggregate([
  { $match: { paymentDone: true } }, // Stage 1: filter paid orders
  { $unwind: "$items" }, // Stage 2: expand items array
  {
    $group: {
      // Stage 3: group by item name
      _id: "$items.name",
      totalQty: { $sum: "$items.qty" },
    },
  },
  { $sort: { totalQty: -1 } }, // Stage 4: sort by qty
  { $limit: 6 }, // Stage 5: top 6
]);
```

**Interview explanation of each stage:**

- `$match`: "Give me only paid orders" — acts like a WHERE clause
- `$unwind`: "For each order, create one document per item in its items[] array"
- `$group`: "Collapse all documents with the same item name, summing up the qty"
- `$sort`: "Order results by totalQty descending"
- `$limit`: "Only return the top 6"

### Daily Earnings (Aggregation version)

```javascript
Order.aggregate([
  {
    $match: {
      paymentDone: true,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    },
  },
  {
    $group: {
      _id: null,
      totalEarnings: { $sum: "$totalAmount" },
      count: { $sum: 1 },
    },
  },
]);
```

### Why Aggregation Is Better at Scale

| Aspect                | Current (JS)             | Aggregation Pipeline             |
| --------------------- | ------------------------ | -------------------------------- |
| Data transferred      | All order documents      | Only computed result (~KB)       |
| Filtering location    | Node.js (after DB load)  | MongoDB (before sending data)    |
| Memory usage          | Entire collection in RAM | Streaming in DB engine           |
| Index usage           | Full scan                | Can use indexes on $match fields |
| Scales to 100K orders | ❌ Very slow             | ✅ Efficient                     |

---

# 15. REACT FRONTEND ARCHITECTURE

## Entry Point and Startup

```
index.html: <div id="root"> + <script src="/src/main.jsx">
  ↓
main.jsx:
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  )
  ↓
App.jsx: root component
  State: [darkMode, setDarkMode] (initialized from localStorage)
  State: [orders, setOrders] ← defined but NOT used anywhere (dead code)
  useEffect: applies/removes 'dark' class on document.body
  Renders: <Navbar> + <Routes> (4 routes)
```

**Note:** `const [orders, setOrders] = useState([])` exists in `App.jsx` but is never passed to any child component and never set. It appears to be a leftover from an earlier design where orders might have been managed at the app level.

## Routing

```javascript
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/billing" element={<Billing />} />
  <Route path="/orders" element={<Orders />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/" element={<Navigate to="/login" replace />} />
</Routes>
```

**No route guards.** Any route is accessible to any user in the browser. Authorization is enforced on the backend API level only.

## State Management Approach

**Pattern:** Local component state — no Redux, no Zustand, no React Context, no global state.

| Component       | State                               | What It Holds                   |
| --------------- | ----------------------------------- | ------------------------------- |
| `App.jsx`       | `darkMode`                          | Dark/light theme preference     |
| `Login.jsx`     | `posId, password, error, isLoading` | Form fields and UI state        |
| `Billing.jsx`   | `quantities, creating`              | Cart state and loading flag     |
| `Orders.jsx`    | `orders, loading`                   | Fetched orders and loading flag |
| `Dashboard.jsx` | `stats, loading`                    | API response and loading flag   |
| `Navbar.jsx`    | `isMenuOpen`                        | Mobile menu toggle              |

## API Layer — `api.js`

```javascript
const API = axios.create({
  baseURL: "https://snacktrack-backend-y8nw.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});
```

**What this means:** Every API call made through this Axios instance automatically includes the JWT if it exists. This is a clean centralization of authentication concern. No page needs to manually add the Authorization header.

## Key React Concepts Used

### `useState`

Used in every page/component. `Billing.jsx` uses the functional updater pattern:

```javascript
setQuantities((prev) => ({ ...prev, [snackId]: qty }));
```

This is important — it reads the previous state rather than a closure-captured stale value, preventing lost updates when multiple rapid state changes happen.

### `useEffect`

Used in `App.jsx` (dark mode), `Orders.jsx` (fetch on mount), `Dashboard.jsx` (fetch on mount).

```javascript
useEffect(() => {
  fetchOrders();
}, []); // empty dep array = run once on mount
```

### Controlled vs Uncontrolled Inputs

`SnackCard.jsx` uses `defaultValue="0"` — this is an **uncontrolled input**. React sets the initial value, but the DOM element maintains its own state. The `onChange` handler calls `onQuantityChange` to update React state, but the displayed value comes from the DOM, not from React state. This means if `quantities` state were reset (which happens on successful order creation via `setQuantities({})`), the input field on screen would NOT reset — it would still show the old quantity.

This is a UI bug: after submitting an order and navigating back to Billing, the number inputs might not reset to 0 if the component doesn't unmount and remount.

### Derived State

`subtotal` in `Billing.jsx` is not stored in state — it's computed on every render from `quantities`. This is correct design: derived data should not be stored separately, which prevents consistency bugs.

### Fetch-on-Action Pattern

`Orders.jsx` fetches orders on mount and re-fetches after every mutation (markPaid, undoPay, delete). There's no real-time update (no WebSockets, no polling).

---

# 16. TELEGRAM AUTOMATION

## Complete Implementation Details

### Library Used

`axios` (already installed as a backend dependency) for HTTP POST to Telegram Bot API. **No Telegram SDK/library** is used — it's a direct HTTP call.

### Bot Configuration

- Bot token: stored in `process.env.TELEGRAM_BOT_TOKEN` (loaded from `.env` file)
- Chat ID (recipient): stored in `process.env.TELEGRAM_CHAT_ID`
- Both are hardcoded per-environment — there's no multi-owner support

### Trigger Mechanism

`node-cron` — an in-process scheduler. The job is registered when `server.js` imports `./src/jobs/daily_summary_job.js`.

**Cron expression:** `"0 22 * * *"` = every day at 22:00 (10 PM) in `timezone: "Asia/Kolkata"` (IST)

### Nodemon Duplicate Prevention

```javascript
if (global.dailySummaryJobStarted) {
    console.log("Daily summary job already running");
} else {
    global.dailySummaryJobStarted = true;
    cron.schedule(...);
}
```

Without this, nodemon restarts during development would register the cron job multiple times, causing multiple messages at 10 PM.

### Message Format

```
🙏 Namasthe Boss

📊 Today's Summary
💰 Earnings: ₹{todayEarnings}
📦 Paid Orders: {totalPaidOrders}
⏳ Pending Orders: {pendingOrders}
🔥 Top Snack: {topSnack}

Good night 🌙
```

### Error Handling — Current

```javascript
try {
    await sendTelegramMessage(message);
} catch (error) {
    console.error("Error in daily summary job:", error);
}
// telegram_service.js:
try { await axios.post(...) }
catch (err) { console.error(...) }
```

Error is logged. No retry. No alerting. If Telegram is down at 10 PM, the message is lost forever.

### Test Route

`GET /api/dashboard/test-daily-summary` — sends a test message "🧪 Test: Daily summary working!" to verify connectivity. This route has NO authentication — anyone can call it.

## Interview Questions — Prepared Answers

**Q: Why Telegram and not SMS or email?**
"Telegram is free, instant, and the Bot API is extremely simple — just one HTTP POST. For a small food stall owner in India, Telegram is commonly used. SMS requires a paid gateway like Twilio, and email has delivery delays and spam concerns. The Bot API costs nothing and delivers instantly."

**Q: How is the bot token secured?**
"The token is stored in a `.env` file on the server, loaded via `dotenv`. It's never committed to Git (`.gitignore` excludes `.env`). In production on Render, it's configured as an environment variable through the dashboard. However, I'll note that it's currently in the `.env` file that exists in the repo locally — that's a development convenience but would be a problem if the file was ever accidentally committed."

**Q: What happens if the server is offline at 10 PM?**
"The cron job only runs while the server process is alive. If Render restarts the server at 10 PM for any reason, or if the server is down for maintenance, that night's summary is lost. There's no persistent job queue. In production, the right solution would be an external scheduler — AWS EventBridge, Render's built-in cron, or a queue-based worker — so the job is triggered reliably regardless of the server's state."

**Q: How would you support multiple business owners?**
"Currently, `TELEGRAM_CHAT_ID` is one hardcoded value. For multiple owners, I'd need a database-backed mapping: each owner user would have their own `telegramChatId` field in the User document. The cron job would then query all owner accounts and send a personalized summary to each one."

**Q: How would you prevent duplicate notifications?**
"Currently the nodemon guard (`global.dailySummaryJobStarted`) prevents duplicates in development restarts. In production, if multiple server instances ran (load balancing), each would fire the cron job independently. The fix is to use a distributed lock — store a `lastRunDate` in Redis or MongoDB, and at the start of the job, check and set that key atomically (`SET IF NOT EXISTS`). Only the instance that wins the lock sends the message."

---

# 17. SECURITY ANALYSIS

## Current Security Measures (Verified)

### 1. Password Hashing — bcryptjs

**Where:** `User.js` `pre("save")` hook and `matchPassword()` method
**How:** `bcrypt.genSalt(10)` + `bcrypt.hash(password, salt)` before saving. `bcrypt.compare(entered, hashed)` for verification.
**What it prevents:** Plaintext password storage. If the database is breached, attackers get only hashes. bcrypt is deliberately slow (10 salt rounds ≈ 100ms per hash), making brute-force impractical.
**Limitation:** 10 rounds was the 2013 recommendation. 12-14 is better today for stronger protection.

### 2. JWT Authentication

**Where:** `authMiddleware.js`, `generateToken.js`
**How:** Signed with `HS256` algorithm using `JWT_SECRET`. `jwt.verify()` throws on tampered or expired tokens.
**What it prevents:** Request forgery from unauthenticated users.
**Limitation:** Token in localStorage (XSS risk). No revocation. Weak JWT_SECRET in current `.env` (`snacktrack_super_secret_key_123`).

### 3. Helmet

**Where:** `app.js` — `app.use(helmet({ crossOriginResourcePolicy: false }))`
**How:** Sets 11 HTTP security headers including `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `X-XSS-Protection`, etc.
**What it prevents:** Clickjacking, MIME sniffing, XSS, content injection, and several other browser-based attacks.
**Limitation:** `crossOriginResourcePolicy: false` disables the CORP header to allow CORS. This is a deliberate trade-off, not a vulnerability.

### 4. CORS Configuration

**Where:** `app.js` — `app.use(cors({ origin: [...], credentials: true }))`
**Allowed origins:** `http://localhost:5173` (dev) and `https://snack-track-theta.vercel.app` (production)
**What it prevents:** Other websites from making cross-origin API calls on behalf of authenticated users.
**Limitation:** Only prevents browser-based cross-origin requests. Does not stop direct API calls from curl, Postman, or server-side code.

### 5. Rate Limiting

**Where:** `app.js` — `app.use("/api", limiter)` applied to all `/api` routes
**Config:** 100 requests per 15 minutes per IP. Uses `standardHeaders: true`, `legacyHeaders: false`.
**What it prevents:** Brute-force login attacks, DoS via rapid API calls.
**Limitation:** Applied to ALL `/api` routes equally. The login endpoint (`/api/auth/login`) should have a stricter limit (e.g., 5/minute). A single bad actor could use up 100 requests attacking the login before being blocked.

### 6. Role-Based Access Control

**Where:** `roleMiddleware.js` — `authorize("owner")` on dashboard routes
**What it prevents:** Staff from accessing owner-only analytics.

### 7. Environment Variables

**Where:** `.env` file + `dotenv` in `server.js`
**What it prevents:** Secrets hard-coded in source code.
**Limitation:** `.env` file exists in the local repo with real credentials. If ever pushed to Git (the `.gitignore` should prevent this), credentials would be exposed. The current `.env` contains real MongoDB connection string and Telegram bot token.

---

## Security Gaps (Honest)

1. **Login endpoint lacks specific rate limiting** — The general `/api` rate limiter applies, but a dedicated login rate limiter with lockout after N failures would be more appropriate.
2. **No route guards on frontend** — Staff can navigate to `/dashboard` URL; they see an error but the page skeleton renders.
3. **Order deletion not scoped to creator** — Any staff can delete any unpaid order.
4. **No token revocation** — Fired staff's JWT works for 7 more days.
5. **JWT in localStorage** — Vulnerable to XSS. HttpOnly cookies are safer.
6. **No input sanitization** — No library like `express-validator` or `joi` for request body validation beyond manual checks.
7. **Weak JWT secret in development** — `snacktrack_super_secret_key_123` is not cryptographically random.
8. **Test route with no auth** — `GET /api/dashboard/test-daily-summary` sends a Telegram message to anyone who calls it.
9. **No HTTPS enforcement at app level** — Relies on Render to provide HTTPS termination.

## Production Security Improvements

1. Dedicated rate limiter on `/api/auth/login` (5 req/min per IP)
2. HttpOnly, Secure, SameSite cookies for token storage
3. Short-lived access tokens (15 min) + refresh tokens
4. Redis-based token blacklist for revocation
5. `express-validator` for all request body validation
6. Cryptographically random JWT secret (32+ bytes from `crypto.randomBytes()`)
7. Remove or protect the test Telegram route
8. Add CSRF protection if using cookies

---

# 18. API SECURITY MIDDLEWARE

## Helmet

**What is it?** A collection of 11 small middleware functions, each setting one security-related HTTP response header.

**Where configured:** `app.js` — `app.use(helmet({ crossOriginResourcePolicy: false }))`

**Headers it sets (key ones):**

- `Content-Security-Policy` — restricts what resources can load
- `X-Frame-Options: SAMEORIGIN` — prevents clickjacking (site in iframe)
- `X-Content-Type-Options: nosniff` — prevents MIME type sniffing
- `Strict-Transport-Security` — forces HTTPS in supported browsers
- `Referrer-Policy` — controls referrer header

**What it does NOT solve:** Helmet is not a WAF. It doesn't prevent SQL injection, NoSQL injection, business logic attacks, or application-level vulnerabilities. It only adds browser-enforced protections via headers.

**Interview Q: "Does Helmet make your backend completely secure?"**
"No. Helmet mitigates browser-side attack vectors by setting HTTP headers. A server-side attacker calling your API directly doesn't care about these headers. Helmet is one layer in a defense-in-depth approach — it works alongside authentication, authorization, input validation, rate limiting, and proper error handling. None of these alone are sufficient."

---

## CORS

**What is it?** Browser Same-Origin Policy enforcement. CORS headers tell the browser which other origins are allowed to make cross-origin requests.

**Where configured:** `app.js` — `app.use(cors({ origin: [...], credentials: true }))`

**Configuration in SnackTrack:**

```javascript
cors({
  origin: [
    "http://localhost:5173", // dev
    "https://snack-track-theta.vercel.app", // prod
  ],
  credentials: true,
});
```

**What it prevents:** If a malicious site `evil.com` tries to make AJAX calls to your API while a user is logged in, the browser will block the response because `evil.com` is not in the allowed origins list.

**Interview Q: "Does CORS prevent hackers from calling your API?"**
"No. CORS is a browser policy. A hacker using curl, Python requests, or Postman completely bypasses CORS — those tools don't enforce it. CORS only prevents malicious JavaScript running in a browser from reading your API responses. It's not a server-side security control. Authentication and authorization are what actually prevent unauthorized access."

**Why credentials: true?** This allows the browser to send cookies with cross-origin requests. Not strictly necessary since SnackTrack uses localStorage tokens, not cookies, but was added during development.

**Why CORS is configured before Helmet:** The comment in `app.js` explains: "CORS: MUST be FIRST (before Helmet) so preflight OPTIONS requests are handled." CORS preflight (OPTIONS) requests must be handled before Helmet runs, or the browser's CORS check might fail.

---

## Rate Limiting

**What is it?** A middleware that counts requests per IP and rejects excess ones.

**Where configured:** `app.js`

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per window
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);
```

**What it prevents:** Brute-force attacks (trying thousands of passwords), basic DoS (flooding server with requests from one IP).

**Interview Q: "Can rate limiting stop every DDoS attack?"**
"No. A distributed DoS attack uses thousands of IPs, so per-IP rate limiting is ineffective. Real DDoS mitigation requires infrastructure-level solutions like Cloudflare, AWS Shield, or similar CDN/WAF services. Rate limiting is useful against brute-force attacks from single IPs and basic scripted abuse, not against a coordinated botnet. Also, our current limit of 100/15min on all API routes is relatively permissive — a legitimate user making rapid legitimate requests could be blocked while an attacker who spaces requests slowly might not be."

---

# 19. COMPLETE API REFERENCE

| Method | Endpoint                            | Purpose                    | Auth   | Role         | Request Body                                            | Response                               | Controller                                |
| ------ | ----------------------------------- | -------------------------- | ------ | ------------ | ------------------------------------------------------- | -------------------------------------- | ----------------------------------------- |
| POST   | `/api/auth/login`                   | Authenticate user          | ❌     | None         | `{ email, password }`                                   | `{ token, user: { id, email, role } }` | `authController.loginUser`                |
| POST   | `/api/orders`                       | Create new order           | ✅ JWT | owner, staff | `{ items: [{ name, qty, price, total }], totalAmount }` | 201 Order document                     | `orderController.createOrder`             |
| GET    | `/api/orders`                       | Get all orders             | ✅ JWT | owner, staff | None                                                    | Array of orders (populated createdBy)  | `orderController.getOrders`               |
| PATCH  | `/api/orders/:id/pay`               | Mark order as paid         | ✅ JWT | owner, staff | None                                                    | Updated order document                 | `orderController.markOrderPaid`           |
| PATCH  | `/api/orders/:id/unpay`             | Mark order as unpaid       | ✅ JWT | owner, staff | None                                                    | Updated order document                 | `orderController.undoPayment`             |
| DELETE | `/api/orders/:id`                   | Delete order               | ✅ JWT | owner, staff | None                                                    | `{ message: "Order deleted" }`         | `orderController.deleteOrder`             |
| GET    | `/api/dashboard/summary`            | Get all analytics data     | ✅ JWT | owner only   | None                                                    | Dashboard metrics JSON                 | `dashboardController.getDashboardSummary` |
| GET    | `/api/dashboard/test-daily-summary` | Test Telegram connectivity | ❌     | None         | None                                                    | `{ ok: true }`                         | Inline (dashboard route)                  |
| GET    | `/`                                 | Health check               | ❌     | None         | None                                                    | "SnackTrack API running"               | Inline (app.js)                           |

---

## Error Responses

| HTTP Status | When                                  | Example Message                           |
| ----------- | ------------------------------------- | ----------------------------------------- |
| 400         | Missing email/password at login       | "Email and password are required"         |
| 400         | Empty items array on order creation   | "Order must have items"                   |
| 401         | Wrong credentials                     | "Invalid email or password"               |
| 401         | No JWT token                          | "Not authorized, no token"                |
| 401         | Invalid/expired JWT                   | "Not authorized, token invalid"           |
| 403         | Insufficient role (staff → dashboard) | "Access denied: insufficient permissions" |
| 404         | Order not found by ID                 | "Order not found"                         |
| 500         | Unhandled server error                | (Express default error)                   |

---

# 20. ERROR HANDLING AND EDGE CASES

## Backend Error Handling Analysis

### What's handled well:

- Auth controller: manual 400/401 returns for missing/invalid inputs
- Order controller: 404 for missing orders
- DB connection: `process.exit(1)` if MongoDB connection fails on startup
- Telegram service: `try/catch` with error logging
- Cron job: `try/catch` around the entire job body

### What's NOT handled:

- No global Express error middleware (`app.use((err, req, res, next) => ...)`)
- If any controller throws an unhandled exception (e.g., `Order.find()` throws due to DB timeout), Express 5 may handle it differently than Express 4 (Express 5 propagates async errors automatically), but there's no standardized error response format
- No try/catch in most controller functions — they rely on Express 5's automatic async error forwarding
- No Mongoose validation error formatting — if `Order.create()` fails validation, the raw Mongoose error would bubble up

### Frontend Error Handling:

- `Login.jsx`: `setError(err.response?.data?.message || "Login failed")` — shows error in UI
- `Billing.jsx`: `console.error(...)` + `alert(...)` for order creation failure
- `Orders.jsx`: `console.error(...)` only — silent failures (user sees nothing if mark-paid fails)
- `Dashboard.jsx`: `console.error(...)` + state remains null → shows "Failed to load dashboard data."

### Key Missing Error Handling:

- No 401 interceptor in `api.js` — if token expires mid-session, API calls fail silently. The user would need to manually navigate back to login. A proper implementation would add an Axios response interceptor that redirects to `/login` on 401.
- No retry logic anywhere
- No user-facing error for failed mark-paid/undo operations in Orders page

---

# 21. DEPLOYMENT AND PRODUCTION ARCHITECTURE

## Actual Deployment (Verified from Code)

### Frontend: Vercel

**URL:** `https://snack-track-theta.vercel.app`
**Evidence:** Hardcoded in `app.js` CORS allowlist
**Config:** `vercel.json` with SPA rewrite rule:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Purpose:** Without this, refreshing any non-root URL (e.g., `/billing`) on Vercel would return 404 because Vercel looks for an actual `/billing.html` file. The rewrite sends all routes to `index.html`, letting React Router handle routing.

**Build command:** `npm run build` (Vite build)
**Output:** Static files in `frontend/dist/` directory

### Backend: Render

**URL:** ``**Evidence:** Hardcoded in`frontend/src/api/api.js`baseURL
**Start command:**`node server.js`**Dev command:**`nodemon server.js`

### Database: MongoDB Atlas

**URI:** ``**Evidence:** In`backend/.env`file
**Note:** Credentials are present in the`.env`file. The`.gitignore` should prevent this from being committed.

## Deployment Architecture Diagram

```
User Browser
    │
    ↓ HTTPS
Vercel CDN (https://snack-track-theta.vercel.app)
    │ Serves React SPA
    │ vercel.json rewrites → index.html
    │
    ↓ HTTPS (API calls via Axios)
Render (https://snacktrack-backend-y8nw.onrender.com)
    │ Node.js 18+ server
    │ CORS: allows Vercel origin
    │ PORT=5000 (or Render's assigned port)
    │
    ↓ MongoDB Wire Protocol (TLS)
MongoDB Atlas (cluster0.ur4i6pw.mongodb.net)
    │ snacktrack database
    │ users collection
    │ orders collection
    │
    └── node-cron (in-process, 10 PM IST)
            │
            ↓ HTTPS
        Telegram Bot API
            │
            ↓ Telegram push notification
        Owner's Telegram App (chat ID: 1559650997)
```

## Development vs Production

| Aspect       | Development                | Production                                     |
| ------------ | -------------------------- | ---------------------------------------------- |
| Frontend URL | `http://localhost:5173`    | `https://snack-track-theta.vercel.app`         |
| Backend URL  | `http://localhost:5000`    | `https://snacktrack-backend-y8nw.onrender.com` |
| API baseURL  | Hardcoded to Render URL    | Same (api.js has no env-based URL)             |
| Database     | Same MongoDB Atlas cluster | Same cluster                                   |
| Env vars     | `.env` file                | Platform environment variables                 |
| Run command  | `nodemon server.js`        | `node server.js`                               |

**Inconsistency:** The frontend's `api.js` has a hardcoded production URL (`https://snacktrack-backend-y8nw.onrender.com/api`). For local development, engineers would need to change this URL or configure a local proxy. A better approach is `import.meta.env.VITE_API_URL` with `.env.local` for development.

## Cold Starts (Render Free Tier)

Render's free tier spins down after 15 minutes of inactivity. The first request after inactivity triggers a cold start (~30 seconds delay). This is relevant for the demo deployment. Production would use a paid plan with always-on instances.

---

# 22. CI/CD ANALYSIS

## What Was Found

**No `.github/workflows/` directory exists** in the SnackTrack repository root. There are `.github` directories in `node_modules` (from third-party packages), but no GitHub Actions workflow files authored for this project.

**Deployment is platform-level auto-deployment**, not a custom CI/CD pipeline:

- Vercel connects to the GitHub repository and auto-deploys on every push to `main`
- Render connects to the GitHub repository and auto-deploys on every push to `main`

## Verdict: PARTIALLY VERIFIED

**What exists:**

- Auto-deployment on push to `main` branch (standard Vercel/Render GitHub integration)
- No manual deployment steps required after push

**What does NOT exist:**

- No automated tests
- No GitHub Actions workflows
- No pre-deployment build verification
- No staging environment
- No rollback mechanism
- No deployment approval gates

## How to Answer "You mentioned CI/CD — explain it"

"When I say CI/CD on my resume, I'm referring to the auto-deployment pipelines configured through Vercel and Render. Both platforms connect directly to the GitHub repository, and whenever I push to the `main` branch, Vercel automatically rebuilds and redeploys the frontend, and Render restarts the backend. So the deployment process is automated — I don't manually run any deployment commands. However, I should be honest that I don't have custom GitHub Actions workflows with automated testing or build verification. It's continuous deployment via platform integration, not a full CI pipeline with test gates. If I were building this for production, I'd add GitHub Actions to run linting, unit tests, and integration tests before the deployment hook fires."

---

# 23. RESUME BULLET-BY-BULLET DEFENSE

## Claim 1: "Full-stack smart POS and analytics system for food retail"

**STATUS: VERIFIED**

**Evidence:** Frontend `Billing.jsx` (POS), `Dashboard.jsx` (analytics), React + Express + MongoDB (full-stack), food snack items hardcoded in `snacks.js`

**What it means:** A web-based point-of-sale system with a billing interface for creating orders and an analytics dashboard showing sales metrics.

**Interview explanation:** "SnackTrack is a full-stack application — React on the frontend, Express on the backend, MongoDB for storage. The 'smart' part refers to the analytics: instead of just recording orders, it visualizes trends, top items, peak hours, and earnings in an interactive dashboard. It's designed for small food stalls — specifically for Indian street food items."

---

## Claim 2: "Billing"

**STATUS: VERIFIED**

**Evidence:** `Billing.jsx` — local cart state, `SnackCard.jsx` quantity inputs, `BillSummary.jsx` showing subtotal/tax/total, `API.post("/orders", ...)` on submit

**Limitation to be honest about:** The menu is hardcoded (not database-driven). Tax is shown on screen but not stored in the database. The backend trusts the frontend's price values without server-side validation.

---

## Claim 3: "Order management"

**STATUS: VERIFIED**

**Evidence:** `Orders.jsx` — lists all orders, `orderController.js` — createOrder, getOrders, markOrderPaid, undoPayment, deleteOrder, `Order.js` model with items[], paymentDone, orderId, createdBy

---

## Claim 4: "Payment tracking"

**STATUS: VERIFIED (with clarification required)**

**Evidence:** `paymentDone` Boolean field in `Order.js`, `markOrderPaid` and `undoPayment` controllers, Orders page with "Mark as Paid"/"Undo Payment" buttons

**Critical clarification:** "Payment tracking" means recording that payment occurred (true/false). It does NOT mean integrating with a payment gateway. Money is not actually processed through the application.

---

## Claim 5: "JWT authentication"

**STATUS: VERIFIED**

**Evidence:** `generateToken.js` — `jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" })`, `authMiddleware.js` — `jwt.verify(token, JWT_SECRET)`, `authController.js` — login returns JWT

---

## Claim 6: "Role-based access for owner and staff"

**STATUS: VERIFIED**

**Evidence:** `User.js` — `role: { enum: ["owner", "staff"], default: "staff" }`, `roleMiddleware.js` — `authorize(...roles)`, `dashboardRoutes.js` — `authorize("owner")` on summary, `Navbar.jsx` — `isOwner && <Link to="/dashboard">`

---

## Claim 7: "Analytics dashboard"

**STATUS: VERIFIED**

**Evidence:** `Dashboard.jsx` — 6 Recharts charts + stat cards, `dashboardController.js` — computes all metrics, `dashboardRoutes.js` — `GET /summary` owner-only

---

## Claim 8: "Revenue trends"

**STATUS: VERIFIED**

**Evidence:** `last7Days` array in `dashboardController.js` — 7-day earnings per day rendered as `<BarChart>`, monthly earnings stat card

---

## Claim 9: "Top-selling items"

**STATUS: VERIFIED**

**Evidence:** `topSnacks` computed in `dashboardController.js` — iterates all paid order items, builds snackMap, sorts by qty descending, slices top 6, rendered as donut `<PieChart>` in `Dashboard.jsx`

---

## Claim 10: "Telegram bot automation"

**STATUS: VERIFIED**

**Evidence:** `telegram_service.js` — `axios.post` to Telegram Bot API, `daily_summary_job.js` — `node-cron` schedule, `buildDailySummary()` — queries MongoDB and formats message

---

## Claim 11: "Daily sales summary notifications"

**STATUS: VERIFIED**

**Evidence:** Cron at `"0 22 * * *"` IST, message includes today's earnings, paid orders, pending orders, top snack

---

## Claim 12: "Helmet"

**STATUS: VERIFIED**

**Evidence:** `app.js` — `import helmet from "helmet"`, `app.use(helmet({ crossOriginResourcePolicy: false }))`, installed as `"helmet": "^8.1.0"` in package.json

---

## Claim 13: "CORS"

**STATUS: VERIFIED**

**Evidence:** `app.js` — `import cors from "cors"`, `app.use(cors({ origin: [...], credentials: true }))`, two origins explicitly allowed

---

## Claim 14: "Rate limiting"

**STATUS: VERIFIED**

**Evidence:** `app.js` — `import rateLimit from "express-rate-limit"`, limiter configured at 100/15min, `app.use("/api", limiter)`

---

## Claim 15: "Frontend deployment"

**STATUS: VERIFIED**

**Evidence:** `vercel.json` in frontend directory, CORS in `app.js` allows `https://snack-track-theta.vercel.app`, `api.js` baseURL points to Render backend

---

## Claim 16: "Backend deployment"

**STATUS: VERIFIED**

**Evidence:** `api.js` baseURL is `https://snacktrack-backend-y8nw.onrender.com/api`, package.json has `"start": "node server.js"` script for Render

---

## Claim 17: "CI/CD"

**STATUS: PARTIALLY VERIFIED**

**Evidence:** No GitHub Actions workflows found. Deployment is automated via Vercel/Render platform GitHub integration (push-to-deploy).

**Honest framing:** Platform-based continuous deployment exists. Custom CI pipeline with automated tests does not.

---

# 24. SNACKTRACK INTERVIEW QUESTION BANK

## LEVEL 1 — Basic Project Questions

**Q1: Tell me about SnackTrack.**
SnackTrack is a full-stack web-based POS and analytics system I built for small Indian snack stalls. The idea came from the observation that small food stalls have no way to track what they're selling or how much they're making — they just rely on cash counting at the end of the day. I built a complete system where staff can create orders from a digital menu, track payment status, and the owner gets a real-time analytics dashboard and a nightly Telegram summary.

**Q2: What problem does it solve?**
The lack of sales visibility for small food businesses. An owner currently has no data on their best-selling item, their peak hours, or their daily vs. monthly revenue trend. SnackTrack gives them that data through a dashboard and an automated nightly report, without requiring any accounting expertise.

**Q3: Who uses it?**
Two roles: the owner (access to Dashboard, Billing, Orders) and staff (access to Billing and Orders only). In a real stall, the owner would check the dashboard for analytics and configure the system, while staff would use the billing screen to create orders during the day.

**Q4: What was your contribution?**
I designed and built the entire system — from MongoDB schema design, Express REST API, JWT authentication middleware, analytics computation, cron job scheduling, Telegram integration, to the React frontend with Recharts visualization. The git history shows 29 commits by one author (Karthik-M-R).

---

## LEVEL 2 — Architecture Questions

**Q5: Explain the complete architecture.**
See Section 3 for a complete architecture diagram. The short answer: React SPA on Vercel makes HTTPS calls to an Express API on Render. Every request passes through CORS, Helmet, and rate limiting middleware, then JWT verification, then role authorization. Controllers query MongoDB Atlas via Mongoose. A node-cron job on the backend sends daily Telegram summaries.

**Q6: How does the frontend communicate with the backend?**
Via HTTPS REST API calls using Axios. The frontend has a centralized Axios instance in `api.js` configured with the backend's Render URL as the base URL. A request interceptor automatically reads the JWT from localStorage and adds it as `Authorization: Bearer <token>` to every request.

**Q7: Explain a complete billing request — from button click to database.**
(See Journey E for full trace) Short version: Staff clicks "Create Order" → `handleCreateOrder()` in `Billing.jsx` builds items array from `quantities` state → `API.post("/orders", { items, totalAmount: subtotal })` → Axios interceptor adds JWT → Express receives request → `protect` middleware verifies JWT and attaches `req.user` → `authorize("owner","staff")` checks role → `createOrder` finds today's last orderId, increments it → `Order.create(...)` writes to MongoDB → returns 201 → frontend resets form and navigates to `/orders`.

---

## LEVEL 3 — Feature Deep Dive

**Q8: How does payment tracking work?**
There's a `paymentDone` Boolean field on each Order document (default: false). When staff marks an order paid on the Orders page, the frontend calls `PATCH /api/orders/:id/pay`, which finds the order and sets `paymentDone = true`. The Orders page re-fetches after each action to show the updated state. There's no payment gateway — it's a manual toggle.

**Q9: How does the billing total work?**
The `snacks.js` file has hardcoded prices. As staff enters quantities, `Billing.jsx` computes `subtotal = snacks.reduce((sum, snack) => sum + snack.price * (quantities[snack.id] || 0), 0)`. `BillSummary.jsx` displays subtotal, 5% tax, and total. However, only the pre-tax `subtotal` is sent to the backend as `totalAmount`. This is an inconsistency I should fix — the database stores pre-tax amounts while the UI shows tax-inclusive totals.

**Q10: How are top-selling items calculated?**
In `dashboardController.js`, after loading all paid orders, I iterate every order's items array, accumulate quantities per item name in a `snackMap` object, convert it to an array, sort by quantity descending, and take the top 6. This is done entirely in JavaScript (not MongoDB aggregation).

---

## LEVEL 4 — Database Questions

**Q11: Why MongoDB over PostgreSQL?**
MongoDB's document model naturally fits orders with variable-length item arrays. Each order is a self-contained document with items embedded. In PostgreSQL, I'd need a separate `order_items` table with foreign keys and JOIN queries. MongoDB also made schema iteration faster during development. However, the trade-offs are: no ACID multi-document transactions by default, and my analytics query (`Order.find()`) doesn't scale well. For a system that needed complex relational queries or strong transactional guarantees, PostgreSQL would be better.

**Q12: Explain the Order schema.**
(See Section 9). Key design decision: items are embedded as sub-documents rather than referenced. This denormalization means historical orders retain the price at which items were actually sold, even if the menu price changes. It's the right choice for accounting accuracy.

**Q13: What is `.populate()` and when is it used?**
In `getOrders`, `Order.find().populate("createdBy", "email role")` replaces the `createdBy` ObjectId with the actual User document's `email` and `role` fields. Without populate, the frontend would only see a raw ObjectId. Populate performs a separate query to the users collection and merges the data. The second argument `"email role"` is a projection — only those two fields are included, excluding sensitive fields like password.

**Q14: How does Mongoose prevent invalid roles?**
The `role` field in `User.js` has `enum: ["owner", "staff"]`. If code tries to create or save a user with `role: "superadmin"`, Mongoose throws a `ValidationError` before sending any data to MongoDB. It's schema-level enforcement.

---

## LEVEL 5 — Authentication and Security

**Q15: What is JWT? Explain its structure.**
JWT (JSON Web Token) is a stateless authentication mechanism. It has three base64url-encoded parts separated by dots: Header (`{ alg: HS256, typ: JWT }`), Payload (in SnackTrack: `{ id: userId, iat, exp }`), and Signature (HMAC-SHA256 of header.payload using the secret). The signature makes tampering detectable. The server doesn't store session state — it just verifies the signature.

**Q16: JWT vs sessions — which did you use and why?**
I used JWT. Sessions require server-side storage (in memory or Redis) and sticky sessions in a load-balanced environment. JWTs are stateless — the token contains everything needed for verification. For a deployment on Render (potentially stateless), JWTs are simpler. The downside is that I can't revoke a JWT without a blacklist. For this project's scale, that's an acceptable trade-off.

**Q17: How are passwords stored?**
Using bcryptjs with 10 salt rounds. A Mongoose `pre("save")` hook hashes the password before the document reaches MongoDB. When login happens, `user.matchPassword(enteredPassword)` calls `bcrypt.compare(entered, stored_hash)`. Bcrypt is deliberately slow, making brute-force infeasible. Passwords are never returned in API responses — `User.findById(id).select("-password")` excludes the field.

**Q18: What does Helmet do exactly?**
It's a middleware collection that sets 11 HTTP security headers. Key ones: `X-Frame-Options: SAMEORIGIN` prevents clickjacking, `X-Content-Type-Options: nosniff` prevents MIME sniffing, `Strict-Transport-Security` forces HTTPS. In SnackTrack, I configured it with `crossOriginResourcePolicy: false` to not conflict with CORS.

**Q19: Does CORS prevent someone from hacking your API?**
No. CORS is a browser policy — it prevents other websites' JavaScript from reading your API responses. But curl, Postman, or any server-side HTTP client bypass CORS entirely. Authentication (JWT) and authorization (role checks) are the actual security controls.

---

## LEVEL 6 — Aggressive Cross-Questioning

**Q20: "You said this is a POS. What exactly happens when I press Pay?"**
"When staff clicks 'Mark as Paid' on an order in the Orders page, the `markPaid(orderId)` function in `Orders.jsx` calls `API.patch('/orders/${orderId}/pay')`. The Axios interceptor attaches the JWT. On the backend, `protect` verifies the JWT and attaches `req.user`. `authorize('owner', 'staff')` confirms the role. `markOrderPaid` calls `Order.findById(req.params.id)`, sets `order.paymentDone = true`, calls `order.save()`, and returns the updated document. The frontend then calls `fetchOrders()` to re-render the list. There is no real payment processing — no money moves. It's a manual toggle."

**Q21: "Where does the final price come from?"**
"Prices come from `data/snacks.js`, a hardcoded JavaScript file in the frontend. There is no product catalog in the database. The frontend computes subtotal locally and sends it to the backend. The backend does not validate or recalculate the price — it trusts the frontend. This is a security and consistency weakness I'd fix in production by moving prices to a MongoDB Products collection and recalculating totals server-side."

**Q22: "Why should I trust the frontend total?"**
"You shouldn't, and the current implementation does trust it. This is one of the limitations I'd address in production. The backend accepts whatever `totalAmount` the frontend sends. A clever user could intercept the Axios request and modify the price. The fix is: backend maintains the price catalog, request body contains only `{ productId, qty }`, and the backend computes the total."

**Q23: "Can a staff member call the owner dashboard API directly?"**
"Yes, technically. A staff member has a valid JWT token. They could use curl or Postman with `Authorization: Bearer <their-token>` to call `GET /api/dashboard/summary`. But the `authorize('owner')` middleware checks `req.user.role`. Since the staff's role is `'staff'`, `roles.includes('staff')` returns false, and the middleware returns `403 Forbidden`. The analytics data is never sent. The frontend hiding (no Dashboard link for staff) is UX — the backend authorization is the actual protection."

**Q24: "How do you calculate top-selling products? Walk me through the code."**
"In `dashboardController.js`, after getting all orders with `Order.find()`, I filter to paid orders only. Then I iterate every paid order's `items` array. For each item, I accumulate its `qty` into a JavaScript object called `snackMap`, where keys are item names and values are cumulative quantities. Then I convert that object to an array using `Object.entries()`, map it to `{ name, qty }` objects, sort by `qty` descending, and take the first 6 with `.slice(0, 6)`. This is entirely in JavaScript — no MongoDB aggregation pipeline is used, which is a scalability limitation I acknowledge."

**Q25: "Did you actually integrate a payment gateway or just record payment information?"**
"Honest answer: I only record payment information. There is no Razorpay, Stripe, or UPI integration. When an order is marked paid, I flip a `paymentDone` boolean in MongoDB from false to true. The actual money transfer happens in the physical world — cash is handed over, and then staff clicks the button. For a real production POS, I'd integrate Razorpay or PhonePe and update payment status via webhook after the gateway confirms the transaction."

**Q26: "How is the Telegram summary triggered?"**
"It's triggered by `node-cron`. When `server.js` starts, it imports `daily_summary_job.js`, which registers a cron job with the expression `"0 22 * * *"` in the `Asia/Kolkata` timezone. This fires at exactly 10:00 PM IST every day. The job calls `buildDailySummary()` which queries MongoDB for today's paid orders, computes earnings and top snack, formats a message, and calls `sendTelegramMessage()`, which uses Axios to POST to the Telegram Bot API. The bot then delivers the message to the owner's Telegram chat."

**Q27: "How would your analytics perform with 10 million orders?"**
"Badly. `getDashboardSummary` calls `Order.find()` which loads all 10 million orders into Node.js memory. That would exhaust RAM and take minutes. The fix is MongoDB Aggregation Pipelines: `$match` to filter paid orders, `$unwind` to expand items arrays, `$group` to sum per item — all executed inside the database engine with index support. I'd also add compound indexes like `{ paymentDone: 1, createdAt: -1 }` to make date-range queries fast. For the daily job, I'd pre-compute and cache summaries, so the dashboard reads from a tiny summary document rather than scanning 10 million order records."

---

## LEVEL 7 — Production/Senior Questions

**Q28: How would you handle concurrent billing from two staff members simultaneously?**
"Currently, the `orderId` assignment has a race condition. Both requests could read the same 'last order today' and generate duplicate orderId values. The fix is to use an atomic counter — either a dedicated MongoDB document with `$inc` operation (atomic), or use MongoDB's built-in ObjectId timestamps for ordering instead of sequential IDs. For the order creation itself, it's safe because each `Order.create()` is an independent insert."

**Q29: How would you make order creation transactional if you added inventory?**
"MongoDB supports multi-document transactions on replica sets (which Atlas provides). I'd wrap the inventory decrement and order creation in a session:

```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Order.create([orderData], { session });
  await Inventory.updateMany([decrements], { session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

If either operation fails, the transaction rolls back, maintaining consistency."

**Q30: How would you scale the Telegram job reliably?**
"The current in-process cron would miss jobs if the server is down at 10 PM (Render free tier restarts, deployments, etc.). Production options: (1) Use Render's built-in cron job feature — a separate process that runs independently of the web server. (2) AWS EventBridge + Lambda — the job runs serverlessly, completely decoupled from the API server. (3) A Redis-backed job queue (BullMQ) with a persistent job that retries on failure. Also, I'd add dead-letter queue handling — if Telegram fails, store the unsent message and retry with exponential backoff."

**Q31: How would you add caching to the analytics?**
"The dashboard summary is expensive (full table scan). I'd cache it in Redis with a TTL of 5 minutes. On cache hit, return the cached JSON immediately. On cache miss, compute it, store in Redis, and return it. For the nightly summary specifically, I'd store the computed result in a MongoDB `DailySummaries` collection so historical summaries are available without re-scanning orders."

**Q32: How would you add inventory management?**
"Create an `Inventory` model with `{ itemName, stockQty, threshold }`. On order creation, use `Inventory.updateOne({ itemName }, { $inc: { stockQty: -qty } })` with a MongoDB transaction. Add an `$where` check or a post-update hook: if `stockQty < threshold`, send a Telegram alert to the owner. Add an owner-only Inventory page. Disable items on the billing screen when stock is 0 (either check the backend on page load, or use a real-time update via Socket.io if strictness is required)."

---

# 25. BRUTAL SNACKTRACK MOCK INTERVIEW

---

**Interviewer:** "Tell me about SnackTrack."

### Weak Answer:

"It's a POS system I built using the MERN stack. Users can create orders, track payments, and view analytics."

### Good Answer:

"SnackTrack is a full-stack POS and analytics system for small Indian snack stalls — the kind of food counter that currently has no way to track what they're selling. I built the complete system: a billing interface where staff create orders, an orders page to manage payment status, and an owner-only analytics dashboard showing daily and monthly earnings, top-selling items, peak hours, and revenue trends. The system also has a Telegram bot that sends the owner a nightly sales summary at 10 PM automatically."

### Excellent Answer:

"SnackTrack is a full-stack POS system I built for small food stalls. The real-world problem it solves is that small food businesses — a samosa stall, a tea counter — have absolutely no data visibility. They make cash transactions all day and have no idea which item sells the most, when their rush hour is, or how their revenue compares week to week. I digitized the entire order lifecycle: staff create bills from a grid of 7 menu items, those orders go to MongoDB, and the owner gets a real-time analytics dashboard with Recharts visualizations covering earnings trends, top sellers, peak business hours, and a paid-vs-pending payment status breakdown. I also built an automated Telegram reporting system — a node-cron job fires at 10 PM IST every night, queries the day's sales, and sends the owner a formatted summary directly to their phone. Technically, I implemented JWT authentication with a two-layer middleware pattern for authentication and role-based access control, bcrypt password hashing, and API security with Helmet, rate limiting, and CORS. The frontend is React 19 on Vercel, the backend is Express on Render, and the database is MongoDB Atlas."

---

**Interviewer:** "Walk me through exactly what happens when a staff member creates a bill."

_(Pause, don't rush)_

### Excellent Answer:

"Sure. The staff is on the Billing page. They see 7 snack items rendered from a hardcoded array in `snacks.js`. Each item has a number input. As the staff enters quantities, React state in `Billing.jsx` updates a `quantities` object — keys are snack IDs, values are quantities. The subtotal is computed on every render using a `reduce` over the snacks array. `BillSummary` displays the subtotal plus a 5% tax and a total. When the staff clicks 'Create Order', the `handleCreateOrder` function builds an `orderItems` array — filtering items with qty > 0, mapping each to `{ name, qty, price, total }`. Then it calls `API.post('/orders', { items: orderItems, totalAmount: subtotal })`.

The Axios request interceptor automatically attaches the JWT from localStorage. On the backend, Express runs the CORS, Helmet, and rate limiter middleware first. Then the request hits the order route, where `protect` extracts the JWT from the Authorization header, verifies it with `jwt.verify()`, fetches the user from MongoDB excluding password, and attaches it to `req.user`. Then `authorize('owner', 'staff')` confirms both roles can create orders.

In `createOrder`, the controller finds today's last order by querying with a date range to determine the next `orderId`, then calls `Order.create()` with the items, totalAmount, orderId, and `createdBy: req.user._id`. MongoDB writes the document with an auto-generated `_id` and timestamps. The backend returns a 201 with the created order. The frontend resets the quantities state and navigates to `/orders`.

One thing I should point out: the `BillSummary` shows the total with 5% tax, but I send `totalAmount: subtotal` — the pre-tax amount — to the backend. So the database stores pre-tax values. That's a inconsistency I'd fix in a production version."

---

**Interviewer:** "You said you have role-based access. How exactly does it work? And can a staff member bypass it?"

### Excellent Answer:

"The system has two layers. The first is `protect` middleware — it verifies who the user is by checking the JWT. The second is `authorize` middleware — it checks what that user is allowed to do.

`authorize` is a higher-order function. When I write `authorize('owner')` on the dashboard route, it creates middleware that checks if `req.user.role` is in the `['owner']` array. If a staff member's role is `'staff'`, it returns 403.

Can staff bypass it? Only at the frontend level. The Navbar hides the Dashboard link for staff — they won't see it. But if a staff member opens their browser's dev tools and navigates to `/dashboard`, React renders the page, `useEffect` fires, and the API call goes out. The backend's `authorize('owner')` rejects it with 403 Forbidden. No data is returned. So the frontend hiding is UX convenience — the backend authorization is the actual enforcement.

The role is stored in the `User` document in MongoDB. It's NOT in the JWT payload — the token only contains the user's ObjectId. The `protect` middleware fetches the full user from MongoDB on every request to get the current role. This means if I changed someone's role in the database, it takes effect immediately on the next request."

---

**Interviewer:** "Your analytics fetch all orders from MongoDB. What happens with 100,000 orders?"

### Excellent Answer:

"That would be a serious performance problem. The current implementation calls `Order.find()` with no filter, loading all 100,000 documents into Node.js memory. At maybe 1-2KB per order document, that's 100-200MB of data transferred from MongoDB to Node.js. The computation would be slow, memory pressure could crash the server, and every dashboard page load would be expensive.

The correct solution is MongoDB Aggregation Pipelines. Instead of transferring all data to Node.js, I'd push the filtering and grouping into the database engine. For top-selling snacks, the pipeline would be: `$match: { paymentDone: true }` to filter in the database, `$unwind: '$items'` to flatten the items array, `$group: { _id: '$items.name', totalQty: { $sum: '$items.qty' } }` to aggregate by item name, `$sort: { totalQty: -1 }`, `$limit: 6`. Only 6 records would come back over the wire.

I'd also add compound indexes — `{ paymentDone: 1, createdAt: -1 }` would make the date-range queries for daily summaries fast.

And for the nightly Telegram job, I'd pre-compute and store the daily summary in a `DailySummaries` collection at end-of-day. Then the dashboard could read from that tiny collection instead of scanning all orders.

I acknowledge this is a real scalability limitation in the current implementation — I deliberately chose JavaScript array methods for developer simplicity at small scale."

---

**Interviewer:** "Your Telegram job uses node-cron. What happens if the server is down at 10 PM?"

### Excellent Answer:

"The message is lost. That's a real limitation of in-process scheduling. `node-cron` runs inside the same Node.js process as the web server. If Render restarts the server for a deployment at 9:58 PM, or if the free-tier server spins down due to inactivity, the 10 PM trigger never fires.

The production fix is to use an external scheduler. Options: Render has a built-in 'Cron Job' service type — a separate process that runs on a schedule, completely independent of the web server. AWS EventBridge can trigger a Lambda function at any cron schedule. These run regardless of whether my API server is up.

I also don't have retry logic for Telegram failures. If the Telegram API returns an error or times out, the message is just logged and lost. In production I'd add exponential backoff retry with a maximum of 3 attempts, and store unsent messages in a `FailedNotifications` collection as a fallback.

The nodemon guard in my current code — the `global.dailySummaryJobStarted` check — prevents a different problem: duplicate registrations when nodemon auto-restarts during development. Without it, every file change restart would add another cron job instance, and the owner would get multiple messages at 10 PM."

---

**Interviewer:** "What are the biggest weaknesses in SnackTrack?"

### Excellent Answer:

"I'll be honest about the main ones.

First, the product catalog is hardcoded. The menu is a JavaScript file, not a database model. Adding an item or changing a price requires a code change and redeployment. A real POS needs a Products collection with an admin interface.

Second, the backend trusts frontend prices. When an order is created, the backend accepts `items[i].price` and `totalAmount` from the request body without validation. A user could manipulate these values. The backend should own the price catalog and recompute totals server-side.

Third, the analytics don't scale. `Order.find()` with no filter loads all orders into memory. I'd replace this with MongoDB Aggregation Pipelines for any production-scale deployment.

Fourth, the JWT is in localStorage. This is vulnerable to XSS. HttpOnly cookies would be more secure.

Fifth, there's no token revocation. A fired staff member's JWT is valid for 7 more days.

Sixth, the tax display is inconsistent — BillSummary shows 5% tax to the user, but the backend stores the pre-tax subtotal. The analytics therefore undercount revenue if tax was ever meant to be collected.

Seventh, order deletion has no server-side check for payment status — any order can be deleted regardless of payment status; the frontend just hides the button for paid orders.

I'm aware of all of these and can discuss how I'd address each one."

---

# 26. HOW TO EXPLAIN MY CONTRIBUTION

## Git History Analysis

The git log shows 29 commits, all from one author (username: Karthik-M-R). The commit history shows a clear progression:

```
82b947a  Initial commit: Setup folder structure and basic routing, built navbar
145aaea  Added snacks image and snacks array
d7e4bfe  Created billing pages used images and array
6ec51b3  Restructured repo - moved frontend to subfolder for fullstack setup
50c1cc8  Done with dashboard.jsx cool graphs are available
4211866  Implemented Role based access control (RBAC) just frontend with demo credentials
5e70aab  Done with backend folder structure + Register/login owner part
5e1e925  Implemented and tested /protected-test
de47ce1  Implemented Order model + order controller + routes and imported in app.js
07f40ff  Tested all routes of orders working fine
23115ab  Completed frontend and backend integration using axios. Left with frontend dummy data replacement part
297bcac  Replaced Order.jsx page with backend integration + undopayment both frontend and backend implemented
91ca851  Done with connecting backend for dashboard.jsx, order.jsx, billing.jsx and modified order page
d14145a  Added telegram alert feature + made some required changes, left with verifying + deployment
2a2ea18  Commented test routes and console.log
194b18d  Implemented security using helmet + rate limit + cors
8399ea3  Increased logo size in navbar
437705d  Modified readme files, ready for deployment
4052547  baseURL changed to deployed render url
ce5d32c  Added vercel deployed link to backend
95e8f26  Added wrong url now fixed that
c7c87a6  Moved cors before Helmet it was causing login issue
2cf962f  Commented register (not required for POS) + added about.md and architecture.md
6d76368  Fixed refresh issue by adding vercel.json
b6c4d54  Added demo images
71ba3ba  Images in demo folder
07e4170  Update repository URL in installation instructions
8da70fc  Added demo credentials
350dfab  Edited readme
```

**What can be honestly claimed:**

- Designed and built the entire application from scratch as a solo project
- Built in iterative phases: frontend UI first → backend API → integration → security → deployment
- Made real debugging decisions (e.g., CORS ordering bug fixed in commit `c7c87a6`)
- Deliberately disabled registration with security reasoning (commit `2cf962f`)
- Self-diagnosed and fixed the Vercel refresh issue with `vercel.json` (commit `6d76368`)

---

## What to Say About Your Contribution

"I built SnackTrack entirely on my own. You can see from the git history that it was an iterative, solo build — I started with the frontend UI and hardcoded data, then built the backend API, then integrated them with Axios, then added security middleware, and finally deployed. Every design decision in the codebase was mine: the schema design, the two-middleware auth+RBAC pattern, using node-cron for the Telegram job, the decision to use JavaScript array methods for analytics instead of aggregation pipelines, and the decision to disable the registration endpoint for security reasons. I also debugged real issues — I had CORS before Helmet causing login failures in production, and Vercel serving 404 on page refresh before I added `vercel.json`."

---

# 27. ENGINEERING DECISIONS AND TRADE-OFFS

## Decision 1: MongoDB over PostgreSQL

**What:** Document database for persistent storage
**Why:** Orders have variable-length item arrays. In MongoDB, each order is a self-contained document. In PostgreSQL, items would need a separate table with foreign keys and JOIN queries.
**Alternative:** PostgreSQL with an `order_items` table
**Trade-off:** MongoDB's flexibility makes schema iteration faster, but lacks ACID multi-document transactions by default and has weaker support for complex relational queries.
**Current Limitation:** `Order.find()` for analytics — no indexes, full collection scan.
**Production Improvement:** Aggregation pipelines, compound indexes `{ paymentDone: 1, createdAt: -1 }`, materialized daily summaries.

## Decision 2: JWT over Sessions

**What:** Stateless authentication
**Why:** No server-side session storage needed. Works across stateless deployments.
**Alternative:** Express sessions with Redis store
**Trade-off:** No token revocation without a blacklist. Token in localStorage is XSS-vulnerable.
**Production Improvement:** HttpOnly cookies, short-lived access tokens, refresh tokens, Redis blacklist.

## Decision 3: Hardcoded Menu in `snacks.js`

**What:** Product catalog as a static JavaScript file
**Why:** Simplified development for a demo/portfolio project with a fixed menu.
**Alternative:** Products collection in MongoDB with a management interface
**Trade-off:** Menu cannot be changed without code deployment. Prices cannot be updated at runtime.
**Production Improvement:** Add a `products` collection, owner-only CRUD API, and admin UI.

## Decision 4: JavaScript Array Methods for Analytics (Not Aggregation)

**What:** `Order.find()` + `.filter()/.reduce()/.sort()` in Node.js
**Why:** Developer familiarity. Simpler to write and debug for small data sets.
**Alternative:** MongoDB aggregation pipelines
**Trade-off:** Not scalable. All data transferred to application memory.
**Current Limitation:** Would fail with 10,000+ orders due to memory and latency.
**Production Improvement:** Full aggregation pipeline refactor with `Promise.all()` for parallel queries.

## Decision 5: node-cron for Scheduled Jobs

**What:** In-process cron scheduler for daily Telegram report
**Why:** Simple to implement — no external service required.
**Alternative:** External scheduler (Render Cron, AWS EventBridge, BullMQ)
**Trade-off:** Job is lost if the server is down at trigger time.
**Production Improvement:** External scheduler + retry queue.

## Decision 6: Disabling User Registration

**What:** Commenting out `registerUser` and the register route
**Why:** The original implementation accepted `role` from the request body — a critical security vulnerability allowing anyone to self-assign the owner role.
**Alternative:** Protected registration with invite codes or admin-only creation
**Current Limitation:** No way to add users without direct database access.
**Production Improvement:** Admin-only user management API, or a secure invite-based signup flow.

## Decision 7: Local Cart State (no global state manager)

**What:** `quantities` state in `Billing.jsx` only
**Why:** Cart doesn't need to persist across pages. Each page manages its own data.
**Alternative:** Redux, Zustand, or React Context
**Trade-off:** Navigating away from Billing loses the cart. No cross-page state sharing.
**Production Improvement:** Cart in `sessionStorage` or React Context to survive navigation.

---

# 28. CURRENT LIMITATIONS AND FUTURE IMPROVEMENTS

## Easy Improvements (Low Complexity)

1. **Add 401 interceptor to Axios** — When any API call returns 401, automatically redirect to `/login`. Currently silent failure.

2. **Fix tax inconsistency** — Either remove tax display from `BillSummary` (since it's not stored) or include tax in `totalAmount` sent to backend.

3. **Fix delete order backend validation** — Add `if (order.paymentDone) return res.status(400).json({ message: "Cannot delete paid order" })` in `deleteOrder`.

4. **Protect the Telegram test route** — `GET /api/dashboard/test-daily-summary` has no authentication and sends a real Telegram message. Add `protect` middleware.

5. **Fix uncontrolled input in SnackCard** — Switch `defaultValue` to `value={quantities[snack.id] || 0}` for proper controlled input that resets when form is cleared.

6. **Environment-based API URL** — Use `import.meta.env.VITE_API_URL` in `api.js` instead of hardcoded production URL, enabling local development without editing source.

## Medium Engineering Improvements

1. **Move menu to MongoDB** — Create a `Product` model, owner-only CRUD, dynamic billing page.

2. **Server-side price validation** — Backend should recalculate `totalAmount` from database prices, not trust the frontend.

3. **Pagination for orders** — `GET /orders` returns all orders forever. Add `?page=1&limit=20` pagination.

4. **Aggregation pipeline for analytics** — Replace `Order.find()` + JS computation with MongoDB `$aggregate` pipelines.

5. **Specific rate limiting for login** — `app.use("/api/auth/login", loginLimiter)` with a stricter limit (5/min per IP).

6. **Input validation middleware** — Use `express-validator` for all route handlers.

## Production-Scale Improvements

1. **JWT security overhaul** — HttpOnly cookies, short-lived access tokens (15 min), refresh tokens (7 days), Redis blacklist for revocation.

2. **MongoDB indexes** — `{ paymentDone: 1, createdAt: -1 }`, `{ createdBy: 1 }` for common query patterns.

3. **External job scheduler** — Move cron to Render Cron service or AWS EventBridge.

4. **Reliable Telegram delivery** — Exponential backoff retry, `FailedNotifications` collection as dead-letter queue.

5. **Real-time order updates** — Socket.io with rooms for multi-device setups.

6. **Inventory management** — `Inventory` model, atomic `$inc` on order creation, low-stock Telegram alerts.

7. **Multi-outlet support** — `outletId` on all models, middleware to scope requests to outlet.

8. **Observability** — Structured logging (Winston/Pino), error tracking (Sentry), performance monitoring (New Relic/Datadog).

9. **Pre-computed analytics** — Daily summary stored in `DailySummaries` collection, refreshed at end-of-day. Dashboard reads from cache.

10. **Payment gateway integration** — Razorpay or PhonePe for actual UPI/card payments, webhook handler for payment confirmation.

---

# 29. SNACKTRACK INTERVIEW CHEAT SHEETS

## A. 30-Second Pitch

"SnackTrack is a full-stack POS system for small food stalls. Staff create digital orders, track payment status, and the owner gets a real-time analytics dashboard and an automated nightly Telegram sales summary. Built with React, Express, MongoDB, JWT auth, and node-cron."

---

## B. 1-Minute Pitch

"SnackTrack digitizes billing and analytics for small Indian snack stalls. There are two roles — owner and staff — enforced through JWT authentication and a two-middleware RBAC chain on the backend. Staff use a grid-based billing screen to create orders, which are stored in MongoDB with items, prices, and payment status. Owners see a dashboard with Recharts charts showing daily earnings, top-selling items, peak hours, and revenue trends. A node-cron job fires at 10 PM IST every night and sends the owner a Telegram summary. The backend uses Helmet, CORS, and rate limiting for security. Frontend on Vercel, backend on Render, database on MongoDB Atlas."

---

## C. 2-Minute Project Walkthrough

"SnackTrack solves a real pain point: small food stalls have zero visibility into their sales data. The system has two parts.

The frontend is React 19 with Vite and Tailwind CSS, deployed on Vercel. It has four pages — Login, Billing, Orders, and Dashboard. The login page authenticates users and stores a JWT token in localStorage along with the user's role. The Navbar shows or hides the Dashboard link based on role. The Billing page shows 7 snack items from a hardcoded array and manages a local cart using React state. When the staff clicks Create Order, an Axios POST goes to the backend with the items and total.

The backend is Express on Render. Every API request passes through CORS (Vercel origin only), Helmet (security headers), and rate limiting (100/15min per IP). Protected routes go through two middleware: `protect` (verifies JWT, loads user from MongoDB) and `authorize` (checks role). Controllers use Mongoose to query MongoDB Atlas.

The analytics come from a single owner-only endpoint that loads all orders and computes metrics in JavaScript: today's earnings, monthly totals, 7-day trends, top-selling items, peak hours, and payment status breakdown.

The Telegram bot runs as a node-cron job inside the backend process. At 10 PM IST, it queries today's sales, formats a summary message, and sends it via the Telegram Bot API using Axios.

I should mention the honest limitations: the menu is hardcoded (not database-driven), the backend trusts frontend prices, and the analytics `Order.find()` doesn't scale beyond a few thousand orders."

---

## D. Architecture in One Page

```
React SPA (Vercel) → HTTPS → Express API (Render) → Mongoose → MongoDB Atlas
     ↑ JWT in localStorage         ↑ protect + authorize middleware
     ↑ Axios interceptor            ↑ CORS + Helmet + Rate Limit

4 Pages:                        3 Route Groups:
- Login                         - /api/auth (login only)
- Billing (local cart state)    - /api/orders (CRUD, both roles)
- Orders (fetch-on-action)      - /api/dashboard (owner only)
- Dashboard (owner only)

Background:
node-cron @ 10 PM IST → buildDailySummary() → sendTelegramMessage() → Telegram Bot API → Owner's Phone
```

---

## E. POS/Billing Flow in One Page

```
snacks.js (7 hardcoded items)
    ↓
Billing.jsx: quantities = {} state
    ↓ onChange each input
setQuantities(prev => ({ ...prev, [id]: qty }))
    ↓ derived
subtotal = snacks.reduce(sum + price*qty)
    ↓ BillSummary.jsx (display only)
tax = subtotal * 0.05
displayTotal = subtotal + tax  ← SHOWN TO USER
    ↓ "Create Order" click
API.post("/orders", { items, totalAmount: subtotal })  ← PRE-TAX SENT
    ↓ backend
protect → authorize → createOrder
    ↓
orderId = lastTodayOrder.orderId + 1
Order.create({ items, totalAmount, orderId, createdBy })
    ↓
201 response → navigate("/orders")
```

---

## F. Database Models in One Page

```
users                              orders
─────────────────────              ────────────────────────────────
_id: ObjectId (PK)    ←──ref──── createdBy: ObjectId
email: String (unique)            items[]: embedded docs
password: String (bcrypt)           name, qty, price, total
role: "owner"|"staff"             totalAmount: Number
createdAt/updatedAt               orderId: Number (daily sequence)
                                  paymentDone: Boolean (default false)
                                  createdAt/updatedAt
```

---

## G. Authentication Flow

```
Login → POST /api/auth/login
  → findOne({ email }) → matchPassword(bcrypt.compare)
  → jwt.sign({ id }, SECRET, { expiresIn: "7d" })
  → localStorage: token, role, email

Every Request:
  Axios interceptor → Authorization: Bearer <token>
  ↓
protect middleware:
  jwt.verify(token, SECRET) → decoded.id
  User.findById(decoded.id).select("-password") → req.user
  ↓
next() or 401
```

---

## H. Role-Based Authorization Flow

```
Request hits protected route
    ↓
protect: JWT verified → req.user = { _id, email, role }
    ↓
authorize("owner") or authorize("owner", "staff"):
    roles.includes(req.user.role) ?
      next() → controller runs
      false → 403 "Access denied"
```

---

## I. Analytics Flow

```
GET /api/dashboard/summary (owner only)
    ↓
buildDailySummary():
  Order.find({ paymentDone: true, createdAt: today }) → todayEarnings, topSnack
  Order.countDocuments({ paymentDone: false, today }) → pendingOrders
    ↓
Order.find() → ALL orders in memory
paidOrders = orders.filter(o => o.paymentDone)
    ↓
monthlyEarnings = filter(same month).reduce(sum totalAmount)
last7Days = loop 7 days, filter by dayStr, sum
topSnacks = snackMap via forEach → sort → slice(0,6)
peakHours = hourMap[8..22] via forEach → format
topRevenueItems = revenueMap via forEach → sort → slice(0,5)
    ↓
res.json({ all metrics })
    ↓
Dashboard.jsx: setStats(data) → 6 Recharts charts rendered
```

---

## J. Telegram Automation Flow

```
server.js startup → import daily_summary_job.js
    ↓
global guard prevents duplicate registration
cron.schedule("0 22 * * *", ..., { timezone: "Asia/Kolkata" })
    ↓ fires at 10 PM IST every night
    ↓
buildDailySummary() → { todayEarnings, paidOrders, pendingOrders, topSnack }
    ↓
format message string with ₹ and emoji
    ↓
sendTelegramMessage(text):
  axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    chat_id: CHAT_ID, text
  })
    ↓
Owner receives Telegram notification
```

---

## K. Top 30 Questions I Must Know

1. What is SnackTrack and what problem does it solve?
2. Walk me through the complete system architecture.
3. What happens when staff creates a bill?
4. Where does the item price come from?
5. Should the backend trust the frontend total?
6. How does JWT authentication work in this project?
7. What's in the JWT payload?
8. Where is the token stored and what are the security implications?
9. How does role-based access control work?
10. Can staff access the owner dashboard API?
11. How are passwords hashed?
12. What does Helmet do?
13. Does CORS prevent hackers from calling your API?
14. How does rate limiting work?
15. How are analytics calculated?
16. Why didn't you use MongoDB aggregation pipelines?
17. How would analytics perform at scale?
18. How does the Telegram automation work?
19. What triggers the daily summary?
20. What happens if Telegram is down at 10 PM?
21. What is the Order schema?
22. Why are items embedded vs. referenced?
23. What does `.populate()` do?
24. Did you process actual payments?
25. What is "payment tracking" in your project?
26. How is orderId generated?
27. What are the biggest limitations in your implementation?
28. How would you add inventory management?
29. How would you scale this to 10 million orders?
30. What CI/CD did you implement?

---

## L. Top 20 Technical Concepts I Must Explain

1. JWT structure (header, payload, signature)
2. bcrypt and salt rounds
3. Mongoose `pre("save")` hook
4. `protect` vs `authorize` middleware distinction
5. Higher-order function pattern in `authorize()`
6. Mongoose `.populate()` — what it does and when
7. MongoDB document model vs relational model
8. Express middleware chain — what `next()` does
9. Axios request interceptor — how it works
10. React functional updater pattern `setState(prev => ...)`
11. Derived state vs stored state in React
12. Controlled vs uncontrolled React inputs
13. node-cron expression `"0 22 * * *"`
14. MongoDB `$gte`/`$lte` operators
15. Mongoose `select("-password")` projection
16. CORS — what it prevents and what it doesn't
17. Helmet — what headers it sets
18. localStorage security implications (XSS)
19. Aggregation pipeline stages ($match, $unwind, $group, $sort, $limit)
20. `mongoose.model()` — Schema vs Model vs Document vs Collection

---

## M. Top 10 Challenges and Improvements

| #   | Challenge/Limitation                | Improvement                       |
| --- | ----------------------------------- | --------------------------------- |
| 1   | Hardcoded menu                      | Products collection + admin UI    |
| 2   | Backend trusts frontend prices      | Server-side price validation      |
| 3   | `Order.find()` doesn't scale        | MongoDB Aggregation Pipelines     |
| 4   | In-process cron lost if server down | External scheduler                |
| 5   | JWT in localStorage (XSS risk)      | HttpOnly cookies + refresh tokens |
| 6   | No token revocation                 | Redis blacklist                   |
| 7   | Tax shown but not stored            | Consistent tax handling           |
| 8   | Delete not scoped to creator        | Creator-scoped deletion           |
| 9   | No 401 redirect on token expiry     | Axios response interceptor        |
| 10  | No input validation library         | express-validator on all routes   |

---

# 30. IMPLEMENTATION VERIFICATION REPORT

| Feature / Resume Claim          | Status                             | Evidence                                                                                                    | Important Files                                           |
| ------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| POS / Billing system            | ✅ VERIFIED                        | Staff billing UI with local cart, snack grid, order creation                                                | `Billing.jsx`, `SnackCard.jsx`, `orderController.js`      |
| Order management                | ✅ VERIFIED                        | Create, list, mark paid, undo, delete — all implemented                                                     | `orderController.js`, `orderRoutes.js`, `Orders.jsx`      |
| Payment tracking                | ✅ VERIFIED (clarification needed) | `paymentDone` boolean toggle, NOT a payment gateway                                                         | `Order.js`, `orderController.js`                          |
| JWT authentication              | ✅ VERIFIED                        | `jwt.sign` + `jwt.verify`, 7-day expiry, Bearer token                                                       | `generateToken.js`, `authMiddleware.js`                   |
| Role-based access (owner/staff) | ✅ VERIFIED                        | `authorize()` middleware, enum in User schema, route matrix                                                 | `roleMiddleware.js`, `User.js`, all route files           |
| Owner role                      | ✅ VERIFIED                        | Dashboard access, `role: "owner"` in enum                                                                   | `dashboardRoutes.js`, `User.js`                           |
| Staff role                      | ✅ VERIFIED                        | Billing + Orders only, `role: "staff"` default                                                              | `roleMiddleware.js`, `Navbar.jsx`                         |
| Analytics dashboard             | ✅ VERIFIED                        | 6 chart types, 5 stat metrics, owner-only                                                                   | `Dashboard.jsx`, `dashboardController.js`                 |
| Revenue trends                  | ✅ VERIFIED                        | Last 7 days BarChart, monthly earnings stat                                                                 | `dashboardController.js` (`last7Days`, `monthlyEarnings`) |
| Top-selling items               | ✅ VERIFIED                        | Top 6 snacks by quantity, donut PieChart                                                                    | `dashboardController.js` (`topSnacks`), `Dashboard.jsx`   |
| Telegram bot automation         | ✅ VERIFIED                        | node-cron + axios HTTP to Telegram Bot API                                                                  | `daily_summary_job.js`, `telegram_service.js`             |
| Daily sales summary             | ✅ VERIFIED                        | 10 PM IST cron, earnings/paid/pending/topSnack message                                                      | `daily_summary_job.js`, `dashboard_summary_service.js`    |
| Helmet                          | ✅ VERIFIED                        | `app.use(helmet({ crossOriginResourcePolicy: false }))`                                                     | `app.js`                                                  |
| CORS                            | ✅ VERIFIED                        | `app.use(cors({ origin: [...], credentials: true }))`                                                       | `app.js`                                                  |
| Rate limiting                   | ✅ VERIFIED                        | 100 req/15min per IP on all `/api` routes                                                                   | `app.js`                                                  |
| Frontend deployment (Vercel)    | ✅ VERIFIED                        | `vercel.json`, CORS allows Vercel URL                                                                       | `vercel.json`, `app.js`                                   |
| Backend deployment (Render)     | ✅ VERIFIED                        | `api.js` baseURL is Render URL, `start: "node server.js"`                                                   | `api.js`, `package.json`                                  |
| CI/CD pipeline                  | ⚠️ PARTIALLY VERIFIED              | Auto-deploy on push via Vercel/Render platform integration. No GitHub Actions workflows or automated tests. | `vercel.json`, Render dashboard                           |
| Real-time order updates         | ❌ NOT VERIFIED                    | Uses fetch-on-action pattern, no WebSockets/polling                                                         | `Orders.jsx`                                              |
| Payment gateway integration     | ❌ NOT VERIFIED                    | No Razorpay/Stripe/UPI — manual boolean toggle only                                                         | `Order.js`, `orderController.js`                          |
| Product/inventory management    | ❌ NOT VERIFIED                    | No product database, no inventory model — hardcoded menu                                                    | `snacks.js`                                               |
| User registration               | ❌ NOT VERIFIED                    | Registration endpoint commented out intentionally                                                           | `authController.js`, `authRoutes.js`                      |
| MongoDB aggregation pipelines   | ❌ NOT VERIFIED                    | Analytics use JS array methods, not `$aggregate`                                                            | `dashboardController.js`                                  |
| Input validation library        | ❌ NOT VERIFIED                    | Manual checks only, no express-validator or joi                                                             | `authController.js`, `orderController.js`                 |

---

> **Final Note:** This document is based on a complete line-by-line analysis of every source file in the SnackTrack repository as of August 31, 2026. Every claim is either directly traced to specific code or explicitly flagged as NOT VERIFIED. Use this document to answer questions about what the system actually does — and be honest in interviews about what it doesn't do. An interviewer who sees honest, precise answers about limitations will trust your answers about what works far more than someone who over-claims.
