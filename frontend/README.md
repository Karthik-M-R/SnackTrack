# SnackTrack Frontend 🎨

The user interface for SnackTrack, built with **React** and **Vite**.

## 🛠️ Tech Stack

-   **Framework**: React 19
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS 4
-   **Routing**: React Router DOM 7
-   **HTTP Client**: Axios
-   **Charts**: Recharts

## 🚀 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

## 📂 Key Components

-   `src/pages/Billing.jsx`: Main POS interface for creating orders.
-   `src/pages/Orders.jsx`: Order management and status tracking.
-   `src/pages/Dashboard.jsx`: Analytics and visual reports.
-   `src/components/Navbar.jsx`: Navigation and role-based access control.
