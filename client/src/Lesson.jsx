import { Editor } from "@monaco-editor/react";
import { mockLesson } from "./mockdata";
import React, { useState, useEffect } from "react";
import Sidebar from "./components/sidebar.jsx";
export default function Lesson() {
var lessonData;
  const [code, setCode] = useState("");
  const [showSidebar,setShowSidebar]=useState(false)
  
  async function loadLesson() {
    const response = await fetch("http://localhost:5000/api/lesson/69af042e1c0a6fad058d6f4e");
     lessonData = await response.json();
    console.log("Fetched lesson data:", lessonData);
  }

  useEffect(() => {
    loadLesson();

    let currentTime=-1;
    const interval = setInterval(() => {

      currentTime =
        (currentTime+1);

      console.log("Current Time:", currentTime);

      if (currentTime === 0) {
        setCode("");
      }
      
      const currentStep = [...lessonData.timeline]
        .reverse()
        .find((step) => step.timestamp <= currentTime);

      if (currentStep) {
        setCode(currentStep.codeSnapshot);
      }
      if (currentTime === lessonData.videoLength+30) {
        clearInterval(interval);
        
      }


    }, 1000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div >
      <div className="createLesson-container">
      
              {/* HAMBURGER */}
             <div className="top-bar">
      
          <div 
              className="hamburger"
              onClick={()=>setShowSidebar(!showSidebar)}
             
          >
              ☰
          </div>
      
           {showSidebar && (
          <div className="sidebar-overlay" onMouseLeave={()=>setShowSidebar(!showSidebar)} >
            <Sidebar/>
          </div>
        )}
      
          <h2 className="lesson-title">
              Module name: lesson name
          </h2>
      
      </div>
      {/* <button onClick={()=>loadLesson()}>Load Lesson</button> */}
      <Editor
      defaultValue="hello"
        value={code}
        theme="vs-dark"
        height="600px"
        width="800px"
        defaultLanguage="python"
        onChange={(value) => console.log(value)}
      />
       <div className='output'>

    output screen

    <div className="output-run">
        <button>Run</button>
    </div>

    

    </div>
    </div>
    </div>
  )
}
