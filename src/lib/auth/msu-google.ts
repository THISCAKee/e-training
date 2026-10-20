import {
  toAuthorizedUser,
  type AuthorizedUser,
  type CredentialUser,
} from "./authorize-credentials";

export const MSU_DOMAIN = "msu.ac.th";

// MSU issues student mailboxes as <11-digit student ID>@msu.ac.th; staff
// mailboxes are name-based.
const STUDENT_ID_PATTERN = /^\d{11}$/;

export interface GoogleIdentity {
  email?: string | null;
  email_verified?: boolean;
  hd?: string;
  name?: string | null;
}

export type MsuUser = Omit<CredentialUser, "username" | "password"> & {
  faculty: string | null;
};

export interface MsuAccountLookup {
  findUserByEmail(email: string): Promise<MsuUser | null>;
  findUserByStudentId(studentId: string): Promise<MsuUser | null>;
}

export interface MsuGoogleDependencies extends MsuAccountLookup {
  // Faculty or unit from the Workspace directory, null when it is not set.
  fetchDepartment(): Promise<string | null>;
  createUser(data: {
    email: string;
    name: string | null;
    studentId: string | null;
    faculty: string | null;
  }): Promise<MsuUser>;
  updateUser(
    id: number,
    data: { studentId?: string; faculty?: string },
  ): Promise<MsuUser>;
}

export type MsuGoogleSignInError = "MsuAccountOnly" | "AdminUseUsername";

export type MsuGoogleSignInResult =
  | { ok: true; user: AuthorizedUser }
  | { ok: false; error: MsuGoogleSignInError };

export function studentIdFromMsuEmail(email: string): string | null {
  const [localPart, domain] = email.toLowerCase().split("@");
  return domain === MSU_DOMAIN && STUDENT_ID_PATTERN.test(localPart)
    ? localPart
    : null;
}

// A student who registered with a personal email is the same person as the
// matching student mailbox, so the student ID links the two.
export async function findMsuAccount(
  email: string,
  lookup: MsuAccountLookup,
): Promise<MsuUser | null> {
  const studentId = studentIdFromMsuEmail(email);
  return (
    (await lookup.findUserByEmail(email)) ??
    (studentId ? await lookup.findUserByStudentId(studentId) : null)
  );
}

export async function signInWithMsuGoogle(
  identity: GoogleIdentity,
  dependencies: MsuGoogleDependencies,
): Promise<MsuGoogleSignInResult> {
  const email = identity.email?.trim().toLowerCase();

  // `hd` is set only for Google Workspace accounts, so a personal Gmail
  // address cannot pass even if its local part looks like an MSU one.
  const isMsuAccount =
    identity.email_verified === true &&
    identity.hd === MSU_DOMAIN &&
    email?.endsWith(`@${MSU_DOMAIN}`);

  if (!email || !isMsuAccount) return { ok: false, error: "MsuAccountOnly" };

  const existing = await findMsuAccount(email, dependencies);

  if (existing?.role === "ADMIN") {
    return { ok: false, error: "AdminUseUsername" };
  }

  const studentId = studentIdFromMsuEmail(email);

  if (!existing) {
    const user = await dependencies.createUser({
      email,
      name: identity.name?.trim() || null,
      studentId,
      faculty: await dependencies.fetchDepartment(),
    });
    return { ok: true, user: toAuthorizedUser(user) };
  }

  // Fill only what the account is missing; never overwrite what the user or
  // an admin already entered.
  const updates: { studentId?: string; faculty?: string } = {};
  if (
    studentId &&
    !existing.studentId &&
    !(await dependencies.findUserByStudentId(studentId))
  ) {
    updates.studentId = studentId;
  }
  if (!existing.faculty) {
    const faculty = await dependencies.fetchDepartment();
    if (faculty) updates.faculty = faculty;
  }

  const user =
    Object.keys(updates).length > 0
      ? await dependencies.updateUser(existing.id, updates)
      : existing;

  return { ok: true, user: toAuthorizedUser(user) };
}

interface PeopleOrganization {
  department?: string;
  metadata?: { primary?: boolean; source?: { type?: string } };
}

// Reads the department of the signed-in Workspace account through the People
// API. Any failure yields null so sign-in never depends on directory data.
export async function fetchWorkspaceDepartment(
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const response = await fetchImpl(
      "https://people.googleapis.com/v1/people/me?personFields=organizations",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) {
      console.warn(
        `People API ${response.status}; faculty left empty:`,
        await response.text(),
      );
      return null;
    }

    const { organizations = [] } = (await response.json()) as {
      organizations?: PeopleOrganization[];
    };
    if (!organizations.some((org) => org.department?.trim())) {
      console.warn(
        "People API returned no department; faculty left empty:",
        JSON.stringify(organizations),
      );
    }
    const withDepartment = organizations.filter((org) =>
      org.department?.trim(),
    );
    const preferred =
      withDepartment.find(
        (org) => org.metadata?.source?.type === "DOMAIN_PROFILE",
      ) ??
      withDepartment.find((org) => org.metadata?.primary) ??
      withDepartment[0];

    return preferred?.department?.trim() ?? null;
  } catch (error) {
    console.warn("People API request failed; faculty left empty:", error);
    return null;
  }
}
