import { Editor } from "@monaco-editor/react";
import { mockLesson } from "./mockdata";
import React, { useState, useEffect } from "react";
import './createlesson.css';
import Sidebar from "./components/sidebar.jsx";
export default function Lesson() {
var lessonData;
  const [code, setCode] = useState("");
  const [showSidebar,setShowSidebar]=useState(false);
  const [content,setContent]=useState("");
  
  async function loadLesson() {
    const response = await fetch("http://localhost:5000/api/lesson/69b06b1dd635acf10a1c6172");
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
  async function runCode(){
        const response = await fetch('http://localhost:5000/api/output', {
            method: 'POST',
            headers: {  'Content-Type': 'application/json' },
            body:JSON.stringify({code:currentcode.current})
        });
        if(response.status === 200){
        const data = await response.json();
        setContent(data.output);
        console.log(data);
        }


    
    
    }

  return (<>
    <Sidebar title={"Module name: lesson name"} styles={"#a855f7"} />
      <div className="createLesson-container">
      
              {/* HAMBURGER */}
             
      {/* <button onClick={()=>loadLesson()}>Load Lesson</button> */}
      <div className='createlesson'>
      <div className='editor-container'>
      <div className='editor'>
      <Editor
      defaultValue="hello"
        value={code}
        theme="vs-dark"
        height="600px"
        width="100%"
        defaultLanguage="python"
        onChange={(value) => console.log(value)}
      />
      </div>
      </div>
      <div className='output'>

    output screen

    <div className="output-run">
        <button onClick={()=>runCode()}>Run</button>
    </div>
    <div className="output-content">
        {content}
    </div>

    

    </div>
    </div>
    </div>
    </>
    
  )
}
