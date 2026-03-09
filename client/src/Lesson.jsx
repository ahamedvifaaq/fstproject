import { Editor } from "@monaco-editor/react";
import { mockLesson } from "./mockdata";
import React, { useState, useEffect } from "react";

export default function Lesson() {

  const [code, setCode] = useState("");

  useEffect(() => {

    let currentTime=-1;
    const interval = setInterval(() => {

      currentTime =
        (currentTime+1);

      console.log("Current Time:", currentTime);

      if (currentTime === 0) {
        setCode("");
      }
      
      const currentStep = [...mockLesson.timeline]
        .reverse()
        .find((step) => step.timestamp <= currentTime);

      if (currentStep) {
        setCode(currentStep.codeSnapshot);
      }
      if (currentTime === mockLesson.videoLength) {
        clearInterval(interval);
        
      }


    }, 1000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div>
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