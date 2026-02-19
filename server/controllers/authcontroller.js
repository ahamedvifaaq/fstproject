import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js"
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/tokenService.js";


import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
 /* console.log("Register attempt:", { username, email });*/

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" })
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashed });

   /* console.log("User registered:", newUser._id);*/
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" })
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        id: user._id,
        username: user.username,
        email: user.email,
        accessToken,
        refreshToken
      });

  } catch (err) {
    res.status(500).json({ message: "server error" })
  }
}

export const refreshToken = async (req, res, next) => {
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
  res.json({ message: "Logged out successfully" });
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
        sameSite: "strict",
      })
      .redirect("http://localhost:3000/home"); 
  } catch (err) {
    res.status(500).json({ message: "Google authentication failed" });
  }
};

