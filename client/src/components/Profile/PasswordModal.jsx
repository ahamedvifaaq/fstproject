import { useState } from "react";
import axios from "axios";

export default function PasswordModal({ close }) {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [loading,  setLoading]  = useState(false);
  const [feedback, setFeedback] = useState({ msg: "", ok: true });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirm) {
      setFeedback({ msg: "All fields required.", ok: false }); return;
    }
    if (form.newPassword.length < 6) {
      setFeedback({ msg: "New password must be at least 6 characters.", ok: false }); return;
    }
    if (form.newPassword !== form.confirm) {
      setFeedback({ msg: "Passwords do not match.", ok: false }); return;
    }
    setLoading(true);
    try {
      await axios.put(
        "/api/user/password",
        { oldPassword: form.oldPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      setFeedback({ msg: "Password changed!", ok: true });
      setTimeout(close, 900);
    } catch (err) {
      setFeedback({ msg: err.response?.data?.message || "Failed.", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal-box">
        <p className="modal-title">Change Password</p>

        <div className="field-group">
          <label className="field-label">Current Password</label>
          <input className="field-input" type="password" onChange={set("oldPassword")} />
        </div>
        <div className="field-group">
          <label className="field-label">New Password</label>
          <input className="field-input" type="password" onChange={set("newPassword")} />
        </div>
        <div className="field-group">
          <label className="field-label">Confirm New Password</label>
          <input className="field-input" type="password" onChange={set("confirm")} />
        </div>

        {feedback.msg && (
          <p className={`modal-feedback ${feedback.ok ? "feedback-ok" : "feedback-err"}`}>
            {feedback.msg}
          </p>
        )}

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={close}>Cancel</button>
          <button className="modal-btn-save" onClick={save} disabled={loading}>
            {loading ? "Updating…" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}