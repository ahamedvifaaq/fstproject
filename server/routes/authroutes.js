import express from 'express';
import { register, login, refreshToken, logout } from "../controllers/authcontroller.js"
import { protect } from '../middleware/auth.js';
import passport from 'passport';
import { googleCallback } from '../controllers/authcontroller.js';

const router = express.Router();

/*router.use((req, res, next) => {
  console.log("Auth route accessed:", req.path);
  next();
});*/

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

router.get("/google",
  passport.authenticate("google",{scope:["profile","email"]})
);

router.get(
  "/google/callback",
  passport.authenticate("google",{session:false}),
  googleCallback
);


router.get("/profile", protect, (req, res) => {
  res.json({ message: "Protected route accessed", userId: req.userId });
});

export default router;