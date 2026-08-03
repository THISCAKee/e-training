# Admin Username Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `ADMIN` authenticate with the username `admin`, while `USER` and `ORG_ADMIN` continue authenticating with email on the existing `/login` page.

**Architecture:** Add a nullable unique username to `User`, backfill the single existing administrator, and extract credential resolution into a dependency-injected function that can be tested without a live database. Keep one login form with a single identifier input, and centralize role-aware safe redirect selection in a pure helper.

**Tech Stack:** Next.js 16 App Router, NextAuth 4 Credentials provider, Prisma 6 with MySQL, bcryptjs, TypeScript, Vitest.

## Global Constraints

- `ADMIN` authenticates only by username; its stored email must not authenticate it.
- `USER` and `ORG_ADMIN` authenticate only by email.
- The existing administrator receives username `admin`; its password remains unchanged.
- Authentication errors stay generic and must not disclose account existence.
- Successful `ADMIN` login redirects to `/admin`; `ORG_ADMIN` continues redirecting to `/`.
- Callback navigation accepts only application paths beginning with one `/`, never `//`, and never `/login`.
- Do not run `git add`, `git commit`, or otherwise modify Git history; the user will commit changes.

## File Map

- Create `src/lib/auth/authorize-credentials.ts`: role-aware credential lookup and bcrypt verification boundary.
- Create `src/lib/auth/authorize-credentials.test.ts`: credential behavior tests using injected lookup functions.
- Create `src/lib/auth/login-destination.ts`: pure role-aware redirect sanitizer.
- Create `src/lib/auth/login-destination.test.ts`: redirect and unsafe callback tests.
- Modify `src/auth.ts`: expose `identifier` to NextAuth and connect Prisma/bcrypt dependencies to the credential helper.
- Modify `src/app/(auth)/login/page.tsx`: submit one text identifier and use centralized destination logic.
- Modify `prisma/schema.prisma`: add optional unique `username` to `User`.
- Create `prisma/migrations/20260803000000_add_admin_username/migration.sql`: add, backfill, and uniquely index username.
- Modify `package.json` and `package-lock.json`: add Vitest and a focused test command.

---

### Task 1: Testable role-aware credential authorization

**Files:**
- Create: `src/lib/auth/authorize-credentials.ts`
- Create: `src/lib/auth/authorize-credentials.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `{ identifier?: string; password?: string }` and injected `findAdminByUsername`, `findNonAdminByEmail`, and `comparePassword` functions.
- Produces: `authorizeCredentials(credentials, dependencies): Promise<AuthorizedUser | null>`.

- [ ] **Step 1: Install and configure the test runner**

Run:

```bash
npm install --save-dev vitest
```

Add this script to `package.json`:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write failing authorization tests**

Create `src/lib/auth/authorize-credentials.test.ts` with table-driven fixtures that assert:

```ts
import { describe, expect, it, vi } from "vitest";
import { authorizeCredentials, type CredentialUser } from "./authorize-credentials";

const admin: CredentialUser = {
  id: 1,
  email: "administrator@example.test",
  username: "admin",
  name: "Administrator",
  password: "admin-hash",
  role: "ADMIN",
  studentId: null,
  organizationId: null,
};

const learner: CredentialUser = {
  id: 2,
  email: "learner@example.test",
  username: null,
  name: "Learner",
  password: "learner-hash",
  role: "USER",
  studentId: "S001",
  organizationId: null,
};

const orgAdmin: CredentialUser = {
  id: 3,
  email: "org@example.test",
  username: null,
  name: "Organization Administrator",
  password: "org-hash",
  role: "ORG_ADMIN",
  studentId: null,
  organizationId: 10,
};

function dependencies(users: CredentialUser[]) {
  return {
    findAdminByUsername: vi.fn(async (username: string) =>
      users.find((user) => user.role === "ADMIN" && user.username === username) ?? null,
    ),
    findNonAdminByEmail: vi.fn(async (email: string) =>
      users.find(
        (user) => user.role !== "ADMIN" && user.email === email,
      ) ?? null,
    ),
    comparePassword: vi.fn(async (plain: string, hash: string) =>
      plain === hash.replace("-hash", "-password"),
    ),
  };
}

describe("authorizeCredentials", () => {
  it("authenticates ADMIN with a trimmed username", async () => {
    const result = await authorizeCredentials(
      { identifier: "  admin  ", password: "admin-password" },
      dependencies([admin]),
    );
    expect(result).toMatchObject({ id: "1", role: "ADMIN", email: admin.email });
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("username");
  });

  it("does not authenticate ADMIN by email", async () => {
    await expect(
      authorizeCredentials(
        { identifier: admin.email, password: "admin-password" },
        dependencies([admin]),
      ),
    ).resolves.toBeNull();
  });

  it.each([learner, orgAdmin])("authenticates $role by email", async (user) => {
    await expect(
      authorizeCredentials(
        { identifier: user.email, password: `${user.role === "USER" ? "learner" : "org"}-password` },
        dependencies([user]),
      ),
    ).resolves.toMatchObject({ id: String(user.id), role: user.role });
  });

  it("returns null for an unknown identifier, wrong password, or missing input", async () => {
    const deps = dependencies([admin]);
    await expect(authorizeCredentials({ identifier: "missing", password: "x" }, deps)).resolves.toBeNull();
    await expect(authorizeCredentials({ identifier: "admin", password: "wrong" }, deps)).resolves.toBeNull();
    await expect(authorizeCredentials({}, deps)).resolves.toBeNull();
  });
});
```

- [ ] **Step 3: Run the test and verify the red state**

Run:

```bash
npm test -- src/lib/auth/authorize-credentials.test.ts
```

Expected: FAIL because `authorize-credentials.ts` does not exist.

- [ ] **Step 4: Implement the minimal credential helper**

Create `src/lib/auth/authorize-credentials.ts`:

```ts
export type UserRole = "USER" | "ADMIN" | "ORG_ADMIN";

export interface CredentialUser {
  id: number;
  email: string;
  username: string | null;
  name: string | null;
  password: string;
  role: UserRole;
  studentId: string | null;
  organizationId: number | null;
}

export interface CredentialDependencies {
  findAdminByUsername(username: string): Promise<CredentialUser | null>;
  findNonAdminByEmail(email: string): Promise<CredentialUser | null>;
  comparePassword(plainPassword: string, passwordHash: string): Promise<boolean>;
}

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  studentId: string | null;
  organizationId: number | null;
}

export async function authorizeCredentials(
  credentials: { identifier?: string; password?: string },
  dependencies: CredentialDependencies,
): Promise<AuthorizedUser | null> {
  const identifier = credentials.identifier?.trim();
  const password = credentials.password;
  if (!identifier || !password) return null;

  const user =
    (await dependencies.findAdminByUsername(identifier)) ??
    (await dependencies.findNonAdminByEmail(identifier));
  if (!user) return null;

  const matches = await dependencies.comparePassword(password, user.password);
  if (!matches) return null;

  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    studentId: user.studentId,
    organizationId: user.organizationId,
  };
}
```

- [ ] **Step 5: Run the focused test and verify green**

Run:

```bash
npm test -- src/lib/auth/authorize-credentials.test.ts
```

Expected: all authorization tests PASS.

- [ ] **Step 6: Review checkpoint**

Run `git diff --check` for whitespace only. Do not stage or commit; leave the changes for the user.

---

### Task 2: Username schema and deterministic backfill migration

**Files:**
- Modify: `prisma/schema.prisma:15-35`
- Create: `prisma/migrations/20260803000000_add_admin_username/migration.sql`

**Interfaces:**
- Produces: nullable unique `User.username`, available to Prisma as `string | null`.
- Consumes: the existing single row where `role = 'ADMIN'`.

- [ ] **Step 1: Add the Prisma field**

Add this immediately after `email` in `User`:

```prisma
username       String?                @unique
```

- [ ] **Step 2: Add the migration SQL**

Create `prisma/migrations/20260803000000_add_admin_username/migration.sql`:

```sql
ALTER TABLE `User` ADD COLUMN `username` VARCHAR(191) NULL;

UPDATE `User`
SET `username` = 'admin'
WHERE `role` = 'ADMIN';

CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
```

- [ ] **Step 3: Validate and regenerate Prisma Client**

Run:

```bash
npx prisma validate
npx prisma generate
```

Expected: schema validation succeeds and the generated client exposes `username`.

- [ ] **Step 4: Apply the migration to the configured local database**

Run:

```bash
npx prisma migrate deploy
```

Expected: migration `20260803000000_add_admin_username` applies successfully.

- [ ] **Step 5: Verify only the administrator was backfilled**

Run this read-only Prisma query, which does not select names, emails, or passwords:

```bash
node -e 'const {PrismaClient}=require("@prisma/client"); const prisma=new PrismaClient(); prisma.user.findMany({select:{role:true,username:true},orderBy:{id:"asc"}}).then(rows=>console.log(JSON.stringify(rows,null,2))).finally(()=>prisma.$disconnect())'
```

Expected: the one `ADMIN` record has `"username": "admin"`; all `USER` and `ORG_ADMIN` records have `"username": null`.

- [ ] **Step 6: Review checkpoint**

Run `git diff --check`. Do not stage or commit.

---

### Task 3: Connect NextAuth to identifier-based authorization

**Files:**
- Modify: `src/auth.ts:1-73`

**Interfaces:**
- Consumes: `authorizeCredentials()` from Task 1 and `User.username` from Task 2.
- Produces: Credentials provider accepting `{ identifier, password }` while preserving the existing JWT/session shape.

- [ ] **Step 1: Change the provider contract and delegate authorization**

Import `authorizeCredentials`, then replace the provider credentials and `authorize` body with:

```ts
credentials: {
  identifier: { label: "อีเมลหรือ Username", type: "text" },
  password: { label: "Password", type: "password" },
},
async authorize(credentials) {
  return authorizeCredentials(credentials ?? {}, {
    findAdminByUsername: (username) =>
      prisma.user.findFirst({
        where: { username, role: "ADMIN" },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          password: true,
          role: true,
          studentId: true,
          organizationId: true,
        },
      }),
    findNonAdminByEmail: (email) =>
      prisma.user.findFirst({
        where: { email, role: { in: ["USER", "ORG_ADMIN"] } },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          password: true,
          role: true,
          studentId: true,
          organizationId: true,
        },
      }),
    comparePassword: bcrypt.compare,
  });
}
```

Remove the old email-only lookup and password-stripping code from `src/auth.ts`.

- [ ] **Step 2: Run focused and static checks**

Run:

```bash
npm test -- src/lib/auth/authorize-credentials.test.ts
npm run typecheck
npm run lint -- src/auth.ts src/lib/auth/authorize-credentials.ts src/lib/auth/authorize-credentials.test.ts
```

Expected: tests, TypeScript, and ESLint all PASS.

- [ ] **Step 3: Review checkpoint**

Run `git diff --check`. Do not stage or commit.

---

### Task 4: Safe role-aware login destinations and form update

**Files:**
- Create: `src/lib/auth/login-destination.ts`
- Create: `src/lib/auth/login-destination.test.ts`
- Modify: `src/app/(auth)/login/page.tsx:10-110`

**Interfaces:**
- Produces: `getLoginDestination(role: string | undefined, callbackUrl: string): string`.
- Consumes: the role returned by `useSession()` or `/api/auth/session`.

- [ ] **Step 1: Write failing redirect tests**

Create `src/lib/auth/login-destination.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getLoginDestination } from "./login-destination";

describe("getLoginDestination", () => {
  it("sends ADMIN to /admin", () => {
    expect(getLoginDestination("ADMIN", "/courses")).toBe("/admin");
  });

  it("keeps ORG_ADMIN on the current root destination", () => {
    expect(getLoginDestination("ORG_ADMIN", "/courses")).toBe("/");
  });

  it("lets USER follow a safe application path", () => {
    expect(getLoginDestination("USER", "/courses/1")).toBe("/courses/1");
  });

  it.each(["https://evil.example", "//evil.example", "/login", "/login?next=/admin", "courses"])(
    "rejects unsafe callback %s",
    (callbackUrl) => {
      expect(getLoginDestination("USER", callbackUrl)).toBe("/");
    },
  );
});
```

- [ ] **Step 2: Run the redirect test and verify red**

Run:

```bash
npm test -- src/lib/auth/login-destination.test.ts
```

Expected: FAIL because `login-destination.ts` does not exist.

- [ ] **Step 3: Implement the destination helper**

Create `src/lib/auth/login-destination.ts`:

```ts
export function getLoginDestination(
  role: string | undefined,
  callbackUrl: string,
): string {
  if (role === "ADMIN") return "/admin";
  if (role === "ORG_ADMIN") return "/";

  const isSafePath =
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    callbackUrl !== "/login" &&
    !callbackUrl.startsWith("/login?");

  return isSafePath ? callbackUrl : "/";
}
```

- [ ] **Step 4: Run the redirect test and verify green**

Run:

```bash
npm test -- src/lib/auth/login-destination.test.ts
```

Expected: all redirect tests PASS.

- [ ] **Step 5: Update the login form**

In `src/app/(auth)/login/page.tsx`:

- Rename state `email` to `identifier`.
- Import `getLoginDestination`.
- Change the input to `id="identifier"`, `name="identifier"`, `type="text"`, and placeholder `อีเมลหรือ Username`.
- Submit `{ identifier, password, redirect: false }` to `signIn`.
- In both the session effect and successful submit branch, navigate to `getLoginDestination(role, callbackUrl)`.
- Keep the error message generic, changing it to `ชื่อผู้ใช้ อีเมล หรือรหัสผ่านไม่ถูกต้อง`.
- Use `window.location.assign(destination)` after successful submit so the new session is reflected on the destination page.

The effect body becomes:

```ts
useEffect(() => {
  if (session?.user) {
    router.replace(getLoginDestination(session.user.role, callbackUrl));
  }
}, [session, router, callbackUrl]);
```

The successful submit branch becomes:

```ts
const response = await fetch("/api/auth/session", { credentials: "include" });
const newSession = await response.json();
const destination = getLoginDestination(newSession?.user?.role, callbackUrl);
window.location.assign(destination);
```

- [ ] **Step 6: Run focused and static checks**

Run:

```bash
npm test
npm run typecheck
npm run lint -- 'src/app/(auth)/login/page.tsx' src/lib/auth/login-destination.ts src/lib/auth/login-destination.test.ts
```

Expected: all tests and checks PASS.

- [ ] **Step 7: Review checkpoint**

Run `git diff --check`. Do not stage or commit.

---

### Task 5: End-to-end verification and handoff

**Files:**
- Verify all files from Tasks 1-4; no additional source file is expected.

**Interfaces:**
- Consumes: migrated local database, NextAuth Credentials endpoint, and `/login` UI.
- Produces: evidence that each role uses only its allowed identifier and that admin reaches `/admin`.

- [ ] **Step 1: Run the full non-destructive verification suite**

Run:

```bash
npm test
npx prisma validate
npm run typecheck
npm run lint
npm run build
git diff --check
```

Expected: every command exits with status 0.

- [ ] **Step 2: Verify the administrator through the running app**

Use the existing administrator password with identifier `admin`. Expected: authentication succeeds and the browser lands on `/admin`.

- [ ] **Step 3: Verify identifier separation**

Attempt the same administrator password with the administrator's stored email. Expected: generic authentication failure. Then verify one `USER` and one `ORG_ADMIN` can still authenticate with their existing emails.

- [ ] **Step 4: Inspect the final working tree**

Run:

```bash
git status --short
git diff --stat
```

Expected: only the spec, plan, test infrastructure, migration, and login/auth files listed in this plan are changed. Do not stage or commit them.
