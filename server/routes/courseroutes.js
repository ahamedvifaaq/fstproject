import express from "express";
import { createCourse , addModule ,createLesson, getLesson } from "../controllers/coursecontroller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/createcourse", createCourse);
router.post("/addmodule", addModule);
router.post("/createlesson", createLesson);
router.get("/lesson/:id", getLesson);
export default router;