import express from "express";
import { getInstructors, verifyInstructor } from "../controllers/admincontroller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin only — instructor verification
router.get("/instructors", protect, authorize("admin"), getInstructors);
router.put("/instructors/:id/verify", protect, authorize("admin"), verifyInstructor);

export default router;
