import User from "../models/User.js";

// List all instructors with their verification status (admin only)
export const getInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ role: "instructor" })
            .select("username email avatarUrl bio instructorStatus createdAt")
            .sort({ createdAt: -1 });

        res.status(200).json({ instructors });
    } catch (err) {
        console.error("Get instructors error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Approve or reject an instructor (admin only)
export const verifyInstructor = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        if (!["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Use 'approved', 'rejected' or 'pending'." });
        }

        const instructor = await User.findById(id);
        if (!instructor || instructor.role !== "instructor") {
            return res.status(404).json({ message: "Instructor not found" });
        }

        instructor.instructorStatus = status;
        await instructor.save();

        res.status(200).json({ message: `Instructor ${status} successfully`, instructorStatus: instructor.instructorStatus });
    } catch (err) {
        console.error("Verify instructor error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
