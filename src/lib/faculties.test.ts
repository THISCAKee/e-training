import { describe, expect, it } from "vitest";
import { isFacultyOrCollege, validateProfileChoice } from "./faculties";

describe("validateProfileChoice", () => {
  it("accepts a faculty and year for a student", () => {
    expect(
      validateProfileChoice(
        { faculty: " คณะวิทยาการสารสนเทศ ", year: "2" },
        true,
      ),
    ).toEqual({ ok: true, faculty: "คณะวิทยาการสารสนเทศ", year: 2 });
  });

  it("accepts a typed unit that is not in the system list", () => {
    expect(
      validateProfileChoice({ faculty: "กองกิจการนิสิต", year: 3 }, false),
    ).toEqual({ ok: true, faculty: "กองกิจการนิสิต", year: null });
  });

  it.each([undefined, null, 42, "", "   ", "-"])(
    "rejects faculty %s",
    (faculty) => {
      expect(
        validateProfileChoice({ faculty, year: 1 }, false),
      ).toMatchObject({ ok: false });
    },
  );

  it("rejects a name longer than the column allows", () => {
    expect(
      validateProfileChoice({ faculty: "ก".repeat(192) }, false),
    ).toEqual({ ok: false, error: "ชื่อคณะ/หน่วยงานยาวเกินไป" });
  });

  it.each([undefined, "", 0, 9, 1.5, "abc"])(
    "rejects student year %s",
    (year) => {
      expect(
        validateProfileChoice({ faculty: "คณะวิทยาการสารสนเทศ", year }, true),
      ).toEqual({ ok: false, error: "กรุณาเลือกชั้นปี" });
    },
  );
});

describe("isFacultyOrCollege", () => {
  it.each([
    ["คณะวิทยาศาสตร์", true],
    ["วิทยาลัยการเมืองการปกครอง", true],
    ["สำนักวิทยบริการ", false],
    ["วิทยาการสารสนเทศ", false],
    ["กองกิจการนิสิต", false],
  ])("%s → %s", (name, expected) => {
    expect(isFacultyOrCollege(name)).toBe(expected);
  });
});
