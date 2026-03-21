import mongoose from 'mongoose'

const { Schema, model } = mongoose;

const reviewSchema = new Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true }
}, {
    timestamps: true
});

// One review per user per course
//reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });
//reviewSchema.index({ courseId: 1 });


export default model("Review", reviewSchema);
