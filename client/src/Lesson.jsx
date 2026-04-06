import { Editor } from "@monaco-editor/react";
import { mockLesson } from "./mockdata";
import React, { useState, useEffect ,useRef, use} from "react";
import './createlesson.css';
import './lesson.css';
import Sidebar from "./components/sidebar.jsx";
import { useParams } from "react-router-dom";
import { FaPlay, FaPause } from "react-icons/fa";
 import { useNavigate } from "react-router-dom";
export default function Lesson() {
  const lessonID=useParams().lessonID;
  const mtitle=useParams().mtitle;
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
  const sliderRef = useRef(null);
 

const navigate = useNavigate();

  const audioRef = useRef(null);

  const getAudioUrl = (url) => {
    if (!url || url === "not working") return null;
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const playAudio = (url) => {
    const fullUrl = getAudioUrl(url);
    if (!fullUrl) {
      console.warn("Invalid audio URL:", url);
      return;
    }
    const cleanUrlPart = fullUrl.replace("http://localhost:5000", "");
    if (!audioRef.current || !audioRef.current.src.endsWith(cleanUrlPart)) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(fullUrl);
      audioRef.current.onerror = (e) => console.error("Audio loading error for:", fullUrl, e);
    }
    
    if (currentTime > 0) {
      if (audioRef.current.readyState >= 1) { // HAVE_METADATA and up
        audioRef.current.currentTime = currentTime;
      } else {
        audioRef.current.addEventListener("loadedmetadata", () => {
          audioRef.current.currentTime = currentTime;
        }, { once: true });
      }
    }

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.error("Audio playback error:", e));
    }
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
  };
  
  
  async function loadLesson() {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`http://localhost:5000/api/lesson/${lessonID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
     lessonData = await response.json();
     if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      throw new Error("Unauthorized");
    }
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
  let frame;
  let last = currentTime;

  const animate = () => {
    if (!sliderRef.current) return;

    let displayed = parseFloat(sliderRef.current.value) || 0;
    let diff = currentTime - displayed;
    displayed += diff * 0.5;

    sliderRef.current.value = displayed;

    frame = requestAnimationFrame(animate);
  };

  animate();

  return () => cancelAnimationFrame(frame);
}, [currentTime]);
  
  useEffect(() => {
    console.log(lessonData.audioUrl);
    if(started)playAudio(lessonData.audioUrl);
    else{pauseAudio();}
    
    

    interval.current = setInterval(() => {
        if(started&& lessonData.videoLength>currentTime){
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
        //clearInterval(interval.current);
        play.current=false;
        setStarted(false);
        navigate(0);
      
        
        
      }}



    }, 1000);

    return () => clearInterval(interval.current);

  }, [started]);
  async function runCode(){
        const token = localStorage.getItem("accessToken");
        const response = await fetch('http://localhost:5000/api/output', {
            method: 'POST',
            headers: {  
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body:JSON.stringify({code:currentcode.current})
        });
        if(response.status === 200){
        const data = await response.json();
        setContent(data.output);
        console.log(data);
        }
        if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      throw new Error("Unauthorized");
    }


    
    
    }

  return (<>
  {!overlay && (
        <div className="overlay">
          <div className="play-btn" onClick={() => {setStarted(true);setoverlay(true)}}></div>
        </div>
      )}
    <Sidebar title={` ${mtitle}:${lessonData.title}`} styles={"#a855f7"} />
      <div className="createLesson-container">
      
              {/* HAMBURGER */}
             
      {/* <button onClick={()=>loadLesson()}>Load Lesson</button> */}
      <div className='createlesson'>
      <div className='editor-container'>
      <div className='editor'>
      <Editor
      defaultValue="welcome to coding"
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
    <div  className="timeline">
      <div className="timer">
        <button onClick={()=>{setStarted((prev)=>!prev);setoverlay(true)}} style={{marginRight:10,backgroundColor:started?"#ef4444":"#22c55e",border:"none",color:"white",padding:"6px 14px",borderRadius:"4px",cursor:"pointer"}}> {started ? <FaPause size={20} /> : <FaPlay size={20} />}</button>
        <div style={{color:"white",marginLeft:10,marginRight:10}}>
        {Math.floor(currentTime/60)}:{currentTime%60<10?`0${currentTime%60}`:currentTime%60}
        {/* 5:00 */}
      </div>
        <input
        ref={sliderRef}
        type="range"
        defaultValue={0}
        min="0"
        max={lessonData.videoLength}
        // value={currentTime}
        onChange={(e) => {if(started){setStarted(false);console.log(e.target.value);setcurrentTime(Number(e.target.value)-1);setStarted(false);setTimeout(()=>setStarted(true),100)}
        else{setcurrentTime(Number(e.target.value)-1);console.log(e.target.value);}
      }
      
      }
        style={{ width: "100%" }}
      />
      <div style={{color:"white",marginLeft:10}}>
       {Math.floor(lessonData.videoLength/60)}:{lessonData.videoLength%60<10?`0${lessonData.videoLength%60}`:lessonData.videoLength%60}

        {/* 5:00 */}
      </div>
      </div>
      

    </div>
    </>
    
  )
}
