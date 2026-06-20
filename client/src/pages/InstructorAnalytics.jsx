import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import "./InstructorAnalytics.css";

const API_BASE = "http://localhost:5000/api";

export default function InstructorAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null); // courseId whose members are open
    const [members, setMembers] = useState({}); // courseId -> members payload
    const [memberSearch, setMemberSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        fetch(`${API_BASE}/instructor/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    navigate("/courses");
                    throw new Error("Not authorized");
                }
                return res.json();
            })
            .then((d) => setData(d))
            .catch((err) => console.error("Error fetching analytics:", err))
            .finally(() => setLoading(false));
    }, []);

    const toggleMembers = (courseId) => {
        if (expanded === courseId) {
            setExpanded(null);
            return;
        }
        setExpanded(courseId);
        setMemberSearch(""); // reset search when opening a different course
        if (!members[courseId]) {
            const token = localStorage.getItem("accessToken");
            fetch(`${API_BASE}/course/${courseId}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((res) => res.json())
                .then((payload) => setMembers((prev) => ({ ...prev, [courseId]: payload })))
                .catch((err) => console.error("Error fetching members:", err));
        }
    };

    if (loading) {
        return (
            <div className="analytics-page">
                <Sidebar title="Analytics" styles={"#a855f7"} />
                <div className="analytics-container"><p className="empty-msg">Loading...</p></div>
            </div>
        );
    }

    const summary = data?.summary || {};
    const topLearners = data?.topLearners || [];
    const courseBreakdown = data?.courseBreakdown || [];

    const cards = [
        { label: "Total Students", value: summary.uniqueStudents || 0, color: "#3b82f6" },
        { label: "Active Students", value: summary.activeStudents || 0, color: "#22c55e", sub: "active in last 7 days" },
        { label: "Inactive Students", value: summary.inactiveStudents || 0, color: "#ef4444" },
        { label: "Avg Progress", value: `${summary.avgProgress || 0}%`, color: "#a855f7" },
        { label: "Courses", value: summary.totalCourses || 0, color: "#eab308" },
        { label: "Total Enrollments", value: summary.totalEnrollments || 0, color: "#06b6d4" }
    ];

    return (
        <div className="analytics-page">
            <Sidebar title="Instructor Analytics" styles={"#a855f7"} />

            <div className="analytics-container">
                <h1 className="analytics-title">Instructor Analytics</h1>
                <p className="analytics-subtitle">Track your students' engagement and progress across your courses.</p>

                <div className="stats-grid">
                    {cards.map((c) => (
                        <div key={c.label} className="stat-card" style={{ borderTopColor: c.color }}>
                            <span className="stat-value" style={{ color: c.color }}>{c.value}</span>
                            <span className="stat-label">{c.label}</span>
                            {c.sub && <span className="stat-sub">{c.sub}</span>}
                        </div>
                    ))}
                </div>

                {/* Top Learners */}
                <h2 className="section-title">🏆 Top Learners</h2>
                {topLearners.length === 0 ? (
                    <p className="empty-msg">No student activity yet.</p>
                ) : (
                    <div className="top-learners">
                        {topLearners.map((s, i) => (
                            <div key={s.userId} className="learner-row">
                                <span className="learner-rank">#{i + 1}</span>
                                {s.avatarUrl ? (
                                    <img src={s.avatarUrl} alt={s.username} className="learner-avatar" />
                                ) : (
                                    <div className="learner-avatar placeholder">
                                        {(s.username || "U").charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="learner-name">{s.username}</span>
                                <span className="learner-stat">{s.totalCompleted} lessons</span>
                                <span className="learner-stat">{s.avgProgress}% avg</span>
                                <span className="learner-stat muted">{s.coursesEnrolled} course(s)</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Per-course breakdown with members */}
                <h2 className="section-title">📚 Course Members</h2>
                {courseBreakdown.length === 0 ? (
                    <p className="empty-msg">You haven't created any courses yet.</p>
                ) : (
                    <div className="course-breakdown">
                        {courseBreakdown.map((c) => (
                            <div key={c.courseId} className="breakdown-card">
                                <div className="breakdown-head" onClick={() => toggleMembers(c.courseId)}>
                                    <div>
                                        <h3 className="breakdown-title">{c.title}</h3>
                                        <div className="breakdown-meta">
                                            <span>{c.members} members</span>
                                            <span className="dot active">{c.active} active</span>
                                            <span className="dot inactive">{c.inactive} inactive</span>
                                            <span>{c.avgProgress}% avg progress</span>
                                        </div>
                                    </div>
                                    <span className="expand-arrow">{expanded === c.courseId ? "▲" : "▼"}</span>
                                </div>

                                {expanded === c.courseId && (
                                    <div className="members-table">
                                        {!members[c.courseId] ? (
                                            <p className="empty-msg">Loading members...</p>
                                        ) : members[c.courseId].members.length === 0 ? (
                                            <p className="empty-msg">No students enrolled yet.</p>
                                        ) : (() => {
                                            const term = memberSearch.trim().toLowerCase();
                                            const visible = term
                                                ? members[c.courseId].members.filter(m =>
                                                    m.username?.toLowerCase().includes(term) ||
                                                    m.email?.toLowerCase().includes(term))
                                                : members[c.courseId].members;
                                            return (
                                            <>
                                            <input
                                                type="text"
                                                className="member-search"
                                                placeholder="🔍 Search member by name or email..."
                                                value={memberSearch}
                                                onChange={(e) => setMemberSearch(e.target.value)}
                                            />
                                            {visible.length === 0 ? (
                                                <p className="empty-msg">No members match "{memberSearch}".</p>
                                            ) : (
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Student</th>
                                                        <th>Progress</th>
                                                        <th>Lessons</th>
                                                        <th>Status</th>
                                                        <th>Enrolled</th>
                                                        <th>Last Active</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {visible.map((m) => (
                                                        <tr key={m.userId}>
                                                            <td>
                                                                <div className="member-cell">
                                                                    {m.avatarUrl ? (
                                                                        <img src={m.avatarUrl} alt={m.username} className="member-avatar" />
                                                                    ) : (
                                                                        <div className="member-avatar placeholder">
                                                                            {(m.username || "U").charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div className="member-name">{m.username}</div>
                                                                        <div className="member-email">{m.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="mini-bar">
                                                                    <div className="mini-fill" style={{ width: `${m.progress}%` }} />
                                                                </div>
                                                                <span className="mini-pct">{m.progress}%</span>
                                                            </td>
                                                            <td>{m.completedLessons}</td>
                                                            <td>
                                                                <span className={`status-pill ${m.active ? "active" : "inactive"}`}>
                                                                    {m.active ? "Active" : "Inactive"}
                                                                </span>
                                                            </td>
                                                            <td>{new Date(m.enrolledAt).toLocaleDateString()}</td>
                                                            <td>{new Date(m.lastActiveAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            )}
                                            </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
