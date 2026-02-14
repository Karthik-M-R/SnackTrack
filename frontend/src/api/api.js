import axios from "axios";

const API = axios.create({
    baseURL: "https://snacktrack-backend-y8nw.onrender.com/api"
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;

/**
 Think of the connection between Frontend and Backend like a Restaurant.

Frontend (The Table): Where the user sits, looks at the menu (UI), and clicks buttons.

Backend (The Kitchen): Where the data is stored and the "cooking" (logic) happens.

Axios (The Waiter): The one who carries the order from the table to the kitchen and brings the food back.

What is Axios?
Axios is a library that allows your Frontend to talk to your Backend. It sends "HTTP Requests" (like GET, POST, DELETE).
 While browsers have a built-in way to do this (called fetch),
 Axios is popular because it has "superpowers" like Interceptors, which your code is using perfectly.
 */