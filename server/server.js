import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import passport from "./config/passport.js";

import authRoutes from "./routes/authroutes.js";
import courseRoutes from "./routes/courseroutes.js";
import profileroutes from"./routes/profileRoutes.js"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




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
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// In your static middleware or a custom middleware
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "../uploads")));

/* ---------- Routes ---------- */

app.use("/api/auth", authRoutes);
app.use("/api", courseRoutes);
app.use("/api/user",profileroutes);


/* ---------- Test Route ---------- */

app.get("/", (req, res) => {
  res.send("API Running...");
});

/* ---------- Start Server ---------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});