import { describe, expect, it } from "vitest";
import {
  fetchWorkspaceDepartment,
  signInWithMsuGoogle,
  studentIdFromMsuEmail,
  type GoogleIdentity,
  type MsuGoogleDependencies,
  type MsuUser,
} from "./msu-google";

const studentIdentity: GoogleIdentity = {
  email: "65010000001@msu.ac.th",
  email_verified: true,
  hd: "msu.ac.th",
  name: "Somchai Jaidee",
};

const staffIdentity: GoogleIdentity = {
  ...studentIdentity,
  email: "somsri.j@msu.ac.th",
  name: "Somsri Jaidee",
};

function msuUser(overrides: Partial<MsuUser>): MsuUser {
  return {
    id: 1,
    email: "someone@msu.ac.th",
    name: null,
    role: "USER",
    studentId: null,
    faculty: null,
    organizationId: null,
    ...overrides,
  };
}

function dependencies(users: MsuUser[], department: string | null = null) {
  const created: MsuUser[] = [];
  const updated: { id: number; data: object }[] = [];
  let departmentLookups = 0;
  const deps: MsuGoogleDependencies = {
    findUserByEmail: async (email) =>
      users.find((user) => user.email === email) ?? null,
    findUserByStudentId: async (studentId) =>
      users.find((user) => user.studentId === studentId) ?? null,
    fetchDepartment: async () => {
      departmentLookups += 1;
      return department;
    },
    createUser: async (data) => {
      const user = msuUser({ id: 100 + created.length, ...data });
      created.push(user);
      return user;
    },
    updateUser: async (id, data) => {
      updated.push({ id, data });
      const user = users.find((candidate) => candidate.id === id)!;
      return { ...user, ...data };
    },
  };
  return {
    deps,
    created,
    updated,
    departmentLookups: () => departmentLookups,
  };
}

describe("studentIdFromMsuEmail", () => {
  it.each([
    ["65010000001@msu.ac.th", "65010000001"],
    ["somsri.j@msu.ac.th", null],
    ["6501000000@msu.ac.th", null],
    ["65010000001@gmail.com", null],
  ])("%s → %s", (email, expected) => {
    expect(studentIdFromMsuEmail(email)).toBe(expected);
  });
});

describe("signInWithMsuGoogle", () => {
  it("creates a student with the student ID from the email and the directory faculty", async () => {
    const { deps, created } = dependencies([], "คณะวิทยาการสารสนเทศ");

    const result = await signInWithMsuGoogle(studentIdentity, deps);

    expect(result).toEqual({
      ok: true,
      user: {
        id: "100",
        email: "65010000001@msu.ac.th",
        name: "Somchai Jaidee",
        role: "USER",
        studentId: "65010000001",
        organizationId: null,
      },
    });
    expect(created[0]).toMatchObject({
      studentId: "65010000001",
      faculty: "คณะวิทยาการสารสนเทศ",
    });
  });

  it("creates staff without a student ID", async () => {
    const { deps, created } = dependencies([], "สำนักวิทยบริการ");

    await signInWithMsuGoogle(staffIdentity, deps);

    expect(created[0]).toMatchObject({
      email: "somsri.j@msu.ac.th",
      studentId: null,
      faculty: "สำนักวิทยบริการ",
    });
  });

  it("creates the account even when the directory has no department", async () => {
    const { deps, created } = dependencies([], null);

    const result = await signInWithMsuGoogle(staffIdentity, deps);

    expect(result.ok).toBe(true);
    expect(created[0]).toMatchObject({ faculty: null });
  });

  it("signs in an existing account with the same email without creating one", async () => {
    const existing = msuUser({
      id: 7,
      email: "staff@msu.ac.th",
      role: "ORG_ADMIN",
      faculty: "สำนักคอมพิวเตอร์",
      organizationId: 3,
    });
    const { deps, created, updated, departmentLookups } = dependencies([
      existing,
    ]);

    const result = await signInWithMsuGoogle(
      { ...staffIdentity, email: "Staff@MSU.ac.th" },
      deps,
    );

    expect(result).toMatchObject({
      ok: true,
      user: { id: "7", role: "ORG_ADMIN", organizationId: 3 },
    });
    expect(created).toHaveLength(0);
    expect(updated).toHaveLength(0);
    expect(departmentLookups()).toBe(0);
  });

  it("links a student who registered with a personal email by student ID", async () => {
    const existing = msuUser({
      id: 12,
      email: "somchai@gmail.com",
      studentId: "65010000001",
      faculty: "คณะวิทยาศาสตร์",
    });
    const { deps, created } = dependencies([existing]);

    const result = await signInWithMsuGoogle(studentIdentity, deps);

    expect(result).toMatchObject({ ok: true, user: { id: "12" } });
    expect(created).toHaveLength(0);
  });

  it("fills a missing student ID and faculty on an existing account", async () => {
    const existing = msuUser({ id: 9, email: "65010000001@msu.ac.th" });
    const { deps, updated } = dependencies([existing], "คณะเทคโนโลยี");

    const result = await signInWithMsuGoogle(studentIdentity, deps);

    expect(updated).toEqual([
      {
        id: 9,
        data: { studentId: "65010000001", faculty: "คณะเทคโนโลยี" },
      },
    ]);
    expect(result).toMatchObject({ ok: true, user: { studentId: "65010000001" } });
  });

  it("does not overwrite a faculty that is already set", async () => {
    const existing = msuUser({
      id: 9,
      email: "65010000001@msu.ac.th",
      studentId: "65010000001",
      faculty: "คณะวิทยาศาสตร์",
    });
    const { deps, updated } = dependencies([existing], "คณะเทคโนโลยี");

    await signInWithMsuGoogle(studentIdentity, deps);

    expect(updated).toHaveLength(0);
  });

  it("rejects an ADMIN account so admins keep signing in by username", async () => {
    const { deps } = dependencies([
      msuUser({ email: "admin@msu.ac.th", role: "ADMIN" }),
    ]);

    const result = await signInWithMsuGoogle(
      { ...staffIdentity, email: "admin@msu.ac.th" },
      deps,
    );

    expect(result).toEqual({ ok: false, error: "AdminUseUsername" });
  });

  it.each<[string, GoogleIdentity]>([
    ["personal Gmail", { ...studentIdentity, email: "someone@gmail.com", hd: undefined }],
    ["another Workspace domain", { ...studentIdentity, email: "a@kku.ac.th", hd: "kku.ac.th" }],
    ["msu address without the hd claim", { ...studentIdentity, hd: undefined }],
    ["unverified email", { ...studentIdentity, email_verified: false }],
    ["missing email", { ...studentIdentity, email: null }],
  ])("rejects %s without touching the database", async (_, identity) => {
    const { deps, created } = dependencies([]);

    const result = await signInWithMsuGoogle(identity, deps);

    expect(result).toEqual({ ok: false, error: "MsuAccountOnly" });
    expect(created).toHaveLength(0);
  });
});

describe("fetchWorkspaceDepartment", () => {
  const respond = (status: number, body: unknown) =>
    (async () =>
      new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it("prefers the department from the Workspace domain profile", async () => {
    const department = await fetchWorkspaceDepartment(
      "token",
      respond(200, {
        organizations: [
          { department: "Old Lab", metadata: { primary: true, source: { type: "PROFILE" } } },
          { department: " คณะวิทยาการสารสนเทศ ", metadata: { source: { type: "DOMAIN_PROFILE" } } },
        ],
      }),
    );

    expect(department).toBe("คณะวิทยาการสารสนเทศ");
  });

  it.each<[string, typeof fetch]>([
    ["no organizations", respond(200, {})],
    ["an API error", respond(403, { error: "PERMISSION_DENIED" })],
    [
      "a network failure",
      (async () => {
        throw new Error("offline");
      }) as unknown as typeof fetch,
    ],
  ])("returns null on %s", async (_, fetchImpl) => {
    await expect(fetchWorkspaceDepartment("token", fetchImpl)).resolves.toBeNull();
  });
});
