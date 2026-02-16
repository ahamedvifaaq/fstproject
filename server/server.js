import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authroutes.js'

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
connectDB();
const PORT = process.env.PORT || 5000;


app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
