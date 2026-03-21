import express from "express";
import {
    getProfile,
    updateProfile,
    changePassword,
    getEnrolledCourses,
    getCompletedCourses,
    getUserReviews
} from "../controllers/profilecontroller.js";
import { protect }from "../middleware/auth.js";
const router=express.Router();

router.get("/profilepage",protect,getProfile);
router.put("/profilepage",protect,updateProfile);
router.put("/password",protect,changePassword);
router.get("/enrolled",protect,getEnrolledCourses);
router.get("/completed",protect,getCompletedCourses);
router.get("/reviews",protect,getUserReviews);

export default router;