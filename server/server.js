import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import passport from "./config/passport.js";

import authRoutes from "./routes/authroutes.js";
import courseRoutes from "./routes/courseroutes.js";

const app = express();

/* ---------- Connect Database ---------- */
connectDB();

/* ---------- Middlewares ---------- */

// allow frontend connection
app.use(cors());

// parse JSON body
app.use(express.json());

// cookie parser (needed for refresh token)
app.use(cookieParser());

// passport for Google auth
app.use(passport.initialize());

/* ---------- Routes ---------- */

app.use("/api/auth", authRoutes);
app.use("/api", courseRoutes);

/* ---------- Test Route ---------- */

app.get("/", (req, res) => {
  res.send("API Running...");
});

/* ---------- Start Server ---------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});