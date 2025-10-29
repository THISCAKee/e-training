// src/components/CompleteLessonButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CompleteLessonButtonProps {
  lessonId: number;
  courseId: number;
}

export default function CompleteLessonButton({
  lessonId,
  courseId,
}: CompleteLessonButtonProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    try {
      const response = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId, courseId }),
      });

      if (response.ok) {
        setIsCompleted(true);
        router.push(`/courses/${courseId}`);
      } else {
        console.error("Failed to mark lesson as complete");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isCompleted}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
    >
      {isCompleted ? "Completed" : "Mark as Complete"}
    </button>
  );
}
