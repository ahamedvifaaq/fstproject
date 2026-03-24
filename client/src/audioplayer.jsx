import { useEffect, useRef, useState } from "react";

export default function Player() {
    const audioURL = "blob:http://localhost:5173/dad4ef5d-2d07-4e29-a23a-afbf5afa3abf";
  const audioRef = useRef(null);
  const sliderRef = useRef(null);

  const [duration, setDuration] = useState(0);

  // 🎧 Load audio when URL changes
  useEffect(() => {
    if (!audioURL) return;

    // stop previous audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioURL);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      if (sliderRef.current) {
        sliderRef.current.max = audio.duration;
      }
    };

    return () => audio.pause();
  }, [audioURL]);

  // ▶️ play
  const play = () => {
    audioRef.current?.play();
  };

  // ⏸ pause
  const pause = () => {
    audioRef.current?.pause();
  };

  // 🎯 seek (when user drags)
  const handleSeek = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = e.target.value;
    }
  };

  // 🔥 smooth timeline (core)
  useEffect(() => {
    let frame;

    const update = () => {
      if (audioRef.current && sliderRef.current) {
        sliderRef.current.value = audioRef.current.currentTime;
      }
      frame = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div style={{ width: 400, margin: "50px auto" }}>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>

      <br /><br />

      <input
        ref={sliderRef}
        type="range"
        min="0"
        defaultValue="0"
        step="0.01"
        onChange={handleSeek}
        style={{ width: "100%" }}
      />

      <p>Duration: {duration.toFixed(2)} sec</p>
    </div>
  );
}