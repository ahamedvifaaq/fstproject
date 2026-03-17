import express from "express";
import { register, login, refreshToken, logout, googleCallback } from "../controllers/authcontroller.js";
import { protect } from "../middleware/auth.js";
import passport from "passport";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Google auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

// Protected route example
router.get("/profile", protect, (req, res) => {
  if (req.user.role === "instructor") {
    return res.json({ message: "Welcome Instructor!", userId: req.user._id });
  }

  if (req.user.role === "admin") {
    return res.json({ message: "Welcome Admin!", userId: req.user._id });
  }

  res.json({
    message: "Protected route accessed",
    userId: req.user._id
  });
});

export default router;