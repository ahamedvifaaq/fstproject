import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfileHeader from "../components/Profile/Profileheader";
import ProfileTabs from "../components/Profile/ProfileTabs";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get("/api/user/profilepage", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setUser(res.data);
    };

    fetchProfile();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <ProfileHeader user={user} setUser={setUser} />
      <ProfileTabs />
    </div>
  );
}