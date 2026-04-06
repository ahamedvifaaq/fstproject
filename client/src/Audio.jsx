import { useRef, useState } from "react";

export default function Audio() {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  // START
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

        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        // console.log("Recording stopped. Audio URL:", url);

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
    <div style={{ padding: "20px" }}>
      <h2>Audio Recorder</h2>

      <button onClick={startRecording} disabled={isRecording}>
        Start
      </button>

      <button onClick={pauseRecording} disabled={!isRecording || isPaused}>
        Pause
      </button>

      <button onClick={resumeRecording} disabled={!isPaused}>
        Resume
      </button>

      <button onClick={stopRecording} disabled={!isRecording}>
        Stop
      </button>

      {audioURL && (
        <div>
          <h4>Playback:</h4>
          <audio controls src={audioURL}></audio>

          {audioURL}
        </div>
      )}
    </div>
  );
}