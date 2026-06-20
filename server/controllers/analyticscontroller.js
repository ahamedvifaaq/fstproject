import User from "../models/User.js";
import Course from "../models/Course.js";

const ACTIVE_WINDOW_DAYS = 7;

const activeThreshold = () => Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

// Resolve the "last active" timestamp for an enrollment, falling back to enroll date
const lastActiveMs = (ec) => {
    const ref = ec.lastActiveAt || ec.enrolledAt;
    return ref ? new Date(ref).getTime() : 0;
};

// GET /api/course/:courseId/members
// Members (enrolled students) of a single course — instructor (owner) or admin only.
export const getCourseMembers = async (req, res) => {
    const courseId = req.params.courseId;
    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (req.user.role !== "admin" && String(course.instructorId) !== String(req.user._id)) {
            return res.status(403).json({ message: "You can only view members of your own courses." });
        }

        const users = await User.find({ "enrolledCourses.courseId": courseId })
            .select("username email avatarUrl enrolledCourses");

        const threshold = activeThreshold();
        let activeCount = 0;

        const members = users.map((u) => {
            const ec = u.enrolledCourses.find((e) => String(e.courseId) === String(courseId));
            const lastMs = lastActiveMs(ec);
            const active = lastMs >= threshold;
            if (active) activeCount++;
            return {
                userId: u._id,
                username: u.username,
                email: u.email,
                avatarUrl: u.avatarUrl,
                enrolledAt: ec.enrolledAt,
                lastActiveAt: ec.lastActiveAt || ec.enrolledAt,
                progress: ec.progress || 0,
                completedLessons: ec.completedLessons ? ec.completedLessons.length : 0,
                active
            };
        });

        members.sort((a, b) => b.progress - a.progress);

        res.status(200).json({
            courseTitle: course.title,
            count: members.length,
            activeCount,
            inactiveCount: members.length - activeCount,
            members
        });
    } catch (err) {
        console.error("Get course members error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// GET /api/instructor/analytics
// Aggregated analytics across all of the logged-in instructor's courses.
export const getInstructorAnalytics = async (req, res) => {
    const instructorId = req.user._id;
    try {
        const courses = await Course.find({ instructorId }).select("title studentsEnrolled");
        const courseTitleMap = {};
        courses.forEach((c) => (courseTitleMap[String(c._id)] = c.title));
        const courseIds = courses.map((c) => c._id);

        const users = await User.find({ "enrolledCourses.courseId": { $in: courseIds } })
            .select("username avatarUrl enrolledCourses");

        const threshold = activeThreshold();

        let totalEnrollments = 0;
        let progressSumAll = 0;

        // Per-course aggregation
        const perCourse = {};
        courseIds.forEach((id) => {
            perCourse[String(id)] = {
                courseId: id,
                title: courseTitleMap[String(id)],
                members: 0,
                active: 0,
                progressSum: 0
            };
        });

        // Per-student aggregation (for unique counts + top learners)
        const perStudent = {};

        users.forEach((u) => {
            u.enrolledCourses.forEach((ec) => {
                const cid = String(ec.courseId);
                if (!courseTitleMap[cid]) return; // not one of this instructor's courses

                const lastMs = lastActiveMs(ec);
                const active = lastMs >= threshold;
                const progress = ec.progress || 0;
                const completed = ec.completedLessons ? ec.completedLessons.length : 0;

                totalEnrollments++;
                progressSumAll += progress;

                perCourse[cid].members++;
                if (active) perCourse[cid].active++;
                perCourse[cid].progressSum += progress;

                const sid = String(u._id);
                if (!perStudent[sid]) {
                    perStudent[sid] = {
                        userId: u._id,
                        username: u.username,
                        avatarUrl: u.avatarUrl,
                        totalCompleted: 0,
                        progressSum: 0,
                        coursesEnrolled: 0,
                        lastActive: 0
                    };
                }
                const ps = perStudent[sid];
                ps.totalCompleted += completed;
                ps.progressSum += progress;
                ps.coursesEnrolled++;
                ps.lastActive = Math.max(ps.lastActive, lastMs);
            });
        });

        const students = Object.values(perStudent);
        const uniqueStudents = students.length;
        const activeStudents = students.filter((s) => s.lastActive >= threshold).length;
        const inactiveStudents = uniqueStudents - activeStudents;
        const avgProgress = totalEnrollments ? Math.round(progressSumAll / totalEnrollments) : 0;

        const topLearners = students
            .map((s) => ({
                userId: s.userId,
                username: s.username,
                avatarUrl: s.avatarUrl,
                totalCompleted: s.totalCompleted,
                coursesEnrolled: s.coursesEnrolled,
                avgProgress: Math.round(s.progressSum / s.coursesEnrolled)
            }))
            .sort((a, b) => b.totalCompleted - a.totalCompleted || b.avgProgress - a.avgProgress)
            .slice(0, 5);

        const courseBreakdown = Object.values(perCourse).map((c) => ({
            courseId: c.courseId,
            title: c.title,
            members: c.members,
            active: c.active,
            inactive: c.members - c.active,
            avgProgress: c.members ? Math.round(c.progressSum / c.members) : 0
        }));

        res.status(200).json({
            summary: {
                totalCourses: courses.length,
                totalEnrollments,
                uniqueStudents,
                activeStudents,
                inactiveStudents,
                avgProgress
            },
            topLearners,
            courseBreakdown
        });
    } catch (err) {
        console.error("Get instructor analytics error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
