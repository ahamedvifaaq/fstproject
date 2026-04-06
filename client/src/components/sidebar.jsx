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
                          onMouseOver={()=>setShowSidebar(!showSidebar)}
                          style={{color:"grey",padding:"7px" }}
                         
                      >
                          ☰
                      </div>
                  
                       {showSidebar && (
                      <div className="sidebar-overlay" onMouseLeave={()=>setShowSidebar(!showSidebar)} >
                        <div className="sidebar">
      


      <h3 className="sidebar-title"><pre style={{padding:7
      }}>      Menu</pre></h3>

      <ul>
        <br></br>

        <li onClick={() => navigate('/Lesson')}><Link to="/Lesson" style={{color:"white",textDecoration:"none"}}>Home</Link></li>

        <li onClick={() => navigate('/courses')}>
          <Link to="/courses" style={{color:"white",textDecoration:"none"}}>Courses</Link>
        </li>


        <li onClick={() => navigate('/profile')}>
            <Link to="/profile" style={{color:"white",textDecoration:"none"}}>Profile</Link>

        </li>

        <li onClick={() => {
          localStorage.removeItem("accessToken");
          window.location.href = "/";
        }}>
          <a href="/" style={{color:"white",textDecoration:"none",cursor:"pointer"}}>Logout</a>
        </li>

      </ul>

    </div>
                      </div>
                    )}
                  
                      <h2 className="lesson-title" style={{marginLeft:10,color:styles}}>
                          {title}
                      </h2>
                  
                  </div>

    
    </>
  );
}