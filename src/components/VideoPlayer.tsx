// src/components/VideoPlayer.tsx
"use client";

import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  onVideoEnd: () => void;
}

export default function VideoPlayer({
  videoUrl,
  onVideoEnd,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // --- vvvv 1. เพิ่ม Ref เพื่อป้องกันการเรียก onVideoEnd ซ้ำซ้อน vvvv ---
  const hasEndedCallbackFired = useRef(false);
  // --- ^^^^ สิ้นสุดส่วนที่เพิ่ม ^^^^ ---

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // รีเซ็ต flag เมื่อ video source เปลี่ยน
      hasEndedCallbackFired.current = false;

      const handleVideoEnd = () => {
        // ตรวจสอบก่อนเรียก callback
        if (!hasEndedCallbackFired.current) {
          console.log("Video ended event fired!"); // (Debug Log)
          onVideoEnd();
          hasEndedCallbackFired.current = true; // ตั้ง flag ว่าเรียกแล้ว
        }
      };

      // --- vvvv 2. เพิ่ม Event Listener สำหรับ 'timeupdate' vvvv ---
      const handleTimeUpdate = () => {
        if (videoElement.duration && videoElement.currentTime) {
          // ตรวจสอบว่าใกล้จบมากๆ หรือยัง (เช่น เหลือไม่ถึง 0.5 วินาที)
          // และยังไม่เคยเรียก callback
          if (
            !hasEndedCallbackFired.current &&
            videoElement.duration - videoElement.currentTime < 0.5
          ) {
            console.log("Video nearing end (timeupdate check)!"); // (Debug Log)
            onVideoEnd(); // เรียก callback เผื่อ 'ended' ไม่ทำงาน
            hasEndedCallbackFired.current = true; // ตั้ง flag ว่าเรียกแล้ว
          }
        }
      };
      // --- ^^^^ สิ้นสุดส่วนที่เพิ่ม ^^^^ ---

      // --- 3. เพิ่ม Listener ทั้งสองตัว ---
      videoElement.addEventListener("ended", handleVideoEnd);
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
      console.log("Event listeners added for:", videoUrl); // (Debug Log)

      // Cleanup listeners
      return () => {
        videoElement.removeEventListener("ended", handleVideoEnd);
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        console.log("Event listeners removed for:", videoUrl); // (Debug Log)
      };
    }
  }, [videoUrl, onVideoEnd]); // Dependencies เหมือนเดิม

  if (!videoUrl) {
    return <p className="text-center text-red-500">Video URL is missing.</p>;
  }

  return (
    <div className="aspect-w-16 aspect-h-9 w-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        key={videoUrl} // Use videoUrl as key
        className="w-full h-full"
        controls
        preload="metadata"
        // --- vvvv 4. (Optional but recommended) เพิ่ม muted และ playsInline vvvv ---
        // บางเบราว์เซอร์ (โดยเฉพาะมือถือ) อาจมีปัญหากับ autoplay หรือ event ถ้าไม่มี props เหล่านี้
        muted={false} // ตั้งเป็น false ถ้าต้องการให้มีเสียง หรือ true ถ้าต้องการปิดเสียงเริ่มต้น
        playsInline // สำคัญสำหรับ iOS
        // --- ^^^^ สิ้นสุดส่วนที่เพิ่ม ^^^^ ---
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
