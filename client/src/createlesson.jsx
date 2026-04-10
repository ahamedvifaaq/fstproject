import { Editor } from '@monaco-editor/react'
import { useEffect, useState, useRef } from 'react'
import React from 'react'
import './createlesson.css'
import Sidebar from "./components/sidebar.jsx";
import { UNSAFE_RSCDefaultRootErrorBoundary, unstable_useRoute, useParams } from 'react-router-dom';
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";
import { io } from "socket.io-client";

export default function createlesson() {
  const { courseId, moduleId, title, language } = useParams();

  const [showSidebar, setShowSidebar] = useState(false);
  const [content, setContent] = useState("");
  let editorRef = useRef(null);
  const currentcode = useRef("");
  const socketRef = useRef(null);
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  let ball;
  let a3;
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isplayaing, setisplaying] = useState(false);
  const [timeline, setTimeline] = useState([]);
  let interval = useRef(null);
  var currentTime = useRef(-1);
  var isreset = useRef(false);
  const currentOutput = useRef("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  var url = useRef("");
  var uploadData = useRef("");

  useEffect(() => {
    document.body.style.background = "#1e1e1e";

    // Initialize Xterm with premium aesthetics
    const term = new Terminal({
      theme: {
        background: "#0f111a",
        foreground: "#8f9bc0",
        cursor: "#a855f7",
        selectionBackground: "rgba(168, 85, 247, 0.3)",
        black: "#000000",
        red: "#ff5370",
        green: "#c3e88d",
        yellow: "#ffcb6b",
        blue: "#82aaff",
        magenta: "#c792ea",
        cyan: "#89ddff",
        white: "#ffffff",
      },
      cursorBlink: true,
      fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
      fontSize: 15,
      letterSpacing: 1.1,
      lineHeight: 1.4,
      convertEol: true,
      padding: 15
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    xtermRef.current = term;

    if (terminalRef.current) {
      term.open(terminalRef.current);

      const resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(() => {
          try { fitAddon.fit(); } catch (e) { }
        });
      });
      resizeObserver.observe(terminalRef.current);

      term.onDispose = term.onDispose || function () { };
      const origDispose = term.dispose.bind(term);
      term.dispose = () => {
        resizeObserver.disconnect();
        origDispose();
      };
    }

    // Initialize Socket
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("output", (data) => {
      term.write(data);
      currentOutput.current += data; // Simple tracking for timeline
    });

    term.onData((data) => {
      socketRef.current.emit("input", data);
    });

    return () => {
      document.body.style.background = "";
      term.dispose();
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isplayaing) {
      interval.current = setInterval(() => {
        currentTime.current++;
        setCode(currentcode.current);
        const newEntry = {
          timestamp: currentTime.current,
          codeSnapshot: currentcode.current,
          outputSnapshot: currentOutput.current
        };
        timeline.push(newEntry);
        setTimeline([...timeline]);
      }, 1000);
    }
    return () => clearInterval(interval.current);
  }, [isplayaing]);

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

  async function runCode() {
    setIsRunning(true);
    currentOutput.current = "";
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln("\x1b[33mStarting Interactive Session...\x1b[0m");
    }
    try {
      socketRef.current?.emit("run_code", { code: currentcode.current, language: language });
    } finally {
      setIsRunning(false);
    }
  }





  async function saveLesson(audiou) {
    const lessonData = {
      "courseId": courseId,
      "moduleId": moduleId,
      "title": title,
      "language": language,
      "videoLength": currentTime.current + 1,
      "audioUrl": audiou || "not working"//not coming correct url simply coming null
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
    if (response.status === 200) {
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

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm"  // ✅ use detected mimeType
        });

        const au = URL.createObjectURL(blob);
        url.current = au;
        setAudioURL(url.current);
        console.log("Recording stopped. Audio URL:", url.current);
        console.log("au", au);
        if (!isreset.current) {
          await uploaddatas(blob, mimeType);
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
    uploadData.current = data.fileUrl;
    console.log("url ", uploadData.current);
  };

  return (

    <div className="createLesson-container">

      <Sidebar title={`lesson : ${title}`} styles={"#a855f7"} />

      <div className='createlesson'>
        <div className='toolbar'>
          <button onClick={() => { isreset.current = false; if (!isPaused) { setisplaying(true); startRecording(); } else { resumeRecording(); setisplaying(true); } }}>{!isPaused ? "Start" : "Resume"}</button>
          <button onClick={() => { isreset.current = false; setisplaying(false); pauseRecording(); }}>Pause</button>
          <button onClick={() => {
            clearInterval(interval.current);
            setTimeline([]);
            setCode("");
            setContent("");
            currentOutput.current = "";
            currentTime.current = -1;
            setisplaying(false);
            isreset.current = true;
            stopRecording();
            editorRef.current.setValue(`//start typing code here
`);



          }}>reset</button>
          <button
            onClick={() => {
              console.log(timeline);
              isreset.current = false;

              setisplaying(false);
              stopRecording();
              console.log("Audio URL to save:", url.current); //not comming
              // console.log(url.current);
              // saveLesson();

              clearInterval(interval.current)
            }}
          >Save</button>
        </div>

        <div className='editor-container'>



          <div className='editor'>

            <Editor
              theme="vs-dark"
              height="600px"
              width="100%"
              onMount={(editor) => { editorRef.current = editor; }}
              language={language}
              onChange={(value) => currentcode.current = value}
            />

          </div>

        </div>

        <div className='output' style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#fff", fontWeight: 600 }}>Code Execution</h3>
            <button
              onClick={() => runCode()}
              disabled={isRunning}
              style={{
                padding: "10px 20px",
                backgroundColor: "#a855f7",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isRunning ? "not-allowed" : "pointer",
                opacity: isRunning ? 0.7 : 1,
                fontWeight: "bold",
                boxShadow: "0 4px 14px 0 rgba(168, 85, 247, 0.39)",
                transition: "all 0.2s ease"
              }}>
              {isRunning ? "Running..." : "▶ Run code"}
            </button>
          </div>

          <div className="terminal-window" style={{
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            backgroundColor: "#0f111a",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            minHeight: "450px"
          }}>
            {/* Native OS-Like Header */}
            <div style={{ display: "flex", alignItems: "center", padding: "12px 15px", backgroundColor: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f56" }}></div>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffbd2e" }}></div>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27c93f" }}></div>
              </div>
              <div style={{ margin: "0 auto", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "sans-serif", fontWeight: 500, letterSpacing: "0.5px" }}>
                Interactive Shell • {language || 'code'}
              </div>
              <div style={{ width: "52px" }}></div>
            </div>

            <div ref={terminalRef} style={{ width: "100%", height: "100%", flexGrow: 1, padding: "10px", paddingLeft: "15px" }}></div>
          </div>

        </div>

      </div>

    </div>

  )
}