// src/components/admin/QuizEditForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, PlusCircle, Link } from "lucide-react";

// --- (Types และ Interface เหมือนเดิม) ---
type OptionState = {
  id?: number;
  text: string;
  isCorrect: boolean;
};

type QuestionState = {
  id?: number;
  text: string;
  options: OptionState[];
};

interface QuizEditFormProps {
  lessonId: number;
  courseId: number;
  initialData:
    | (ReturnType<typeof JSON.parse> & {
        questions: (ReturnType<typeof JSON.parse> & {
          options: ReturnType<typeof JSON.parse>[];
        })[];
      })
    | null;
}

export default function QuizEditForm({
  lessonId,
  courseId,
  initialData,
}: QuizEditFormProps) {
  const router = useRouter();

  // --- (States และ Handlers อื่นๆ เหมือนเดิม) ---
  const [title, setTitle] = useState(initialData?.title || "");
  const [questions, setQuestions] = useState<QuestionState[]>(
    initialData?.questions || [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const deleteQuestion = (qIndex: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคำถามนี้?")) {
      setQuestions(questions.filter((_, index) => index !== qIndex));
    }
  };

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].text = text;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ text: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const deleteOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter(
      (_, index) => index !== oIndex,
    );
    setQuestions(newQuestions);
  };

  const handleOptionTextChange = (
    qIndex: number,
    oIndex: number,
    text: string,
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = text;
    setQuestions(newQuestions);
  };

  const handleCorrectOptionChange = (qIndex: number, correctOIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.forEach((option, oIndex) => {
      option.isCorrect = oIndex === correctOIndex;
    });
    setQuestions(newQuestions);
  };

  // --- vvvv อัปเดตฟังก์ชันนี้ vvvv ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- 1. อัปเดตการตรวจสอบ Validation ---
    if (!title || title.trim().length === 0) {
      setError("กรุณาใส่ชื่อแบบทดสอบ");
      return;
    }
    if (questions.length === 0) {
      setError("กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ");
      return;
    }

    // (เพิ่ม) ตรวจสอบความสมบูรณ์ของแต่ละคำถาม
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.text || q.text.trim().length === 0) {
        setError(`คำถามที่ ${i + 1} ยังไม่ได้ใส่ข้อความ`);
        return;
      }
      if (q.options.length < 2) {
        setError(`คำถามที่ ${i + 1} ต้องมีอย่างน้อย 2 ตัวเลือก`);
        return;
      }
      if (q.options.some((opt) => !opt.text || opt.text.trim().length === 0)) {
        setError(`คำถามที่ ${i + 1} มีตัวเลือกที่ว่างเปล่า`);
        return;
      }
      if (!q.options.some((opt) => opt.isCorrect)) {
        setError(`คำถามที่ ${i + 1} ยังไม่ได้เลือกคำตอบที่ถูกต้อง`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const body = {
        title,
        questions,
      };

      const response = await fetch(`/api/admin/lessons/${lessonId}/quiz`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // --- 2. อัปเดตการจัดการ Error ---
      if (!response.ok) {
        // พยายามอ่าน Error จาก Server (ที่เราตั้งไว้ใน API)
        const errorData = await response.json();
        throw new Error(errorData.error || "เกิดข้อผิดพลาดในการบันทึกแบบทดสอบ");
      }

      // บันทึกสำเร็จ
      router.push(`/admin/courses/${courseId}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- ^^^^ สิ้นสุดการอัปเดต ^^^^ ---

  // --- (JSX ที่เหลือเหมือนเดิม) ---
  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
      {/* ... (ส่วน Title ของ Quiz) ... */}
      <div className="mb-6">
        <label
          htmlFor="quizTitle"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          ชื่อแบบทดสอบ
        </label>
        <input
          id="quizTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="เช่น แบบทดสอบความเข้าใจบทที่ 1"
        />
      </div>

      <hr className="my-8" />

      {/* ... (ส่วน Questions Loop) ... */}
      <div className="space-y-8">
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="p-6 border border-gray-200 rounded-lg bg-gray-50 relative"
          >
            {/* ... (ปุ่มลบคำถาม) ... */}
            <button
              type="button"
              onClick={() => deleteQuestion(qIndex)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>

            <label className="block text-md font-semibold text-gray-800 mb-3">
              คำถามที่ {qIndex + 1}
            </label>
            <input
              type="text"
              value={q.text}
              onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              placeholder="ใส่เนื้อหาคำถาม..."
            />

            {/* ... (ส่วน Options Loop) ... */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-600">
                ตัวเลือก (เลือกคำตอบที่ถูกต้อง 1 ข้อ):
              </label>
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-3">
                  {/* ... (Radio Button) ... */}
                  <input
                    type="radio"
                    name={`correct-q-${qIndex}`}
                    checked={opt.isCorrect}
                    onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                    className="h-5 w-5 text-blue-600"
                  />
                  {/* ... (Text Input) ... */}
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) =>
                      handleOptionTextChange(qIndex, oIndex, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={`ตัวเลือก ${oIndex + 1}`}
                  />
                  {/* ... (ปุ่มลบตัวเลือก) ... */}
                  <button
                    type="button"
                    onClick={() => deleteOption(qIndex, oIndex)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* ... (ปุ่มเพิ่มตัวเลือก) ... */}
            <button
              type="button"
              onClick={() => addOption(qIndex)}
              className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <PlusCircle size={16} className="mr-1" />
              เพิ่มตัวเลือก
            </button>
          </div>
        ))}
      </div>

      {/* ... (ปุ่มเพิ่มคำถาม) ... */}
      <button
        type="button"
        onClick={addQuestion}
        className="mt-8 flex items-center justify-center w-full px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400"
      >
        <PlusCircle size={20} className="mr-2" />
        เพิ่มคำถามใหม่
      </button>

      {/* ... (ปุ่ม Submit หลัก) ... */}
      <div className="mt-10 flex justify-end items-center">
        {" "}
        {/* (เพิ่ม items-center) */}
        {error && <p className="text-red-600 mr-auto">{error}</p>}
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-4 px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          disabled={isSubmitting}
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึกแบบทดสอบ"}
        </button>
      </div>
    </form>
  );
}
