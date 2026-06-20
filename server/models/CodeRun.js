import mongoose from "mongoose";

const { Schema, model } = mongoose;

// A single code execution by a student in a lesson — used for the run-history log
const codeRunSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },

    language: { type: String, default: "javascript" },
    code: { type: String, default: "" },
    output: { type: String, default: "" },
    exitCode: { type: Number, default: null }
}, {
    timestamps: true
});

codeRunSchema.index({ userId: 1, lessonId: 1, createdAt: -1 });

export default model("CodeRun", codeRunSchema);
