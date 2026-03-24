import { Editor } from '@monaco-editor/react'
import { useEffect, useState ,useRef} from 'react'
import React from 'react'
import './createlesson.css'
import Sidebar from "./components/sidebar.jsx";
import { UNSAFE_RSCDefaultRootErrorBoundary, unstable_useRoute } from 'react-router-dom';

export default function createlesson() {

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
  



    async function saveLesson(audiou){
        const lessonData = {   "courseId": "69adbf0c0372a72251d090a7",
    "moduleId": "69adc7beb127b00b4d40a532",
    "title":"helloworld",
    "language":"python",
    "videoLength":currentTime.current+1,
    "audioUrl":audiou|| "not working"//not coming correct url simply coming null
};
        const response = await fetch('http://localhost:5000/api/createlesson', {
            method: 'POST',
            headers: {  'Content-Type': 'application/json' },
            body: JSON.stringify({ ...lessonData, timeline: timeline })
        });
        if(response.status === 200){
            alert('Lesson saved successfully!');
        }
    }

    const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const au = URL.createObjectURL(blob);
        url.current = au;
        setAudioURL(url.current);
         console.log("Recording stopped. Audio URL:", url.current);
         console.log("au",au);
         if(!isreset.current){
          saveLesson(au);
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

  return (

    <div className="createLesson-container">

       <Sidebar title={"Module : python"} styles={"#a855f7"} />

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