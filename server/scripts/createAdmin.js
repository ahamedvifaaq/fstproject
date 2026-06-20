// One-off script to create (or promote) an admin account.
// Usage: node scripts/createAdmin.js
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // change after first login

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

        if (existing) {
            existing.role = "admin";
            existing.password = hashed;
            await existing.save();
            console.log(`Updated existing user "${ADMIN_EMAIL}" to admin and reset password.`);
        } else {
            await User.create({
                username: ADMIN_USERNAME,
                email: ADMIN_EMAIL,
                password: hashed,
                role: "admin"
            });
            console.log(`Created admin user "${ADMIN_EMAIL}".`);
        }

        console.log("---------------------------------------");
        console.log(`Email:    ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
        console.log("---------------------------------------");
    } catch (err) {
        console.error("Failed to create admin:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
