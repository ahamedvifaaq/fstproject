import React, { useState } from "react";
import "./sidebar.css";
import { Link } from "react-router-dom";


export default function Sidebar({title,styles}) {
      const [showSidebar,setShowSidebar]=useState(false);
  

  

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

        <li><Link to="/Lesson" style={{color:"white",textDecoration:"none"}}>Home</Link></li>

        <li>
          <Link to="/courses" style={{color:"white",textDecoration:"none"}}>Courses</Link>
        </li>


        <li>
            <Link to="/profile" style={{color:"white",textDecoration:"none"}}>Profile</Link>

        </li>

        <li><a href="/" onClick={(e) => { e.preventDefault(); localStorage.removeItem("accessToken"); window.location.href = "/"; }} style={{color:"white",textDecoration:"none",cursor:"pointer"}}>Logout</a></li>

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