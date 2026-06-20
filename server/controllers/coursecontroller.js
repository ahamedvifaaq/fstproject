import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import multer from "multer"

// An instructor may only modify courses they created; admins may modify any.
const ownsCourse = (req, course) =>
    req.user.role === "admin" || String(course.instructorId) === String(req.user._id);

export const createCourse = async (req, res) => {
    const { title, description, difficulty, price, tags, instructorId } = req.body;
    console.log("Received create course request with data:", { title, description, difficulty, price, tags, instructorId });
    try {
        if (!title || !instructorId) {
            return res.status(400).json({ message: "Title and instructorId are required" });
        }
        // Instructors must be approved by an admin before creating courses (admins bypass)
        if (req.user.role === "instructor" && req.user.instructorStatus !== "approved") {
            return res.status(403).json({ message: "Your instructor account is pending admin approval. You cannot create courses yet." });
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
    console.log("Received add module request with data:", req.body);
    const { courseId, title } = req.body;
    try {
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required" });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (!ownsCourse(req, course)) {
            return res.status(403).json({ message: "You can only modify your own courses." });
        }
        const newModule = {
            title: title || `Module ${course.modules.length + 1}`
        }
        course.modules.push(newModule);
        await course.save();
        res.status(200).json({ message: "Module added successfully", moduleId: course.modules[course.modules.length - 1]._id });
    } catch (err) {
        console.error("Add module error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
export const createLesson = async (req, res) => {
    
    const { courseId, moduleId, title, language, videoLength, timeline, audioUrl } = req.body;
    try {
        if (!courseId || !moduleId || !title) {
            return res.status(400).json({ message: "Course ID, Module ID, and title are required" });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (!ownsCourse(req, course)) {
            return res.status(403).json({ message: "You can only modify your own courses." });
        }
        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });

        }

        

        const newLesson = await Lesson.create({
            title,
            language,
            videoLength,
            timeline,
            audioUrl

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
  
    const lessonId = req.params.id;
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

export const runCode = async (req, res) => {
    const LANGUAGE_ID_MAP = {
  plaintext: 43,

  // Core languages
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,

  // C family
  c: 50,
  cpp: 54,
  csharp: 51,

  // Backend / system
  go: 60,
  rust: 73,

  // Scripting
  bash: 46,
  shell: 46,
  php: 68,
  ruby: 72,
  perl: 85,
  lua: 64,

  // JVM / functional
  kotlin: 78,
  scala: 81,
  clojure: 86,

  // Others
  swift: 83,
  r: 80,
  sql: 82,
  pascal: 67,
  haskell: 61,
  fsharp: 87,
  vb: 84,
  "objective-c": 79
};
    console.log("Received code execution request with code:", req.body.code);
    const responce = await fetch(
        "https://ce.judge0.com/submissions?wait=true",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                language_id: LANGUAGE_ID_MAP[req.body.language] || 63, // default to JavaScript 
                source_code: req.body.code,
                stdin: req.body.stdin || ""
            })
        }
    );

    const data = await responce.json();
    
    let finalOutput = "";
    if (data.stdout !== null && data.stdout !== undefined) finalOutput += data.stdout;
    if (data.stderr !== null && data.stderr !== undefined) finalOutput += data.stderr;
    if (data.compile_output !== null && data.compile_output !== undefined) finalOutput += data.compile_output;
    if (data.message !== null && data.message !== undefined) finalOutput += data.message;
    if (!finalOutput) finalOutput = "Execution returned no output.";

    return res.status(200).json({ output: finalOutput });
};

export const getAllCourses = async (req, res) => {
    console.log("Received request to get all courses");
    try {
        const courses = await Course.find()
            .populate("instructorId", "username")
            .lean();

        // Aggregate average rating and review count per course
        const ratingStats = await Review.aggregate([
            {
                $group: {
                    _id: "$courseId",
                    averageRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);
        const statsMap = {};
        ratingStats.forEach(s => {
            statsMap[String(s._id)] = {
                averageRating: Math.round(s.averageRating * 10) / 10,
                reviewCount: s.reviewCount
            };
        });

        const coursesWithRatings = courses.map(course => ({
            ...course,
            instructorName: course.instructorId?.username || "Unknown",
            averageRating: statsMap[String(course._id)]?.averageRating || 0,
            reviewCount: statsMap[String(course._id)]?.reviewCount || 0
        }));

        res.status(200).json({ courses: coursesWithRatings, role: req.user.role, instructorStatus: req.user.instructorStatus });
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
        // isOwner lets the client show edit controls only to the course's instructor
        res.status(200).json({ modules: course.modules, isOwner: ownsCourse(req, course) });
    } catch (err) {
        console.error("Get course modules error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }


};
export const uploadAudio = (req, res) => {
  try {
    console.log("REQ.FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      fileUrl: `http://localhost:5000/uploads/${req.file.filename}`
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err); // 👈 THIS IS CRITICAL
    res.status(500).json({ error: err.message });
  }
};

export const deleteModule = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });
        if (!ownsCourse(req, course)) return res.status(403).json({ message: "You can only modify your own courses." });

        course.modules = course.modules.filter(m => String(m._id) !== String(moduleId));
        await course.save();

        res.status(200).json({ message: "Module deleted successfully" });
    } catch (err) {
        console.error("Delete module error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const deleteLesson = async (req, res) => {
    try {
        const { courseId, moduleId, lessonId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });
        if (!ownsCourse(req, course)) return res.status(403).json({ message: "You can only modify your own courses." });

        const module = course.modules.id(moduleId);
        if (!module) return res.status(404).json({ message: "Module not found" });

        module.lessons = module.lessons.filter(l => String(l.lessonId._id || l.lessonId) !== String(lessonId));
        await course.save();

        await Lesson.findByIdAndDelete(lessonId);

        res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (err) {
        console.error("Delete lesson error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const enrollCourse = async (req, res) => {
    const courseId = req.params.courseId;
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        if (!user || !course) return res.status(404).json({ message: "User or Course not found" });

        const alreadyEnrolled = user.enrolledCourses.find(c => String(c.courseId) === String(courseId));
        if (!alreadyEnrolled) {
            user.enrolledCourses.push({ courseId });
            await user.save();
            
            course.studentsEnrolled = (course.studentsEnrolled || 0) + 1;
            await course.save();

            const instructor = await User.findById(course.instructorId);
            if (instructor) {
                instructor.totalStudentsEnrolled = (instructor.totalStudentsEnrolled || 0) + 1;
                await instructor.save();
            }

            return res.status(200).json({ message: "Enrolled successfully" });
        }
        res.status(200).json({ message: "Already enrolled" });
    } catch (err) {
        console.error("Enroll error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};