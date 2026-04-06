import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/sidebar";
import EditModal from "../components/Profile/EditModal";
import PasswordModal from "../components/Profile/PasswordModal";
import "../components/Profile/Profile.css";

export default function Profile() {
  const [user, setUser]                 = useState(null);
  const [error, setError]               = useState("");
  const [showEdit, setShowEdit]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) { setError("Not logged in."); return; }
    axios
      .get("/api/user/profilepage", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load profile.")
      );
  }, []);

  if (!user && !error) return <p className="loading-msg">Loading…</p>;
  if (error)           return <><Sidebar title="Profile" styles="grey" /><p className="error-msg">{error}</p></>;

  const enrolled         = user.enrolledCourses || [];
  const totalCourses     = enrolled.length;
  const avgProgress      = totalCourses === 0 ? 0
    : Math.round(enrolled.reduce((s, c) => s + (c.progress || 0), 0) / totalCourses);
  const lessonsCompleted = enrolled.reduce(
    (s, c) => s + (c.completedLessons ? c.completedLessons.length : 0), 0
  );
  const initials = (user.username || "?").slice(0, 2).toUpperCase();
  const role     = user.role || "student";

  return (
    <>
      <Sidebar title="Profile" styles="grey" />

      <div className="profile-page">

        {/* ── Info Card ── */}
        <div className="profile-card">
          <div className="profile-avatar-row">
            <div className="profile-avatar">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.username} />
                : initials}
            </div>
            <div>
              <p className="profile-name">{user.username}</p>
              <p className="profile-email">{user.email}</p>
              <span className="profile-role">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>
          </div>

          {user.bio && <p style={{ fontSize: "0.875rem", color: "#555", marginBottom: 16 }}>{user.bio}</p>}

          <div className="info-row">
            <span className="info-label">Joined</span>
            <span className="info-value">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </span>
          </div>
         
          <div className="info-row">
            <span className="info-label">Courses</span>
            <span className="info-value">{totalCourses}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Lessons done</span>
            <span className="info-value">{lessonsCompleted}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Avg. progress</span>
            <span className="info-value">{avgProgress}%</span>
          </div>

          <div className="btn-row">
            <button className="btn btn-blue" onClick={() => setShowEdit(true)}>
              Edit Profile
            </button>
            {!user.googleId && (
              <button className="btn btn-outline" onClick={() => setShowPassword(true)}>
                Change Password
              </button>
            )}
          </div>
        </div>

        {/* ── Enrolled Courses ── */}
        <div className="profile-card">
          <p className="section-heading">Enrolled Courses</p>
          {enrolled.length === 0 ? (
            <p className="empty-msg">No courses enrolled yet.</p>
          ) : (
            enrolled.map((ec, i) => {
              const course = ec.courseId;
              const pct    = ec.progress || 0;
              return (
                <div className="course-row" key={i}>
                  <p className="course-row-name">{course?.title || "Untitled Course"}</p>
                  <p className="course-row-meta">
                    Enrolled {ec.enrolledAt ? new Date(ec.enrolledAt).toLocaleDateString() : "—"}
                    {course?.difficulty ? ` · ${course.difficulty}` : ""}
                    {" · "}{ec.completedLessons?.length ?? 0} lessons done
                  </p>
                  <div className="progress-wrap">
                    <div className="progress-bg">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="progress-label">{pct}% complete</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showEdit && (
        <EditModal user={user} setUser={setUser} close={() => setShowEdit(false)} />
      )}
      {showPassword && (
        <PasswordModal close={() => setShowPassword(false)} />
      )}
    </>
  );
}