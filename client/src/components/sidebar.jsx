import React, { useState } from "react";
import "./sidebar.css";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";



export default function Sidebar({title,styles}) {
      const [showSidebar,setShowSidebar]=useState(false);
      const navigate = useNavigate();
  

  

  return (
  <>
    <div className="top-bar">
        <div 
            className="hamburger"
            onClick={()=>setShowSidebar(!showSidebar)}
            style={{padding:"7px" }}
        >
            <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
                  
        {showSidebar && (
            <div className="sidebar-overlay" onClick={()=>setShowSidebar(false)} >
                <div className="sidebar" onClick={(e)=> e.stopPropagation()}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h3 className="sidebar-title" style={{padding:"0 15px", margin: 0}}>Menu</h3>
                        <button onClick={()=>setShowSidebar(false)} style={{background:'none', border:'none', color:'#fff', fontSize:'24px', cursor:'pointer'}}>&times;</button>
                    </div>
                    <ul>
                    <li onClick={() => {setShowSidebar(false); navigate('/Lesson');}}><Link to="/Lesson">Home</Link></li>
                    <li onClick={() => {setShowSidebar(false); navigate('/courses');}}><Link to="/courses">Courses</Link></li>
                    <li onClick={() => {setShowSidebar(false); navigate('/profile');}}><Link to="/profile">Profile</Link></li>
                    {localStorage.getItem("role") === "instructor" && (
                        <li onClick={() => {setShowSidebar(false); navigate('/analytics');}}><Link to="/analytics">Analytics</Link></li>
                    )}
                    {localStorage.getItem("role") === "admin" && (
                        <li onClick={() => {setShowSidebar(false); navigate('/admin');}}><Link to="/admin">Admin</Link></li>
                    )}
                    <li onClick={() => {
                        setShowSidebar(false);
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("instructorStatus");
                        window.location.href = "/";
                    }}>
                        <a href="/">Logout</a>
                    </li>
                    </ul>
                </div>
            </div>
        )}
                  
        <h2 className="lesson-title gradient-text-header">
            {title}
        </h2>
    </div>
    </>
  );
}