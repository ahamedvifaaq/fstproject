import User from "../models/User.js";
import Review from "../models/Review.js";
import bcrypt from "bcryptjs"

export const getProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user.id).select("-password -refreshToken").populate("enrolledCourses.courseId","title thumbnail");
        if(!user) return res.status(404).json({message:"User not found"});
        res.json(user);
    }catch(err){
        res.status(500).json({message:err.message})
    }
} 

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

export const getEnrolledCourses=async(req,res)=>{
    try{
        const user = await User.findById(req.user.id)
            .populate("enrolledCourses.courseId", "title thumbnail");

        res.json(user.enrolledCourses);

    }catch(err){
        res.status(500).json({message:err.message});

    }
}

export const getCompletedCourses=async(req,res)=>{
    try{
        const user = await User.findById(req.user.id)
            .populate("enrolledCourses.courseId", "title thumbnail");

        const completed=user.enrolledCourses.filter((course)=>course.progress===100)
        res.json(completed);
    }catch(err){
         res.status(500).json({message:err.message});
    }
}

export const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user.id })
            .populate("courseId", "title");

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
