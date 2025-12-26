"use client";

import { useEffect, useRef, useState } from "react";

export default function LocalMediaPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream;
    async function startMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log("Media error: ", err);
        setError("Camera or microphone permission denied");
      }
    }
    startMedia();
     return () => {
       stream?.getTracks().forEach((track) => track.stop());
     };
  }, []);


  if (error) {
    return (
      <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
        {error}
      </div>
    );
  }


    return (
      <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
          You
        </span>
      </div>
    );
}
