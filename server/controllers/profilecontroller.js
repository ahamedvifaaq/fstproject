import User from "../models/User.js";
import Course from "../models/Course.js";
import Review from "../models/Review.js";
import bcrypt from "bcryptjs";
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password -refreshToken")
            .populate("enrolledCourses.courseId", "title description difficulty price");
        if (!user) return res.status(404).json({ message: "User not found" });

        // If instructor, grab the created courses
        if (user.role === "instructor") {
            const createdCourses = await Course.find({ instructorId: user._id });
            
            let totalLessonsCreated = 0;
            let totalStudentsEnrolled = 0;

            createdCourses.forEach(c => {
                totalStudentsEnrolled += (c.studentsEnrolled || 0);
                if (c.modules) {
                    c.modules.forEach(m => {
                        if (m.lessons) totalLessonsCreated += m.lessons.length;
                    });
                }
            });

            // Need to return raw object since we are appending custom non-schema fields
            const userData = user.toObject();
            userData.createdCourses = createdCourses;
            userData.totalLessonsCreated = totalLessonsCreated;
            userData.totalStudentsEnrolled = totalStudentsEnrolled;
            return res.json(userData);
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const markLessonCompleted = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Find the course that contains this lesson
        const course = await Course.findOne({ "modules.lessons.lessonId": lessonId });
        if (!course) return res.status(404).json({ message: "Course containing this lesson not found" });

        const courseId = course._id;
        
        let enrolled = user.enrolledCourses.find(ec => ec.courseId.toString() === courseId.toString());
        
        // If user is not formally enrolled, enroll them implicitly to track progress
        if (!enrolled) {
            user.enrolledCourses.push({
                courseId: courseId,
                progress: 0,
                completedLessons: []
            });
            enrolled = user.enrolledCourses[user.enrolledCourses.length - 1];
        }

        // Record activity for analytics on every completion event
        enrolled.lastActiveAt = new Date();

        // Add lesson if not already there
        if (!enrolled.completedLessons.includes(lessonId)) {
            enrolled.completedLessons.push(lessonId);

            // Calculate progress naively based on scale of 10
            enrolled.progress = Math.min(100, Math.round((enrolled.completedLessons.length / 10) * 100));
        }

        await user.save();

        res.json({ message: "Lesson marked as completed", enrolled });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("username enrolledCourses")
            .populate("enrolledCourses.courseId", "title description difficulty price");

        if (!user) return res.status(404).json({ message: "User not found" });

        const enrolled = user.enrolledCourses;

        const totalEnrolled = enrolled.length;

        const totalLessonsCompleted = enrolled.reduce(
            (sum, ec) => sum + (ec.completedLessons ? ec.completedLessons.length : 0),
            0
        );

        const avgProgress = totalEnrolled === 0
            ? 0
            : Math.round(enrolled.reduce((sum, ec) => sum + (ec.progress || 0), 0) / totalEnrolled);

        // ── Continue Learning ──────────────────────────────────────────────
   
        const inProgress = enrolled
            .filter(ec => (ec.progress || 0) < 100)
            .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));

        const continueLearning = inProgress.length > 0 ? inProgress[0] : null;

        // ── My Courses ─────────────────────────────────────────────────────
        const myCourses = enrolled.map(ec => ({
            courseId: ec.courseId,         
            progress: ec.progress || 0,
            enrolledAt: ec.enrolledAt,
            completedLessons: ec.completedLessons ? ec.completedLessons.length : 0
        }));

        res.json({
            stats: { totalEnrolled, totalLessonsCompleted, avgProgress },
            continueLearning,
            myCourses
        });

    } catch (err) {
        console.error("getDashboard error:", err);
        res.status(500).json({ message: err.message });
    }
};

export const updateProfile=async(req,res)=>{
    try{
        const{username,bio,avatarUrl}=req.body;
        const user=await User.findById(req.user.id);
        if(!user) return res.status(404).json({message:"User not found"});

        if(username) user.username=username;
        if(bio) user.bio=bio;
        if(avatarUrl) user.avatarUrl=avatarUrl;

        await user.save();

        res.json({
            message:"profile updated succesfully"
        })


    }catch(err){
        res.status(500).json({message:err.message});
    }
}

export const changePassword=async(req,res)=>{
    try{
        const{ oldPassword ,newPassword}=req.body;

        const user=await User.findById(req.user.id);

        if(!user || !user.password){
            return res.status(400).json({ message: "User not found or Google user" });

        }

        const isMatch=await bcrypt.compare(oldPassword,user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: "Password changed successfully" });
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

