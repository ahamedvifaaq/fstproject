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
      <div className="modal-content">
        <h2>Edit Profile</h2>

        <div className="form-group">
          <label>Username</label>
          <input value={form.username} onChange={set("username")} />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea style={{background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", width: "100%", padding:"12px", color:"#fff", resize:"vertical", minHeight:"80px"}} value={form.bio} onChange={set("bio")} placeholder="About you…" />
        </div>

        <div className="form-group">
          <label>Avatar URL</label>
          <input value={form.avatarUrl} onChange={set("avatarUrl")} placeholder="https://…" />
        </div>

        {feedback.msg && (
          <p className={`modal-feedback ${feedback.ok ? "feedback-ok" : "feedback-err"}`}>
            {feedback.msg}
          </p>
        )}

        <div className="btn-row" style={{marginTop:"30px", justifyContent:"flex-end"}}>
          <button className="btn btn-outline" onClick={close}>Cancel</button>
          <button className="btn btn-blue" onClick={save} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}