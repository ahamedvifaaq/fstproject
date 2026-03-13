import { Editor } from '@monaco-editor/react'
import { useEffect, useState ,useRef} from 'react'
import React from 'react'
import './createlesson.css'
import Sidebar from "./components/sidebar.jsx";

export default function createlesson() {

    const [showSidebar,setShowSidebar]=useState(false);
    const [content,setContent]=useState("");

    let ball;
    let a3;
    const [code, setCode] = useState("");
    const [isplayaing,setisplaying]=useState(false);
    const currentcode=useRef("");
    const [timeline, setTimeline] = useState([]);
    let interval=useRef(null);
    var [currentTime,setcurrentTime]=useState(-1);
    useEffect(() => {
if(isplayaing){
        interval.current=setInterval(() => {
    setcurrentTime(currentTime++);
        setCode(currentcode.current);
        console.log(currentcode.current);
        const newEntry = {timestamp: currentTime, codeSnapshot: currentcode.current};
        timeline.push(newEntry);
        setTimeline([...timeline]);
    }, 1000);}
        return () => clearInterval(interval);
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



    async function saveLesson(){
        const lessonData = {   "courseId": "69adbf0c0372a72251d090a7",
    "moduleId": "69adc7beb127b00b4d40a532",
    "title":"helloworld",
    "language":"python",
    "videoLength":currentTime+1
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

  return (

    <div className="createLesson-container">

       <Sidebar title={"Module : python"} styles={"#a855f7"} />

    <div className='createlesson'>
        <div className='toolbar'>
        <button onClick={()=>setisplaying(true)}>Start</button>
        <button onClick={()=>setisplaying(false)}>Pause</button>
        <button onClick={()=>{
            clearInterval(interval.current);
            setTimeline([]);
            setCode("");
            setcurrentTime(-1);
            setisplaying(false);


        }}>reset</button>
        <button style={{marginRight:10}}
        onClick={() => {
        console.log(timeline);
        setisplaying(false);
        saveLesson();

        clearInterval(interval.current)}}
        >Save</button>
    </div>

    <div className='editor-container'>

    

    <div className='editor'>

        <Editor
        theme="vs-dark"
        height="600px"
        width="100%"
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