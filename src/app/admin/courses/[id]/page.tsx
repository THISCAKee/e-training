/* eslint-disable react-hooks/exhaustive-deps */
// src/app/admin/courses/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link"; // <-- 1. เพิ่ม IMPORT LINK ที่นี่

// --- Type Definitions ---
type Quiz = { id: number; title: string };
type Lesson = {
  id: number;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  quiz: Quiz | null;
};
type Course = { id: number; title: string };

const emptyLesson = { title: "", videoUrl: "", order: 0 };

export default function ManageCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // State for Lesson Form
  const [isLessonFormVisible, setIsLessonFormVisible] = useState(false);
  const [currentLesson, setCurrentLesson] =
    useState<Partial<Lesson>>(emptyLesson);

  // สร้าง State ใหม่สำหรับช่องกรอก นาที และ วินาที
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [durationSeconds, setDurationSeconds] = useState("0");

  // --- Data Fetching ---
  const fetchData = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      // Fetch course details
      const courseRes = await fetch(`/api/admin/courses/${courseId}`);
      if (!courseRes.ok) {
        // <--- เพิ่มการตรวจสอบ
        const errorData = await courseRes.json();
        throw new Error(errorData.message || "Failed to fetch course details");
      }
      const courseData = await courseRes.json();
      setCourse(courseData);

      // Fetch lessons for this course
      const lessonsRes = await fetch(`/api/admin/courses/${courseId}/lessons`);
      if (!lessonsRes.ok) {
        // <--- เพิ่มการตรวจสอบ
        const errorData = await lessonsRes.json();
        throw new Error(errorData.message || "Failed to fetch lessons");
      }
      const lessonsData = await lessonsRes.json();
      setLessons(lessonsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      // คุณสามารถเพิ่ม State สำหรับแสดง Error บน UI ได้ถ้าต้องการ
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // 2. useEffect นี้จะทำงานเมื่อเรากด Edit เพื่อนำค่า "วินาทีรวม" มาแปลงเป็น "นาที" กับ "วินาที" แสดงในฟอร์ม
  useEffect(() => {
    if (currentLesson && currentLesson.duration) {
      const totalSeconds = currentLesson.duration;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setDurationMinutes(String(minutes));
      setDurationSeconds(String(seconds));
    } else {
      setDurationMinutes("0");
      setDurationSeconds("0");
    }
  }, [currentLesson.id]); // ให้ทำงานเมื่อ id ของ lesson ที่จะแก้เปลี่ยนไป

  // 3. useEffect นี้จะทำงานเมื่อเรากรอกค่าในช่อง "นาที" หรือ "วินาที" เพื่อแปลงกลับไปเป็น "วินาทีรวม" เก็บไว้ใน State หลัก
  useEffect(() => {
    const minutes = parseInt(durationMinutes) || 0;
    const seconds = parseInt(durationSeconds) || 0;
    const totalDuration = minutes * 60 + seconds;
    setCurrentLesson((prev) => ({ ...prev, duration: totalDuration }));
  }, [durationMinutes, durationSeconds]);

  // --- Lesson Handlers ---
  const handleLessonSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const isEditing = currentLesson.id;
    const url = isEditing
      ? `/api/admin/courses/${courseId}/lessons/${currentLesson.id}`
      : `/api/admin/courses/${courseId}/lessons`;
    const method = isEditing ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentLesson),
    });

    setIsLessonFormVisible(false);
    setCurrentLesson(emptyLesson);
    fetchData(); // Refresh list
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (window.confirm("Are you sure to delete this lesson?")) {
      await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: "DELETE",
      });
      fetchData(); // Refresh list
    }
  };

  if (loading) return <p className="p-8">Loading course details...</p>;
  if (!course) return <p className="p-8">Course not found.</p>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">
        {" "}
        <span className="text-blue-600">{course.title}</span>
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">บทเรียน</h2>
          <Link
            onClick={() => {
              setCurrentLesson(emptyLesson);
              setIsLessonFormVisible(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            href={""}
          >
            + เพิ่มบทเรียนใหม่
          </Link>
        </div>

        {/* --- Add/Edit Lesson Form --- */}
        {isLessonFormVisible && (
          <form
            onSubmit={handleLessonSubmit}
            className="mb-6 p-4 bg-gray-100 rounded-lg space-y-4"
          >
            <h3 className="text-xl font-semibold text-black">
              {currentLesson.id ? "แก้ไขบทเรียน" : "เพื่มบทเรียน"}
            </h3>
            <div>
              <label className="block text-sm font-medium text-black">
                ชื่อบทเรียน
              </label>
              <input
                type="text"
                value={currentLesson.title}
                onChange={(e) =>
                  setCurrentLesson({ ...currentLesson, title: e.target.value })
                }
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">
                Video URL
              </label>
              <input
                type="url"
                value={currentLesson.videoUrl}
                onChange={(e) =>
                  setCurrentLesson({
                    ...currentLesson,
                    videoUrl: e.target.value,
                  })
                }
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">
                เวลา
              </label>
              <div className="flex items-center space-x-2 text-black">
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-1/2 p-2 border rounded"
                  min="0"
                />
                <span className="text-gray-500">Minutes</span>
                <input
                  type="number"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  className="w-1/2 p-2 border rounded"
                  min="0"
                  max="59"
                />
                <span className="text-gray-500">Seconds</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                href={""}
              >
                Save Lesson
              </Link>
              <Link
                type="button"
                onClick={() => setIsLessonFormVisible(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                href={""}
              >
                Cancel
              </Link>
            </div>
          </form>
        )}

        {/* --- Lessons List --- */}
        <div className="space-y-4">
          {lessons.length > 0 ? (
            lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-bold text-lg text-black">
                    {lesson.order}. {lesson.title}
                  </p>
                  <div className="text-sm mt-2">
                    {lesson.quiz ? (
                      <span className="text-green-600 font-semibold">
                        ✓ Quiz: &quot;{lesson.quiz.title}&quot;
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        (ยังไม่มีแบบทดสอบ) {/* <-- ปรับข้อความเล็กน้อย */}
                      </span>
                    )}
                  </div>
                </div>

                {/* vvvv 2. อัปเดตกลุ่มปุ่มตรงนี้ vvvv */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* ปุ่มจัดการ Quiz */}
                  <Link
                    href={`/admin/lessons/${lesson.id}/quiz/edit`}
                    className={`px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
                      lesson.quiz
                        ? "bg-blue-600 hover:bg-blue-700" // สีฟ้า ถ้ามี
                        : "bg-green-600 hover:bg-green-700" // สีเขียว ถ้ายังไม่มี
                    }`}
                  >
                    {lesson.quiz ? "แก้ไข Quiz" : "เพิ่ม Quiz"}
                  </Link>

                  {/* ปุ่มแก้ไขบทเรียน (ปรับ Style ให้เข้ากัน) */}
                  <Link
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setIsLessonFormVisible(true);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md"
                    href={""}
                  >
                    แก้ไขบทเรียน
                  </Link>

                  {/* ปุ่มลบบทเรียน (ปรับ Style ให้เข้ากัน) */}
                  <Link
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                    href={""}
                  >
                    ลบ
                  </Link>
                </div>
                {/* ^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              ยังไม่มีบทเรียนในหลักสูตรนี้
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
