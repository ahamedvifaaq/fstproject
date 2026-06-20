import React, { useState, useEffect } from "react";
import "./CourseReviews.css";

const API_BASE = "http://localhost:5000/api";

// Reusable star row. Interactive when onRate is provided.
function Stars({ value = 0, onRate, size = "1.4rem" }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="stars" style={{ fontSize: size }}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hover || value) >= star;
                return (
                    <span
                        key={star}
                        className={`star ${filled ? "filled" : ""} ${onRate ? "interactive" : ""}`}
                        onMouseEnter={onRate ? () => setHover(star) : undefined}
                        onMouseLeave={onRate ? () => setHover(0) : undefined}
                        onClick={onRate ? () => onRate(star) : undefined}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
}

export default function CourseReviews({ courseId }) {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [count, setCount] = useState(0);
    const [myReview, setMyReview] = useState(null);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [saving, setSaving] = useState(false);

    const role = localStorage.getItem("role");
    const isInstructor = role === "instructor";

    const fetchReviews = () => {
        const token = localStorage.getItem("accessToken");
        fetch(`${API_BASE}/course/${courseId}/reviews`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then((data) => {
                setReviews(Array.isArray(data.reviews) ? data.reviews : []);
                setAverageRating(data.averageRating || 0);
                setCount(data.count || 0);
                setMyReview(data.myReview || null);
                if (data.myReview) {
                    setRating(data.myReview.rating);
                    setComment(data.myReview.comment || "");
                }
            })
            .catch((err) => console.error("Error fetching reviews:", err));
    };

    useEffect(() => {
        if (courseId) fetchReviews();
    }, [courseId]);

    const submitReview = () => {
        if (!rating) {
            alert("Please select a star rating.");
            return;
        }
        const token = localStorage.getItem("accessToken");
        setSaving(true);
        fetch(`${API_BASE}/course/${courseId}/review`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ rating, comment })
        })
            .then((res) => res.json())
            .then(() => fetchReviews())
            .catch((err) => console.error("Error saving review:", err))
            .finally(() => setSaving(false));
    };

    const deleteMyReview = () => {
        if (!window.confirm("Delete your review?")) return;
        const token = localStorage.getItem("accessToken");
        fetch(`${API_BASE}/course/${courseId}/review`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then(() => {
                setRating(0);
                setComment("");
                fetchReviews();
            })
            .catch((err) => console.error("Error deleting review:", err));
    };

    return (
        <div className="course-reviews">
            <div className="reviews-summary">
                <h2>Ratings &amp; Feedback</h2>
                <div className="summary-row">
                    <span className="avg-number">{averageRating.toFixed(1)}</span>
                    <Stars value={Math.round(averageRating)} />
                    <span className="review-count">
                        {count} {count === 1 ? "review" : "reviews"}
                    </span>
                </div>
            </div>

            {/* Students can leave / edit their own review */}
            {!isInstructor && (
                <div className="review-form">
                    <h3>{myReview ? "Update your review" : "Leave a review"}</h3>
                    <Stars value={rating} onRate={setRating} size="1.8rem" />
                    <textarea
                        placeholder="Share your feedback about this course (optional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                    />
                    <div className="form-actions">
                        <button className="btn-submit-review" onClick={submitReview} disabled={saving}>
                            {saving ? "Saving..." : myReview ? "Update Review" : "Submit Review"}
                        </button>
                        {myReview && (
                            <button className="btn-delete-review" onClick={deleteMyReview}>
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="reviews-list">
                {reviews.length === 0 && (
                    <p className="no-reviews">No reviews yet. Be the first to share your feedback!</p>
                )}
                {reviews.map((r) => (
                    <div key={r._id} className="review-item">
                        <div className="review-head">
                            <div className="reviewer">
                                {r.userId?.avatarUrl ? (
                                    <img src={r.userId.avatarUrl} alt={r.userId?.username} className="reviewer-avatar" />
                                ) : (
                                    <div className="reviewer-avatar placeholder">
                                        {(r.userId?.username || "U").charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="reviewer-name">{r.userId?.username || "User"}</span>
                            </div>
                            <Stars value={r.rating} size="1rem" />
                        </div>
                        {r.comment && <p className="review-comment">{r.comment}</p>}
                        <span className="review-date">
                            {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
