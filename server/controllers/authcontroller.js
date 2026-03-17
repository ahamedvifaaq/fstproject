import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/tokenService.js";

export const register = async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log("Register request received:", { username, email, role });

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashed,
      role
    });

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict"
      })
      .json({
        id: user._id,
        username: user.username,
        email: user.email,
        accessToken
      });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const refreshToken = async (req, res) => {

  const token = req.cookies.refreshToken;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_SECRET, async (err, decoded) => {

    if (err) return res.sendStatus(403);

    const { accessToken } = generateTokens(decoded.userId);

    res.json({ accessToken });

  });
};


export const logout = async (req, res) => {

  res.clearCookie("refreshToken");

  res.json({
    message: "Logged out successfully"
  });

};


export const googleCallback = async (req, res) => {

  try {

    const user = req.user;

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;

    await user.save();

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict"
      })
      .redirect("http://localhost:5173/Courses");

  } catch (err) {

    res.status(500).json({
      message: "Google authentication failed"
    });

  }

};