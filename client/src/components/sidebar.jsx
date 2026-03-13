import React, { useState } from "react";
import "./sidebar.css";
import { Link } from "react-router-dom";

export default function Sidebar() {

  

  return (
    <div className="sidebar">

      <h3 className="sidebar-title"><pre>      Menu</pre></h3>

      <ul>

        <li>Home</li>

        <li>
          <Link to="/courses" style={{color:"white",textDecoration:"none"}}>Courses</Link>
        </li>


        <li>Profile</li>

        <li>Logout</li>

      </ul>

    </div>
  );
}