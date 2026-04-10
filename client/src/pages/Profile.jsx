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
      .catch((err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            window.location.href = "/login";
            return;
        }
        setError(err.response?.data?.message || "Failed to load profile.");
      });
  }, []);

  if (!user && !error) return <p className="loading-msg">Loading…</p>;
  if (error)           return <><Sidebar title="Profile" styles="grey" /><p className="error-msg">{error}</p></>;

  const role     = user.role || "student";
  const initials = (user.username || "?").slice(0, 2).toUpperCase();

  // Student stats
  const enrolled         = user.enrolledCourses || [];
  const totalCourses     = enrolled.length;
  const avgProgress      = totalCourses === 0 ? 0
    : Math.round(enrolled.reduce((s, c) => s + (c.progress || 0), 0) / totalCourses);
  const lessonsCompleted = enrolled.reduce(
    (s, c) => s + (c.completedLessons ? c.completedLessons.length : 0), 0
  );

  // Instructor stats
  const createdCourses   = user.createdCourses || [];
  const totalCreated     = createdCourses.length;
  const totalLessonsCr   = user.totalLessonsCreated || 0;
  const totalStudentsEn  = user.totalStudentsEnrolled || 0;

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
          <div className="metrics-grid">
          {role === "instructor" ? (
            <>
              <div className="metric-card">
                <span className="metric-value">{totalCreated}</span>
                <span className="metric-label">Courses</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{totalLessonsCr}</span>
                <span className="metric-label">Lessons</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{totalStudentsEn}</span>
                <span className="metric-label">Students</span>
              </div>
            </>
          ) : (
            <>
              <div className="metric-card">
                <span className="metric-value">{totalCourses}</span>
                <span className="metric-label">Courses</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{lessonsCompleted}</span>
                <span className="metric-label">Done</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{avgProgress}%</span>
                <span className="metric-label">Progress</span>
              </div>
            </>
          )}
          </div>

          <div className="btn-row">
            <button className="btn btn-blue" onClick={() => setShowEdit(true)}>
              Edit Profile
            </button>
            {!user.googleId && (
              <button 
                className="btn btn-outline" 
                style={{ color: "#fff" }} 
                onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.color = "#fff"; }}
                onClick={() => setShowPassword(true)}
              >
                Change Password
              </button>
            )}
          </div>
        </div>

        {/* ── Courses ── */}
        <div className="profile-card">
          {role === "instructor" && (
            <div style={{ marginBottom: 30 }}>
              <p className="section-heading">Created Courses</p>
              {createdCourses.length === 0 ? (
                <p className="empty-msg">No courses created yet.</p>
              ) : (
                createdCourses.map((course, i) => (
                  <div className="course-row" key={'c' + i}>
                    <p className="course-row-name">{course.title || "Untitled Course"}</p>
                    <p className="course-row-meta">
                      Created {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "—"}
                      {course.difficulty ? ` · ${course.difficulty}` : ""}
                      {" · "}{course.modules?.length || 0} modules
                    </p>
                    <div className="progress-wrap">
                      <p className="progress-label" style={{ marginLeft: 0, marginTop: 4 }}>{course.studentsEnrolled || 0} students enrolled</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <p className="section-heading">Enrolled Courses</p>
          {enrolled.length === 0 ? (
            <p className="empty-msg">No courses enrolled yet.</p>
          ) : (
            enrolled.map((ec, i) => {
              const course = ec.courseId;
              const pct    = ec.progress || 0;
              return (
                <div className="course-row" key={'e' + i}>
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