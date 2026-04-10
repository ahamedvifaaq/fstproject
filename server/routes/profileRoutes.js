import express from "express";
import {
    getProfile,
    updateProfile,
    changePassword,
    getDashboard,
    markLessonCompleted
} from "../controllers/profilecontroller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard",     protect, getDashboard);  
router.get("/profilepage",   protect, getProfile);
router.put("/profilepage",   protect, updateProfile);
router.put("/password",      protect, changePassword);
router.post("/lesson/:lessonId/complete", protect, markLessonCompleted);

export default router;
