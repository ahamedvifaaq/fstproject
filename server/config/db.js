import mongoose from "mongoose";

export const connectDB = async () => {
    const start = Date.now();
    console.log("Connecting to MongoDB…");
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // Fail fast with a clear error instead of hanging if the cluster is unreachable
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`MongoDB connected in ${Date.now() - start}ms`);
    } catch (err) {
        console.error(`MongoDB connection failed after ${Date.now() - start}ms:`, err.message);
    }
};

export default connectDB;