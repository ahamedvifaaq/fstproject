import express from "express";
import { createCourse , addModule ,createLesson, getLesson,runCode,getAllCourses,getCourseModules,uploadAudio, deleteModule, deleteLesson } from "../controllers/coursecontroller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
import {upload} from "../config/multer.js"


router.post("/upload", upload.single("audio"), uploadAudio);

// Instructor/Admin only — content creation
router.post("/createcourse", protect, authorize("instructor", "admin"), createCourse);
router.post("/addmodule", protect, authorize("instructor", "admin"), addModule);
router.post("/createlesson", protect, authorize("instructor", "admin"), createLesson);
router.delete("/deletemodule/:courseId/:moduleId", protect, authorize("instructor", "admin"), deleteModule);
router.delete("/deletelesson/:courseId/:moduleId/:lessonId", protect, authorize("instructor", "admin"), deleteLesson);

// All authenticated users — reading content
router.get("/courses", protect, getAllCourses);
router.get("/lesson/:id", protect, getLesson);
router.get("/course/:courseId/modules", protect, getCourseModules);
router.post("/output", protect, runCode);


export default router;