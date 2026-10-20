export const MSU_FACULTIES = [
  "คณะวิทยาศาสตร์",
  "คณะเทคโนโลยี",
  "คณะวิศวกรรมศาสตร์",
  "คณะสถาปัตยกรรมศาสตร์ผังเมืองและนฤมิตศิลป์",
  "คณะสิ่งแวดล้อมและทรัพยากรศาสตร์",
  "คณะวิทยาการสารสนเทศ",
  "คณะพยาบาลศาสตร์",
  "คณะเภสัชศาสตร์",
  "คณะสาธารณสุขศาสตร์",
  "คณะแพทยศาสตร์",
  "คณะสัตวแพทยศาสตร์",
  "คณะมนุษยศาสตร์และสังคมศาสตร์",
  "คณะศึกษาศาสตร์",
  "คณะการบัญชีและการจัดการ",
  "คณะศิลปกรรมศาสตร์และวัฒนธรรมศาสตร์",
  "คณะการท่องเที่ยวและการโรงแรม",
  "วิทยาลัยการเมืองการปกครอง",
  "คณะนิติศาสตร์",
  "วิทยาลัยดุริยางคศิลป์",
  "บัณฑิตวิทยาลัย",
  "สำนักศึกษาทั่วไป",
  "สถาบันวิจัยวลัยรุกขเวช",
  "สถาบันวิจัยศิลปะและวัฒนธรรมอีสาน",
  "สำนักคอมพิวเตอร์",
  "สำนักวิทยบริการ",
  "สำนักงานอธิการบดี",
  "กองแผนงาน",
  "กองการเจ้าหน้าที่",
  "กองกิจการนิสิต",
  "กองคลังและพัสดุ",
  "กองบริการการศึกษา",
  "กองทะเบียนและประมวลผล",
  "กองอาคารสถานที่",
  "กองส่งเสริมการวิจัยและบริการวิชาการ",
  "กองประชาสัมพันธ์และกิจการต่างประเทศ",
  "ศูนย์วิจัยและการศึกษาบรรพชีวินวิทยา",
  "สำนักบริการวิชาการ",
  
];

const MAX_FACULTY_LENGTH = 191;

// Students belong to a faculty or college; other units (offices, divisions,
// centres) are for staff only.
export function isFacultyOrCollege(name: string): boolean {
  return /^(คณะ|วิทยาลัย)/.test(name.trim());
}

export const MIN_STUDENT_YEAR = 1;
export const MAX_STUDENT_YEAR = 8;

export type ProfileChoiceResult =
  | { ok: true; faculty: string; year: number | null }
  | { ok: false; error: string };

// The system list only suggests names; a faculty/unit missing from it can be
// typed in. Students also give their year of study, the same range the
// student register form allows.
export function validateProfileChoice(
  input: { faculty?: unknown; year?: unknown },
  isStudent: boolean,
): ProfileChoiceResult {
  const faculty = typeof input.faculty === "string" ? input.faculty.trim() : "";

  if (!/\p{L}/u.test(faculty)) {
    return { ok: false, error: "กรุณาเลือกหรือพิมพ์คณะ/หน่วยงาน" };
  }
  if (faculty.length > MAX_FACULTY_LENGTH) {
    return { ok: false, error: "ชื่อคณะ/หน่วยงานยาวเกินไป" };
  }
  if (!isStudent) return { ok: true, faculty, year: null };

  const year = Number(input.year);
  if (
    !Number.isInteger(year) ||
    year < MIN_STUDENT_YEAR ||
    year > MAX_STUDENT_YEAR
  ) {
    return { ok: false, error: "กรุณาเลือกชั้นปี" };
  }
  return { ok: true, faculty, year };
}
