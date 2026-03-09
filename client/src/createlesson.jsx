import { Editor } from '@monaco-editor/react'
import { useEffect, useState ,useRef} from 'react'
import React from 'react'
import './createlesson.css'

export default function createlesson() {
    const [code, setCode] = useState("");
    const currentcode=useRef("");
    const [timeline, setTimeline] = useState([]);
    let interval=useRef(null);
    let currentTime=-1;
    useEffect(() => {
        interval.current=setInterval(() => {
        setCode(currentcode.current);
        console.log(currentcode.current);
        const newEntry = {timestamp: ++currentTime, codeSnapshot: currentcode.current};
        timeline.push(newEntry);
        setTimeline([...timeline]);


    }, 1000);
        return () => clearInterval(interval);
    },[]);


  return (
    <div className='createlesson'>
    <div>
        <Editor 
        theme="vs-dark"
        height="600px"
        width="1000px"
        defaultLanguage="javascript"
        onChange={(value) =>currentcode.current=value}
        
        />
        
        
      
    </div>
    <div className='output' style={{color:"black"}}>
output screen
<button onClick={() => {console.log(timeline);clearInterval(interval.current)}}>save</button>
    </div>
    </div>



  )
}
