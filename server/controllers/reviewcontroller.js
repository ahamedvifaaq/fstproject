import Review from "../models/Review.js";
import Course from "../models/Course.js";

// Add a new review or update the existing one (one review per user per course)
export const addOrUpdateReview = async (req, res) => {
    const courseId = req.params.courseId;
    const userId = req.user._id;
    const { rating, comment } = req.body;
    try {
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const review = await Review.findOneAndUpdate(
            { courseId, userId },
            { rating, comment: comment || "" },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: "Review saved successfully", review });
    } catch (err) {
        console.error("Add/update review error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get all reviews for a course, plus the average rating and the current user's review
export const getCourseReviews = async (req, res) => {
    const courseId = req.params.courseId;
    const userId = req.user._id;
    try {
        const reviews = await Review.find({ courseId })
            .populate("userId", "username avatarUrl")
            .sort({ createdAt: -1 });

        const count = reviews.length;
        const averageRating = count
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
            : 0;

        const myReview = reviews.find(r => String(r.userId?._id) === String(userId)) || null;

        res.status(200).json({
            reviews,
            count,
            averageRating: Math.round(averageRating * 10) / 10,
            myReview
        });
    } catch (err) {
        console.error("Get course reviews error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Delete the current user's review for a course
export const deleteReview = async (req, res) => {
    const courseId = req.params.courseId;
    const userId = req.user._id;
    try {
        const deleted = await Review.findOneAndDelete({ courseId, userId });
        if (!deleted) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
        console.error("Delete review error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
