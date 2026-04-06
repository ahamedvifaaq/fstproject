import { useState } from "react";
import axios from "axios";

export default function EditModal({ user, setUser, close }) {
  const [form, setForm] = useState({
    username:  user.username  || "",
    bio:       user.bio       || "",
    avatarUrl: user.avatarUrl || "",
  });
  const [loading,  setLoading]  = useState(false);
  const [feedback, setFeedback] = useState({ msg: "", ok: true });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    if (!form.username.trim()) {
      setFeedback({ msg: "Username is required.", ok: false });
      return;
    }
    setLoading(true);
    try {
      await axios.put("/api/user/profilepage", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setUser((prev) => ({ ...prev, ...form }));
      setFeedback({ msg: "Saved!", ok: true });
      setTimeout(close, 800);
    } catch (err) {
      setFeedback({ msg: err.response?.data?.message || "Save failed.", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal-box">
        <p className="modal-title">Edit Profile</p>

        <div className="field-group">
          <label className="field-label">Username</label>
          <input className="field-input" value={form.username} onChange={set("username")} />
        </div>

        <div className="field-group">
          <label className="field-label">Bio</label>
          <textarea className="field-textarea" value={form.bio} onChange={set("bio")} placeholder="About you…" />
        </div>

        <div className="field-group">
          <label className="field-label">Avatar URL</label>
          <input className="field-input" value={form.avatarUrl} onChange={set("avatarUrl")} placeholder="https://…" />
        </div>

        {feedback.msg && (
          <p className={`modal-feedback ${feedback.ok ? "feedback-ok" : "feedback-err"}`}>
            {feedback.msg}
          </p>
        )}

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={close}>Cancel</button>
          <button className="modal-btn-save" onClick={save} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}