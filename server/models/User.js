import mongoose from "mongoose";

const { Schema, model } = mongoose;

const enrolledCourseSchema = new Schema(
{
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    enrolledAt: {
        type: Date,
        default: Date.now
    },

    progress: {
        type: Number,
        default: 0
    },

    completedLessons: [
        { type: Schema.Types.ObjectId, ref: "Lesson" }
    ]
},
{ _id: false }
);


const userSchema = new Schema(
{
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["student", "instructor", "admin"],
        default: "student"
    },

    googleId: {
        type: String
    },

    refreshToken: {
        type: String
    },

    enrolledCourses: [enrolledCourseSchema],

    progress: {
        type: Map,
        of: Schema.Types.Mixed,
        default: {}
    }
},
{
    timestamps: true
}
);

// userSchema.index({ email: 1 });

export default model("User", userSchema);