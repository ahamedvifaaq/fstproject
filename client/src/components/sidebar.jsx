import React from "react";
import "../components/sidebar.css";

export default function Sidebar() {
    return (
    <div className="sidebar">

      <h2 className="logo">Icode</h2>

      <ul>
        <li>Home</li>
        <li>Courses</li>
        <li>Profile</li>
        <li>Logout</li>
      </ul>

    </div>
  );
}