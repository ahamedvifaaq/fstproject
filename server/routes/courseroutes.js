import express from "express";
import { createCourse , addModule ,createLesson, getLesson,runCode,getAllCourses } from "../controllers/coursecontroller.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();

router.post("/createcourse", createCourse);
router.post("/addmodule", addModule);
router.post("/createlesson", createLesson);
router.get("/courses", getAllCourses);
router.get("/lesson/:id", getLesson);
router.post("/output", runCode);

export default router;