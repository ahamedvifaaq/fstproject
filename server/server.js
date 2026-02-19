
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authroutes.js'
import passport from "./config/passport.js";

const app = express();
connectDB();
app.use(passport.initialize());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;


app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
