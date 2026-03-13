import { Editor } from "@monaco-editor/react";
import { mockLesson } from "./mockdata";
import React, { useState, useEffect } from "react";

export default function Lesson() {
var lessonData;
  const [code, setCode] = useState("");
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

  return (
    <div >
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
    </div>
  );
}