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
        //console.log("Received lesson creation request with body:", req.body);
        const { courseId, moduleId, title, language, videoLength, timeline } = req.body;
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
                videoLength,
                timeline
            });
            module.lessons.push({ lessonId: newLesson._id, title: newLesson.title });
            await course.save();
            res.status(200).json({ message: "Lesson created successfully", lessonId: newLesson._id });
        } catch (err) {
            console.error("Create lesson error:", err);
            res.status(500).json({ message: "Server error", error: err.message });
        }
    };
    export const getLesson = async (req, res) => {
        //console.log("Received request for lesson with ID:", req.params.id);
        const lessonId  = req.params.id;
        try {
            const lesson = await Lesson.findById(lessonId);
            if (!lesson) {
                return res.status(404).json({ message: "Lesson not found" });
            }
            res.status(200).json(lesson);
        } catch (err) {
            console.error("Get lesson error:", err);
            res.status(500).json({ message: "Server error", error: err.message });
        }
    };

export const runCode = async (req,res) => {
    console.log("Received code execution request with code:", req.body.code);
  const responce = await fetch(
    "https://ce.judge0.com/submissions?wait=true",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        language_id: 63,
        source_code: req.body.code,
        stdin: "Alice"
      })
    }
  );

  const data = await responce.json();
  return res.status(200).json({ output: data.stdout });
};

export const getAllCourses = async (req, res) => {  
    console.log("Received request to get all courses");
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (err) {
        console.error("Get all courses error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
export const getCourseModules = async (req, res) => {
    const courseId = req.params.courseId;
    console.log("Received request to get modules for course ID:", courseId);
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json(course.modules);
    } catch (err) {
        console.error("Get course modules error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};