import { Editor } from "@monaco-editor/react";
import { mockLesson } from "./mockdata";
import React, { useState, useEffect, useRef } from "react";
import './createlesson.css';
import './lesson.css';
import Sidebar from "./components/sidebar.jsx";
import { useParams } from "react-router-dom";
import { FaPlay, FaPause } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Lesson() {
  const lessonID = useParams().lessonID;
  const mtitle = useParams().mtitle;
  var [lessonData, setLessonData] = useState(mockLesson);
  const [code, setCode] = useState("");
  const [content, setContent] = useState("");
  var [overlay, setoverlay] = useState(false);
  const [started, setStarted] = useState(false);
  var [currentTime, setcurrentTime] = useState(-1);
  const currentTimeRef = useRef(-1);
  const currentcode = useRef("");
  const sliderRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  const startedRef = useRef(false);        // ✅ ref for started to avoid stale closures
  const lessonDataRef = useRef(mockLesson); // ✅ ref for lessonData to avoid stale closures
  const animFrameRef = useRef(null);        // ✅ rAF ref instead of setInterval
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const getAudioUrl = (url) => {
    if (!url || url === "not working") return null;
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // ✅ Audio is the single source of truth — rAF loop reads audio.currentTime
  const startLoop = () => {
    cancelAnimationFrame(animFrameRef.current);

    const tick = () => {
      if (!audioRef.current || !startedRef.current) return;

      // ✅ Read time directly from audio — no drift possible
      const t = Math.floor(audioRef.current.currentTime);

      if (t !== currentTimeRef.current) {
        currentTimeRef.current = t;
        setcurrentTime(t);

        // update slider
        if (sliderRef.current) sliderRef.current.value = t;

        // update code snapshot
        const currentStep = [...lessonDataRef.current.timeline]
          .reverse()
          .find((step) => step.timestamp <= t);

        if (currentStep) {
          setCode(currentStep.codeSnapshot);
          currentcode.current = currentStep.codeSnapshot;
          
          if (currentStep.outputSnapshot !== undefined && currentStep.outputSnapshot !== null) {
              setContent(currentStep.outputSnapshot);
          }
        }

        // ✅ check end using audio duration — not videoLength
        if (audioRef.current.ended || t >= lessonDataRef.current.videoLength) {
          startedRef.current = false;
          setStarted(false);
          const token = localStorage.getItem("accessToken");
          if (token) {
              fetch(`http://localhost:5000/api/user/lesson/${lessonID}/complete`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
              }).then(() => {
                  navigate(0);
              }).catch(err => {
                  console.error("Could not mark lesson complete", err);
                  navigate(0);
              });
          } else {
              navigate(0);
          }
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    cancelAnimationFrame(animFrameRef.current);
  };

  const initAudio = (url) => {
    const fullUrl = getAudioUrl(url);
    if (!fullUrl) return;

    // only create new Audio if url changed
    const cleanUrlPart = fullUrl.replace("http://localhost:5000", "");
    if (audioRef.current && audioRef.current.src.endsWith(cleanUrlPart)) return;

    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(fullUrl);
    audioRef.current.onerror = (e) => console.error("Audio error:", e);
  };

  // ✅ Single play function — always seeks to currentTimeRef before playing
  const playFromCurrentTime = () => {
    if (!audioRef.current) return;

    audioRef.current.playbackRate = speedRef.current;

    const seekAndPlay = () => {
      if (currentTimeRef.current > 0) {
        audioRef.current.currentTime = currentTimeRef.current;
      }
      audioRef.current.playbackRate = speedRef.current;
      audioRef.current.play().catch(e => console.error("Play error:", e));
      startLoop();
    };

    if (audioRef.current.readyState >= 1) {
      seekAndPlay();
    } else {
      audioRef.current.addEventListener("loadedmetadata", seekAndPlay, { once: true });
    }
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
    stopLoop();
  };

  async function loadLesson() {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`http://localhost:5000/api/lesson/${lessonID}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      throw new Error("Unauthorized");
    }
    const data = await response.json();
    setLessonData(data);
    lessonDataRef.current = data; // ✅ keep ref in sync
    initAudio(data.audioUrl);    // ✅ init audio once data is loaded
    console.log("Fetched lesson data:", data);
  }

  useEffect(() => {
    document.body.style.background = "#1e1e1e";
    return () => { document.body.style.background = ""; };
  }, []);

  useEffect(() => {
    loadLesson();

    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        const next = !startedRef.current;
        startedRef.current = next;
        setStarted(next);
        if (next) setoverlay(true);
      }

      if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
        e.preventDefault();
        const skip = e.code === "ArrowRight" ? 5 : -5;
        const newTime = Math.min(
          Math.max(currentTimeRef.current + skip, 0),
          lessonDataRef.current.videoLength
        );
        seekTo(newTime);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      stopLoop();
      audioRef.current?.pause();
    };
  }, []);

  // ✅ Central seek function used by slider, arrow keys
  const seekTo = (newTime) => {
    currentTimeRef.current = newTime;
    setcurrentTime(newTime);
    if (sliderRef.current) sliderRef.current.value = newTime;

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }

    // if playing, restart loop (audio seek already handled above)
    if (startedRef.current) {
      stopLoop();
      startLoop();
    }
  };

  // ✅ React to started changing
  useEffect(() => {
    startedRef.current = started;
    if (started) {
      initAudio(lessonDataRef.current.audioUrl);
      playFromCurrentTime();
    } else {
      pauseAudio();
    }
  }, [started]);

  // ✅ React to speed changing
  useEffect(() => {
    speedRef.current = speed;
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  async function runCode() {
    const token = localStorage.getItem("accessToken");
    const response = await fetch('http://localhost:5000/api/output', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code: currentcode.current,language: lessonData.language })
    });
    if (response.status === 200) {
      const data = await response.json();
      setContent(data.output);
    }
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      throw new Error("Unauthorized");s
    }
  }

  return (
    <div>
      {!overlay && (
        <div className="overlay">
          <div className="play-btn" onClick={() => { setStarted(true); setoverlay(true); }}></div>
        </div>
      )}
      <Sidebar title={`${mtitle}:${lessonData.title}`} styles={"#a855f7"} />
      <div className="createLesson-container">
        <div className='createlesson'>
          <div className='editor-container'>
            <div className='editor'>
              <Editor
                defaultValue="welcome to coding"
                value={code}
                theme="vs-dark"
                height="600px"
                width="100%"
                language={lessonData.language || "javascript"}
                onChange={(value) => currentcode.current = value}
              />
            </div>
          </div>
          <div className='output'>
            output screen
            <div className="output-run">
              <button onClick={() => runCode()}>Run</button>
            </div>
            <div className="output-content" style={{ whiteSpace: "pre-line" }}>
              {content}
            </div>
          </div>
        </div>
      </div>

      <div className="timeline">
        <div className="timer">
          <button
            onClick={() => { setStarted((prev) => !prev); setoverlay(true); }}
            style={{ marginRight: 10, backgroundColor: started ? "#ef4444" : "#22c55e", border: "none", color: "white", padding: "6px 14px", borderRadius: "4px", cursor: "pointer" }}
          >
            {started ? <FaPause size={20} /> : <FaPlay size={20} />}
          </button>

          <div style={{ color: "white", marginLeft: 10, marginRight: 10 }}>
            {Math.floor(currentTime / 60)}:{currentTime % 60 < 10 ? `0${currentTime % 60}` : currentTime % 60}
          </div>

          <input
            ref={sliderRef}
            type="range"
            defaultValue={0}
            min="0"
            max={lessonData.videoLength}
            onChange={(e) => seekTo(Number(e.target.value))} // ✅ single seekTo call
            style={{ width: "100%" }}
          />

          <div style={{ color: "white", marginLeft: 10 }}>
            {Math.floor(lessonData.videoLength / 60)}:{lessonData.videoLength % 60 < 10 ? `0${lessonData.videoLength % 60}` : lessonData.videoLength % 60}
          </div>

          {/* Speed buttons */}
          <div style={{ display: "flex", gap: "6px", marginLeft: 16 }}>
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  backgroundColor: speed === s ? "#a855f7" : "#374151",
                  border: "none",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: speed === s ? "bold" : "normal"
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}