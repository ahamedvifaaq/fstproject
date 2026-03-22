import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfileHeader from "../components/Profile/ProfileHeader";
import EditModal from "../components/Profile/EditModal";
import PasswordModal from "../components/Profile/PasswordModal";
import "../components/Profile/Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUser(res.data));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
      <ProfileHeader
        user={user}
        onEdit={() => setShowEdit(true)}
        onPassword={() => setShowPassword(true)}
      />
      </div>

      {showEdit && (
        <EditModal
          user={user}
          setUser={setUser}
          close={() => setShowEdit(false)}
        />
      )}

      {showPassword && (
        <PasswordModal close={() => setShowPassword(false)} />
      )}
    </div>
  );
}