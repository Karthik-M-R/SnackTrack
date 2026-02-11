// Dashboard routes
import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController.js";

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

export default router;
