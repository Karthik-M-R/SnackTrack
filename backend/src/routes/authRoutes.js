import express from "express";
import { loginUser } from "../controllers/authController.js";
// registerUser import removed — see authController.js for explanation

const router = express.Router();

// router.post("/register", registerUser);  // Disabled — no self-signup needed
router.post("/login", loginUser);

export default router;
