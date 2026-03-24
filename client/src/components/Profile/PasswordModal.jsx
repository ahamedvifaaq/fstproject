import { useState } from "react";
import axios from "axios";

export default function PasswordModal({ close }) {
  const [data, setData] = useState({
    oldPassword: "",
    newPassword: ""
  });

  const handleSubmit = async () => {
    await axios.put("/api/user/password", data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    alert("Password changed");
    close();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Change Password</h3>

        <input
          type="password"
          placeholder="Old Password"
          onChange={(e) =>
            setData({ ...data, oldPassword: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="New Password"
          onChange={(e) =>
            setData({ ...data, newPassword: e.target.value })
          }
        />

        <button onClick={handleSubmit}>Update</button>
        <button onClick={close}>Cancel</button>
      </div>
    </div>
  );
}