import { Editor } from '@monaco-editor/react'
import { useEffect, useState ,useRef} from 'react'
import React from 'react'
import './createlesson.css'
import Layout from './components/Layout.jsx'

export default function createlesson() {
    let ball;
    
    let a3;
    const [code, setCode] = useState("");
    const currentcode=useRef("");
    const [timeline, setTimeline] = useState([]);
    let interval=useRef(null);
    var [currentTime,setcurrentTime]=useState(-1);
    useEffect(() => {
        interval.current=setInterval(() => {
    setcurrentTime(currentTime++);
        setCode(currentcode.current);
        console.log(currentcode.current);
        const newEntry = {timestamp: currentTime, codeSnapshot: currentcode.current};
        timeline.push(newEntry);
        setTimeline([...timeline]);
    }, 1000);
        return () => clearInterval(interval);
    },[]);
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
    <h2 className="lesson-title">Module name:lesson name</h2>
    
    <div className='createlesson'>

    <div className='editor-container'>
    
    <div className='toolbar'>
        <button>Resume</button>
        <button>Pause</button>
        <button>Save</button>

    </div>    
    <div className='editor'>
    
        <Editor 
        theme="vs-dark"
        height="600px"
        width="1000px"
        defaultLanguage="javascript"
        onChange={(value) =>currentcode.current=value}
        />
        </div>
    
    </div>
    
    <div className='output' style={{color:"black"}}>
output screen
<div className="output-run">
    
<button>Run</button>
</div>
{/* <button onClick={() => {console.log(timeline);clearInterval(interval.current)}}>save</button> */}

    <button onClick={() => {saveLesson();clearInterval(interval.current)}}>save</button>
    </div>

    </div>
    </div>
    
  )
}
