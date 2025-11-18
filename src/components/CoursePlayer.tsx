// src/components/CoursePlayer.tsx
"use client";

import { useState, useEffect } from "react"; // (ยืนยันว่า import useEffect)
import VideoPlayer from "./VideoPlayer";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";

// (Type Definitions เหมือนเดิม)
type Lesson = {
  id: number;
  title: string;
  videoUrl: string;
  duration?: number | null;
  quiz: { id: number } | null;
};
type Course = {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
};

// (Props Interface เหมือนเดิม)
interface CoursePlayerProps {
  course: Course;
  completedLessonIds: Set<number>;
  allLessonsCompleted: boolean;
  totalLessons: number;
  userRole?: string | null;
}

export default function CoursePlayer({
  course,
  completedLessonIds,
  allLessonsCompleted,
  totalLessons,
  userRole,
}: CoursePlayerProps) {
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  // (useEffect เดิม: ตั้งค่า activeLesson แรก)
  useEffect(() => {
    if (course.lessons && course.lessons.length > 0) {
      setActiveLesson(course.lessons[0]);
      setIsVideoEnded(false); // Reset ตอนโหลดครั้งแรก
    }
  }, [course.lessons]);

  // --- vvvv 1. (สำคัญ) เพิ่ม Effect นี้ vvvv ---
  // Effect นี้จะทำงาน *ทุกครั้ง* ที่ activeLesson เปลี่ยน
  useEffect(() => {
    // Reset สถานะ 'วิดีโอจบแล้ว' เมื่อผู้ใช้เปลี่ยนไปดูบทเรียนอื่น
    setIsVideoEnded(false);
  }, [activeLesson?.id]); // Dependency คือ ID ของบทเรียนที่กำลังดู
  // --- ^^^^ สิ้นสุดส่วนที่เพิ่ม ^^^^ ---

  // (Callback handleVideoEnd เหมือนเดิม)
  const handleVideoEnd = () => {
    setIsVideoEnded(true);
  };

  // (handleMarkAsComplete เหมือนเดิม)
  const handleMarkAsComplete = async (lessonId: number) => {
    if (isCompleting || completedLessonIds.has(lessonId)) return;
    setIsCompleting(true);
    try {
      await fetch(`/api/progress/lesson/${lessonId}`, { method: "POST" });
      router.refresh();
    } catch (error) {
      console.error("Failed to mark as complete", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsCompleting(false);
    }
  };

  if (!course || course.lessons.length === 0) {
    return <p className="text-center p-8">ยังไม่มีบทเรียนสำหรับคอร์สนี้</p>;
  }

  const isActiveLessonCompleted = activeLesson
    ? completedLessonIds.has(activeLesson.id)
    : false;

  // --- vvvv 2. (แก้ไข) เงื่อนไขการแสดงปุ่ม vvvv ---
  // ตรวจสอบว่าควรแสดงปุ่ม "ยืนยันว่าเรียนจบ" หรือไม่
  const shouldShowCompleteButton =
    // กรณี 1: เป็น Admin (เห็นปุ่มเสมอ)
    userRole === "ADMIN" ||
    // กรณี 2: ไม่ใช่ Admin และวิดีโอเล่นจบแล้ว
    (userRole !== "ADMIN" && isVideoEnded);
  // --- ^^^^ สิ้นสุดการแก้ไข ^^^^ ---

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* --- ส่วนซ้าย: วิดีโอและรายละเอียด --- */}
      <div className="lg:w-2/3">
        {activeLesson ? (
          <>
            <div className="mb-4 shadow-lg rounded-lg overflow-hidden">
              <VideoPlayer
                key={activeLesson.id} // <-- (แนะนำ) เปลี่ยน Key เป็น ID ที่ไม่ซ้ำกัน
                videoUrl={activeLesson.videoUrl}
                onVideoEnd={handleVideoEnd}
              />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-black">
              {activeLesson.title}
            </h2>

            {/* ปุ่ม Mark as Complete (ใช้เงื่อนไขที่แก้ไขแล้ว) */}
            {shouldShowCompleteButton && (
              <button
                onClick={() => handleMarkAsComplete(activeLesson.id)}
                disabled={isCompleting || isActiveLessonCompleted}
                className={`w-full px-6 py-3 mt-4 rounded-lg font-bold text-lg transition-colors
                  ${
                    isActiveLessonCompleted
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isCompleting
                  ? "กำลังบันทึก..."
                  : isActiveLessonCompleted
                    ? "✔ เรียนจบบทนี้แล้ว"
                    : userRole === "ADMIN"
                      ? "(Admin) คลิกเพื่อยืนยันว่าเรียนจบบทนี้"
                      : "คลิกเพื่อยืนยันว่าเรียนจบบทนี้"}
              </button>
            )}
          </>
        ) : (
          "" // ... (Loading state) ...
        )}
      </div>

      {/* --- ส่วนขวา: รายการบทเรียน (Playlist) --- */}
      {/* (โค้ดส่วนนี้ไม่ต้องแก้ไข) */}
      <div className="lg:w-1/3 bg-gray-50 p-4 rounded-lg border h-fit">
        <h3 className="text-xl font-bold mb-1 text-black">{course.title}</h3>
        <p className="text-sm text-black mb-4">
          {completedLessonIds.size} / {totalLessons} บทเรียน
        </p>
        <div className="space-y-2">
          {course.lessons.map((lesson) => {
            const isCompleted = completedLessonIds.has(lesson.id);

            return (
              <div
                key={lesson.id}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  activeLesson?.id === lesson.id
                    ? "bg-blue-100 shadow"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {/* (ปุ่มเล่น) */}
                <button
                  type="button"
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left flex justify-between items-center ${
                    activeLesson?.id === lesson.id
                      ? "text-blue-800"
                      : "text-gray-800"
                  }`}
                >
                  <span
                    className={`flex items-center${
                      activeLesson?.id === lesson.id ? "font-semibold" : ""
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 text-green-600" />
                    ) : (
                      <PlayCircle className="w-5 h-5 mr-3 flex-shrink-0 text-gray-500" />
                    )}
                    {lesson.title}
                  </span>
                  <span className="text-sm text-gray-500 font-mono">
                    {formatDuration(lesson.duration)}
                  </span>
                </button>

                {/* (ลอจิกปุ่ม Quiz) */}
                {lesson.quiz && (
                  <div className="mt-2 pl-8">
                    {allLessonsCompleted ? (
                      <Link
                        href={`/quiz/${lesson.id}`}
                        className="inline-flex items-center px-3 py-1 text-xs font-semibold
                                   bg-yellow-200 text-yellow-800 rounded-full
                                   hover:bg-yellow-300 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm12 1a1 1 0 100-2H6a1 1 0 000 2h8zM4 9a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zm1 4a1 1 0 100 2h2a1 1 0 100-2H5z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        ทำแบบทดสอบ
                      </Link>
                    ) : (
                      <span
                        className="inline-flex items-center px-3 py-1 text-xs font-semibold
                                   bg-gray-200 text-gray-500 rounded-full cursor-not-allowed"
                      >
                        <Lock className="w-3 h-3 mr-1.5" />
                        (ต้องเรียนให้ครบทุกบทก่อน)
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
