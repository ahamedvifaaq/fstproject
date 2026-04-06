import { Editor } from '@monaco-editor/react'
import { useEffect, useState ,useRef} from 'react'
import React from 'react'
import './createlesson.css'
import Sidebar from "./components/sidebar.jsx";
import { UNSAFE_RSCDefaultRootErrorBoundary, unstable_useRoute, useParams } from 'react-router-dom';

export default function createlesson() {
  const {courseId,moduleId,title,language}=useParams();

    const [showSidebar,setShowSidebar]=useState(false);
    const [content,setContent]=useState("");
    let editorRef = useRef(null);

    let ball;
    let a3;
    const [code, setCode] = useState("");
    const [isplayaing,setisplaying]=useState(false);
    const currentcode=useRef("");
    const [timeline, setTimeline] = useState([]);
    let interval=useRef(null);
    // var [currentTime,setcurrentTime]=useState(-1);
    var currentTime=useRef(-1);
    var isreset=useRef(false);

    const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  var url=useRef("");
  var uploadData=useRef("");

    useEffect(() => {
if(isplayaing){
        interval.current=setInterval(() => {
  currentTime.current++;
        setCode(currentcode.current);
        console.log(currentcode.current);
        const newEntry = {timestamp: currentTime.current, codeSnapshot: currentcode.current};
        timeline.push(newEntry);
        setTimeline([...timeline]);
    }, 1000);}
        return () => clearInterval(interval.current);
    },[isplayaing]);

    // Get the best supported format
const getSupportedMimeType = () => {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return types.find(type => MediaRecorder.isTypeSupported(type)) || "";
};

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
    
  



    async function saveLesson(audiou){
        const lessonData = {   "courseId": courseId,
    "moduleId": moduleId,
    "title": title,
    "language": language,
    "videoLength":currentTime.current+1,
    "audioUrl":audiou|| "not working"//not coming correct url simply coming null
};
        const token = localStorage.getItem("accessToken");
        const response = await fetch('http://localhost:5000/api/createlesson', {
            method: 'POST',
            headers: {  
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...lessonData, timeline: timeline })
        });
        if(response.status === 200){
            alert('Lesson saved successfully!');
        }
        if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      throw new Error("Unauthorized");
    }
    }

    const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getSupportedMimeType();
    console.log("Using mimeType:", mimeType); // check what it picks

    const recorder = new MediaRecorder(stream, 
      mimeType ? { mimeType } : {}  // only pass if supported
    );
    mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop =async () => {
        const blob = new Blob(audioChunksRef.current, { 
        type: mimeType || "audio/webm"  // ✅ use detected mimeType
      });

        const au = URL.createObjectURL(blob);
        url.current = au;
        setAudioURL(url.current);
         console.log("Recording stopped. Audio URL:", url.current);
         console.log("au",au);
         if(!isreset.current){
           await uploaddatas(blob,mimeType);
          saveLesson(uploadData.current);
         }
         

         //here coming correct url
         

        // reset
        audioChunksRef.current = [];
      };

      recorder.start();
      setIsRecording(true);
      setIsPaused(false);

    } catch (err) {
      alert("Microphone access denied");
    }
  };

  // PAUSE
  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // RESUME
  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  // STOP
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      setIsPaused(false);
    }
  };
  const uploaddatas = async (audioblob, mimeType) => {
  // pick correct extension based on mimeType
  const ext = mimeType?.includes("ogg") ? "ogg" 
             : mimeType?.includes("mp4") ? "mp4" 
             : "webm";

  const formData = new FormData();
  formData.append("audio", audioblob, `recording.${ext}`); // ✅ correct extension

  const uploadRes = await fetch("http://localhost:5000/api/upload", {
    method: "POST",
    headers: {
        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
    },
    body: formData,
  });

  const data = await uploadRes.json();
  if (uploadRes.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      throw new Error("Unauthorized");
    }
  uploadData.current=data.fileUrl;
  console.log( "url ",uploadData.current);
};

  return (

    <div className="createLesson-container">

       <Sidebar title={`lesson : ${title}`} styles={"#a855f7"} />

    <div className='createlesson'>
        <div className='toolbar'>
        <button onClick={()=>{isreset.current=false;if(!isPaused){setisplaying(true);startRecording();}else{resumeRecording();setisplaying(true);}}}>{!isPaused?"Start":"Resume"}</button>
        <button onClick={()=>{isreset.current=false;setisplaying(false);pauseRecording();}}>Pause</button>
        <button onClick={()=>{
            clearInterval(interval.current);
            setTimeline([]);
            setCode("");
            currentTime.current=-1;
            setisplaying(false);
            isreset.current=true;
            stopRecording();
            editorRef.current.setValue(`//start typing code here
`);



        }}>reset</button>
        <button style={{marginRight:10}}
        onClick={() => {
        console.log(timeline);
        isreset.current=false;
        
        setisplaying(false);
        stopRecording();
        console.log("Audio URL to save:", url.current); //not comming
        // console.log(url.current);
        // saveLesson();

        clearInterval(interval.current)}}
        >Save</button>
    </div>

    <div className='editor-container'>

    

    <div className='editor'>

        <Editor
        value={`//start typing code here
`}
        theme="vs-dark"
        height="600px"
        width="100%"
        onMount={(editor) => {editorRef.current = editor;}}
        defaultLanguage="javascript"
        onChange={(value) =>currentcode.current=value}
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

  )
}