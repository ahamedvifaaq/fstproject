import { useState } from "react";
import axios from "axios";

export default function EditModal({ user, setUser, close }) {
  const [form, setForm] = useState({
    username: user.username,
    bio: user.bio,
    avatarUrl: user.avatarUrl
  });

  const handleSubmit = async () => {
    const res = await axios.put("/api/user/profile", form, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    setUser(res.data.user);
    close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Profile</h3>

        <input
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <textarea
          value={form.bio}
          onChange={(e) =>
            setForm({ ...form, bio: e.target.value })
          }
        />

        <input
          value={form.avatarUrl}
          onChange={(e) =>
            setForm({ ...form, avatarUrl: e.target.value })
          }
        />

        <button onClick={handleSubmit}>Save</button>
        <button onClick={close}>Cancel</button>
      </div>
    </div>
  );
}