# SnackTrack Backend ⚙️

The robust API powering SnackTrack, built with **Node.js** and **Express**.

## 🛠️ Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (via Mongoose)
-   **Authentication**: JWT & Bcrypt
-   **Security**: Helmet, CORS, Rate Limiting
-   **Scheduled Jobs**: Node-Cron (for Telegram reports)

## 🚀 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    TELEGRAM_BOT_TOKEN=your_bot_token
    TELEGRAM_CHAT_ID=your_chat_id
    FRONTEND_URL=http://localhost:5173
    ```

3.  **Run Server**
    ```bash
    npm run dev
    ```

## 📡 API Endpoints

### Auth
-   `POST /api/auth/register`: Register a new user
-   `POST /api/auth/login`: Login and get token

### Orders
-   `POST /api/orders`: Create a new order
-   `GET /api/orders`: Get all orders (with filters)
-   `PUT /api/orders/:id/pay`: Mark order as paid
-   `DELETE /api/orders/:id`: Delete an order

### Dashboard
-   `GET /api/dashboard/stats`: Get daily/monthly stats
