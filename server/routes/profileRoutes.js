import express from "express";
import {
    getProfile,
    updateProfile,
    changePassword,
    getDashboard,
    markLessonCompleted,
    saveCodeRun,
    getCodeRuns,
    clearCodeRuns
} from "../controllers/profilecontroller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard",     protect, getDashboard);
router.get("/profilepage",   protect, getProfile);
router.put("/profilepage",   protect, updateProfile);
router.put("/password",      protect, changePassword);
router.post("/lesson/:lessonId/complete", protect, markLessonCompleted);

// Student code run history
router.get("/lesson/:lessonId/runs",  protect, getCodeRuns);
router.post("/lesson/:lessonId/run",  protect, saveCodeRun);
router.delete("/lesson/:lessonId/runs", protect, clearCodeRuns);

export default router;
