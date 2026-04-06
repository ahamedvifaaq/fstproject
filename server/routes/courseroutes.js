import express from "express";
import { createCourse , addModule ,createLesson, getLesson,runCode,getAllCourses,getCourseModules,uploadAudio } from "../controllers/coursecontroller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
import {upload} from "../config/multer.js"


router.post("/upload", upload.single("audio"), uploadAudio);

// Instructor/Admin only — content creation
router.post("/createcourse", protect, authorize("instructor", "admin"), createCourse);
router.post("/addmodule", protect, authorize("instructor", "admin"), addModule);
router.post("/createlesson", protect, authorize("instructor", "admin"), createLesson);

// All authenticated users — reading content
router.get("/courses", protect, getAllCourses);
router.get("/lesson/:id", protect, getLesson);
router.get("/course/:courseId/modules", protect, getCourseModules);
router.post("/output", protect, runCode);


export default router;