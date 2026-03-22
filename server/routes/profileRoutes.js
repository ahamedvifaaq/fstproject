import express from "express";
import {
    getProfile,
    updateProfile,
    changePassword,
} from "../controllers/profilecontroller.js";
import { protect }from "../middleware/auth.js";
const router=express.Router();

router.get("/profilepage",protect,getProfile);
router.put("/profilepage",protect,updateProfile);
router.put("/password",protect,changePassword);

export default router;