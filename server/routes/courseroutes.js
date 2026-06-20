import express from "express";
import { createCourse , addModule ,createLesson, getLesson,runCode,getAllCourses,getCourseModules,uploadAudio, deleteModule, deleteLesson, enrollCourse } from "../controllers/coursecontroller.js";
import { addOrUpdateReview, getCourseReviews, deleteReview } from "../controllers/reviewcontroller.js";
import { getCourseMembers, getInstructorAnalytics } from "../controllers/analyticscontroller.js";
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
router.post("/course/:courseId/enroll", protect, enrollCourse);
router.post("/output", protect, runCode);

// Course ratings & feedback
router.get("/course/:courseId/reviews", protect, getCourseReviews);
router.post("/course/:courseId/review", protect, addOrUpdateReview);
router.delete("/course/:courseId/review", protect, deleteReview);

// Course members & instructor analytics
router.get("/course/:courseId/members", protect, authorize("instructor", "admin"), getCourseMembers);
router.get("/instructor/analytics", protect, authorize("instructor", "admin"), getInstructorAnalytics);


export default router;