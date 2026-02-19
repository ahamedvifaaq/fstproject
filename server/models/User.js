import mongoose from "mongoose";
import bcrypt, { genSalt } from "bcryptjs"
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        
    },
    googleId:{
        type:String,
    },
    refreshToken: {
        type: String,
    },
}, { timestamps: true }
);


const User = mongoose.model("User", userSchema);
export default User;