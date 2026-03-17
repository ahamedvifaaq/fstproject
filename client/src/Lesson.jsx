import { Editor } from "@monaco-editor/react";
import { mockLesson } from "./mockdata";
import React, { useState, useEffect ,useRef, use} from "react";
import './createlesson.css';
import './lesson.css';
import Sidebar from "./components/sidebar.jsx";
export default function Lesson() {
  var [lessonData, setLessonData] = useState(mockLesson);
  const [code, setCode] = useState("");
  const [showSidebar,setShowSidebar]=useState(false);
  const [content,setContent]=useState("");
  var [overlay,setoverlay]=useState(false);
  const [started, setStarted] = useState(false);
  var [currentTime,setcurrentTime]=useState(-1);
  let interval=useRef(null);
  let play =useRef(true);
  const currentcode=useRef("");
  
  
  async function loadLesson() {
    const response = await fetch("http://localhost:5000/api/lesson/69b06b1dd635acf10a1c6172");
     lessonData = await response.json();
    setLessonData(lessonData);
    console.log("Fetched lesson data:", lessonData);
  }
  useEffect(() => {
    loadLesson();
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault(); // stops page scroll
        setStarted((prev) => !prev);
        if(!started){
          setoverlay(false);
          setTimeout(() => {
            setoverlay(true);
          }, 200);
        }
          
        
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  
  useEffect(() => {
    
    

    interval.current = setInterval(() => {
        if(started&&play.current){
      currentTime =
        (currentTime+1);
        setcurrentTime(currentTime);

      console.log("Current Time:", currentTime);

      if (currentTime === 0) {
        setCode("");
      }
      
      const currentStep = [...lessonData.timeline]
        .reverse()
        .find((step) => step.timestamp <= currentTime);

      if (currentStep) {
        setCode(currentStep.codeSnapshot);
        currentcode.current=currentStep.codeSnapshot;
      }
      if (currentTime === lessonData.videoLength) {
        clearInterval(interval.current);
        play.current=false;
        
      }}



    }, 1000);

    return () => clearInterval(interval.current);

  }, [started]);
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
  {!overlay && (
        <div className="overlay">
          <div className="play-btn" onClick={() => setStarted(true)}></div>
        </div>
      )}
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
        onChange={(value) =>currentcode.current=value}
      />
      </div>
      </div>
      <div className='output'>

    output screen

    <div className="output-run">
        <button onClick={()=>runCode()}>Run</button>
    </div>
    <div className="output-content" style={{ whiteSpace: "pre-line" }}>
        {content}
    </div>

    

    </div>
    </div>
    </div>
    </>
    
  )
}
