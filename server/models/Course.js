import mongoose from "mongoose";
// Embedded lesson reference inside a module
const lessonRefSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    title: { type: String, required: true }
}, { _id: false });

// Module sub-document embedded in Course
const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true, default: 'General' },
    lessons: [lessonRefSchema]
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    price: { type: Number, default: 0, min: 0 },
    tags: [{ type: String, trim: true }],

    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    modules: [moduleSchema],

    studentsEnrolled: { type: Number, default: 0, min: 0 },
    allowEnrollment: { type: Boolean, default: true }
}, {
    timestamps: true
});

// courseSchema.index({ instructorId: 1 });
// courseSchema.index({ tags: 1 });
// courseSchema.index({ difficulty: 1, price: 1 });

export default mongoose.model('Course', courseSchema);
