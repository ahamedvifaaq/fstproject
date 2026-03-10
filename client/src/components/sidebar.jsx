import React, { useState } from "react";
import "./sidebar.css";

export default function Sidebar() {

  const [showCourses, setShowCourses] = useState(false);
  const [showModules, setShowModules] = useState(false);

  return (
    <div className="sidebar">

      <h3 className="sidebar-title"><pre>      Menu</pre></h3>

      <ul>

        <li>Home</li>

        <li onClick={() => setShowCourses(!showCourses)}>
          Courses
        </li>

        {showCourses && (
          <ul className="submenu">

            <li onClick={() => setShowModules(!showModules)}>
              Modules
            </li>

            {showModules && (
              <ul className="submenu2">
                <li>Lesson</li>
              </ul>
            )}

          </ul>
        )}

        <li>Profile</li>

        <li>Logout</li>

      </ul>

    </div>
  );
}