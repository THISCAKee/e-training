// src/components/QuizForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award } from "lucide-react"; // (Optional) ไอคอนสวยๆ

// (Types Option, Question, QuizData เหมือนเดิม)
type Option = { id: number; text: string };
type Question = { id: number; text: string; options: Option[] };
type QuizData = {
  id: number;
  title: string;
  lessonTitle: string;
  courseId: number;
  questions: Question[];
};

interface QuizFormProps {
  quizData: QuizData;
}

// --- vvvv 1. อัปเดต Type QuizResult vvvv ---
type QuizResult = {
  score: number;
  total: number;
  percentage: number;
  passed: boolean; // เพิ่ม field นี้
  results: {
    questionId: number;
    selectedOptionId: number;
    isCorrect: boolean;
  }[];
  // certificateUrl?: string; // (Optional) อาจเพิ่ม URL ทีหลัง
};
// --- ^^^^ สิ้นสุดการอัปเดต ^^^^ ---

export default function QuizForm({ quizData }: QuizFormProps) {
  // (States และ Handlers อื่นๆ เหมือนเดิม)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (Object.keys(answers).length !== quizData.questions.length) {
      setError("กรุณาตอบคำถามให้ครบทุกข้อ");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quizData.id,
          answers: answers,
        }),
      });
      if (!response.ok) {
        throw new Error("ไม่สามารถส่งคำตอบได้");
      }
      const data: QuizResult = await response.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ส่วนแสดงผลลัพธ์ ---
  if (result) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">ผลการทดสอบ</h2>
        <p className="text-xl mb-2">{quizData.title}</p>
        <p className="text-lg mb-6">
          คุณได้ <span className="font-bold text-blue-600">{result.score}</span>{" "}
          / {result.total} คะแนน
        </p>
        <div
          className={`text-5xl font-bold text-center mb-8 ${result.passed ? "text-green-600" : "text-red-600"}`}
        >
          {result.percentage.toFixed(0)}%
        </div>

        {/* --- vvvv 2. (ใหม่) แสดงข้อความและปุ่ม Certificate vvvv --- */}
        {result.passed ? (
          <div className="text-center p-6 bg-green-50 border border-green-300 rounded-lg mb-8">
            <Award className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-2xl font-semibold text-green-800 mb-2">
              ยินดีด้วย! คุณผ่านเกณฑ์แล้ว
            </h3>
            <p className="text-green-700 mb-4">
              คุณสามารถรับใบประกาศนียบัตรได้
            </p>
            {/* !! ส่วนนี้ต้องปรับแก้ตามวิธีสร้าง Certificate !!
              - ถ้าสร้างเป็นหน้าเว็บ: ใช้ <Link>
              - ถ้าสร้างเป็น PDF/Image: อาจจะเป็น <button> หรือ <a> download
            */}
            {/* --- vvvv เปลี่ยนจาก Link เป็น a tag vvvv --- */}
            <a
              href={`/api/certificate/generate/${quizData.id}`} // ชี้ไปที่ API route
              target="_blank" // บอก browser ให้ดาวน์โหลด
              // target="_blank" // (Optional) อาจไม่จำเป็นเมื่อใช้ download
              className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
            >
              รับใบประกาศนียบัตร
            </a>
          </div>
        ) : (
          <div className="text-center p-6 bg-red-50 border border-red-300 rounded-lg mb-8">
            <h3 className="text-2xl font-semibold text-red-800 mb-2">
              ยังไม่ผ่านเกณฑ์
            </h3>
            <p className="text-red-700">
              คุณต้องได้คะแนน 70% ขึ้นไป ลองทบทวนบทเรียนและทำแบบทดสอบอีกครั้ง
            </p>
          </div>
        )}
        {/* --- ^^^^ สิ้นสุดส่วนที่เพิ่ม ^^^^ --- */}

        {/* (Optional) แสดงเฉลยรายข้อ (เหมือนเดิม) */}
        <div className="space-y-4 mb-8">
          {quizData.questions.map((q, index) => {
            const res = result.results.find((r) => r.questionId === q.id);
            const selectedOpt = q.options.find(
              (o) => o.id === res?.selectedOptionId,
            );
            return (
              <div
                key={q.id}
                className={`p-4 rounded-md border ${res?.isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}
              >
                <p className="font-semibold">
                  {index + 1}. {q.text}
                </p>
                <p
                  className={`text-sm ${res?.isCorrect ? "text-green-700" : "text-red-700"}`}
                >
                  คุณตอบ: {selectedOpt?.text || "ไม่ได้ตอบ"} (
                  {res?.isCorrect ? "ถูกต้อง" : "ผิด"})
                </p>
              </div>
            );
          })}
        </div>

        {/* (ปุ่มกลับหน้าหลักสูตร เหมือนเดิม) */}
        <Link
          href={`/courses/${quizData.courseId}`}
          className="w-full text-center block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300" // เพิ่ม block
        >
          กลับไปยังหน้าหลักสูตร
        </Link>
      </div>
    );
  }

  // --- ส่วนแสดงฟอร์มคำถาม (เหมือนเดิม) ---
  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
      {/* ... (h1, p) ... */}
      <h1 className="text-3xl font-bold mb-2">{quizData.title}</h1>
      <p className="text-lg text-gray-600 mb-8">
        แบบทดสอบท้ายบทเรียน: {quizData.lessonTitle}
      </p>

      {/* ... (questions map loop) ... */}
      <div className="space-y-8">
        {quizData.questions.map((question, index) => (
          <fieldset key={question.id}>
            <legend className="text-xl font-semibold mb-4">
              {index + 1}. {question.text}
            </legend>
            <div className="space-y-3">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                    answers[question.id] === option.id
                      ? "bg-blue-50 border-blue-400 ring-2 ring-blue-300"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() => handleOptionChange(question.id, option.id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-4 text-lg text-gray-800">
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {/* ... (error, submit button) ... */}
      {error && <p className="text-red-600 text-center mt-6">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-10 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
      >
        {isSubmitting ? "กำลังส่งคำตอบ..." : "ส่งคำตอบ"}
      </button>
    </form>
  );
}
