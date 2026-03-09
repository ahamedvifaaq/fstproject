import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";

export const createCourse = async (req, res) => {
    const { title, description, difficulty, price, tags, instructorId } = req.body;
    try {
        if (!title || !instructorId) {
            return res.status(400).json({ message: "Title and instructorId are required" });
        }
        const newCourse = await Course.create({
            title,
            description,
            difficulty,
            price,
            tags,
            instructorId
        });
        res.status(201).json({ message: "Course created successfully", courseId: newCourse._id });
    } catch (err) {
        console.error("Create course error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
       }   
    };
export const addModule = async (req, res) => {
        const { courseId, title } = req.body;
        try {
            if (!courseId) {
                return res.status(400).json({ message: "Course ID is required" });
            }
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            const newModule = {
                title: title || `Module ${course.modules.length + 1}`}
            course.modules.push(newModule);
            await course.save();
            res.status(200).json({ message: "Module added successfully", moduleId: course.modules[course.modules.length - 1]._id });
        } catch (err) {
            console.error("Add module error:", err);
            res.status(500).json({ message: "Server error", error: err.message });
        }
    };
    export const createLesson = async (req, res) => {
        const { courseId, moduleId, title, language, videoLength} = req.body;
        try {
            if (!courseId || !moduleId || !title) {
                return res.status(400).json({ message: "Course ID, Module ID, and title are required" });
            } 
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            const module = course.modules.id(moduleId);
            if (!module) {
                return res.status(404).json({ message: "Module not found" });
            }
            const newLesson = await Lesson.create({
                title,
                language,
                videoLength
            });
            module.lessons.push({ lessonId: newLesson._id, title: newLesson.title });
            await course.save();
            res.status(200).json({ message: "Lesson created successfully", lessonId: newLesson._id });
        } catch (err) {
            console.error("Create lesson error:", err);
            res.status(500).json({ message: "Server error", error: err.message });
        }
    };