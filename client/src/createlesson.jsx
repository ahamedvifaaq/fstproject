import { Editor } from '@monaco-editor/react'
import { useEffect, useState ,useRef} from 'react'
import React from 'react'
import './createlesson.css'
import Sidebar from "./components/Sidebar.jsx";

export default function createlesson() {

    const [showSidebar,setShowSidebar]=useState(false)

    const [code, setCode] = useState("");
    const [isplayaing,setisplaying]=useState(false);
    const currentcode=useRef("");
    const [timeline, setTimeline] = useState([]);
    let interval=useRef(null);
    let currentTime=-1;

    useEffect(() => {
if(isplayaing){
        interval.current=setInterval(() => {

        setCode(currentcode.current);
        console.log(currentcode.current);

        const newEntry = {
            timestamp: ++currentTime,
            codeSnapshot: currentcode.current
        };

        timeline.push(newEntry);
        setTimeline([...timeline]);

    }, 1000);}

        return () => clearInterval(interval.current);

    },[isplayaing]);


  return (

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

    <div className='createlesson'>
        <div className='toolbar'>
        <button onClick={()=>setisplaying(true)}>Start</button>
        <button onClick={()=>setisplaying(false)}>Pause</button>
        <button onClick={()=>{
            clearInterval(interval.current);

        }}>reset</button>
        <button style={{marginRight:10}}
        onClick={() => {
        console.log(timeline);
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
        <button>Run</button>
    </div>

    <button onClick={() => {
        console.log(timeline);
        clearInterval(interval.current)
    }}>
        save
    </button>

    </div>

    </div>
    </div>

  )
}