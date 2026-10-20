"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowRight, GraduationCap, Loader2, UserRound } from "lucide-react";
import { MAX_STUDENT_YEAR, MIN_STUDENT_YEAR } from "@/lib/faculties";
import FacultyCombobox from "./FacultyCombobox";

interface CompleteProfileFormProps {
  name: string | null;
  studentId: string | null;
  faculties: string[];
  destination: string;
}

const STUDENT_YEARS = Array.from(
  { length: MAX_STUDENT_YEAR - MIN_STUDENT_YEAR + 1 },
  (_, index) => MIN_STUDENT_YEAR + index,
);

export default function CompleteProfileForm({
  name,
  studentId,
  faculties,
  destination,
}: CompleteProfileFormProps) {
  const { update } = useSession();
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isStudent = Boolean(studentId);
  const isComplete = faculty.trim() !== "" && (!isStudent || year !== null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete) return;
    setIsSaving(true);
    setError(null);

    const response = await fetch("/api/profile/faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faculty, year: isStudent ? year : null }),
    });

    // 409 คือมีคณะอยู่แล้ว ถือว่าเสร็จและไปต่อได้
    if (!response.ok && response.status !== 409) {
      setError((await response.text()) || "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setIsSaving(false);
      return;
    }

    // ให้ session ล้างสถานะ needsFaculty ก่อนออกจากหน้านี้
    await update();
    window.location.assign(destination);
  };

  return (
    <div className="profile-card-in w-full max-w-md space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)] sm:p-10">
      <div className="flex flex-col items-center text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          {isStudent ? (
            <GraduationCap className="size-7" />
          ) : (
            <UserRound className="size-7" />
          )}
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          {isStudent ? "ระบุคณะและชั้นปีของคุณ" : "ระบุคณะ/หน่วยงานของคุณ"}
        </h2>
        {name && <p className="mt-1 font-medium text-gray-700">{name}</p>}
        <span className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {isStudent ? `นิสิต · ${studentId}` : "บุคลากร"}
        </span>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="faculty" className="block text-sm font-medium text-gray-900">
            {isStudent ? "คณะ / วิทยาลัย" : "สังกัด / คณะ / หน่วยงาน"}
          </label>
          <FacultyCombobox
            id="faculty"
            value={faculty}
            onChange={setFaculty}
            options={faculties}
            grouped={!isStudent}
            placeholder="ค้นหา หรือพิมพ์ชื่อ"
          />
        </div>

        {isStudent && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-900">ชั้นปี</legend>
            <div role="radiogroup" className="grid grid-cols-4 gap-2">
              {STUDENT_YEARS.map((option) => {
                const isSelected = option === year;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setYear(option)}
                    className={`h-11 rounded-xl border text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 active:scale-95 ${
                      isSelected
                        ? "year-chip-pop border-blue-600 bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.7)]"
                        : "border-gray-200 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700"
                    }`}
                  >
                    ปี {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            error ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
          aria-live="polite"
        >
          <div className="overflow-hidden">
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving || !isComplete}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.8)] transition-all duration-200 hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              บันทึกและเริ่มใช้งาน
              <ArrowRight className="size-4 transition-transform duration-200 group-enabled:group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
