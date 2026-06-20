import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import "./AdminDashboard.css";

const API_BASE = "http://localhost:5000/api/admin";

export default function AdminDashboard() {
    const [instructors, setInstructors] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchInstructors = () => {
        const token = localStorage.getItem("accessToken");
        fetch(`${API_BASE}/instructors`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    navigate("/courses");
                    throw new Error("Not authorized");
                }
                return res.json();
            })
            .then((data) => setInstructors(Array.isArray(data.instructors) ? data.instructors : []))
            .catch((err) => console.error("Error fetching instructors:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    const updateStatus = (id, status) => {
        const token = localStorage.getItem("accessToken");
        fetch(`${API_BASE}/instructors/${id}/verify`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        })
            .then((res) => res.json())
            .then(() => {
                setInstructors((prev) =>
                    prev.map((i) => (i._id === id ? { ...i, instructorStatus: status } : i))
                );
            })
            .catch((err) => console.error("Error updating status:", err));
    };

    const filtered = instructors.filter((i) =>
        filter === "all" ? true : (i.instructorStatus || "pending") === filter
    );

    const counts = {
        all: instructors.length,
        pending: instructors.filter((i) => (i.instructorStatus || "pending") === "pending").length,
        approved: instructors.filter((i) => i.instructorStatus === "approved").length,
        rejected: instructors.filter((i) => i.instructorStatus === "rejected").length
    };

    return (
        <div className="admin-page">
            <Sidebar title="Admin Dashboard" styles={"#a855f7"} />

            <div className="admin-container">
                <h1 className="admin-title">Instructor Verification</h1>
                <p className="admin-subtitle">
                    Review and approve instructors before they can create courses.
                </p>

                <div className="admin-filters">
                    {["all", "pending", "approved", "rejected"].map((f) => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p className="admin-empty">Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="admin-empty">No instructors in this category.</p>
                ) : (
                    <div className="instructor-list">
                        {filtered.map((inst) => {
                            const status = inst.instructorStatus || "pending";
                            return (
                                <div key={inst._id} className="instructor-card">
                                    <div className="instructor-info">
                                        {inst.avatarUrl ? (
                                            <img src={inst.avatarUrl} alt={inst.username} className="instructor-avatar" />
                                        ) : (
                                            <div className="instructor-avatar placeholder">
                                                {(inst.username || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="instructor-name">{inst.username}</h3>
                                            <p className="instructor-email">{inst.email}</p>
                                            {inst.bio && <p className="instructor-bio">{inst.bio}</p>}
                                        </div>
                                    </div>

                                    <div className="instructor-actions">
                                        <span className={`status-badge ${status}`}>{status}</span>
                                        {status !== "approved" && (
                                            <button className="btn-approve" onClick={() => updateStatus(inst._id, "approved")}>
                                                Approve
                                            </button>
                                        )}
                                        {status !== "rejected" && (
                                            <button className="btn-reject" onClick={() => updateStatus(inst._id, "rejected")}>
                                                Reject
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
