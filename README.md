# MSU AI-Training

Next.js application for course enrollment, lesson progress, quizzes, certificates, and admin course management.

## Requirements

- Node.js 20+
- MySQL

## Setup

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm run dev
```

Open http://localhost:3000.

## Environment

Required variables:

- `DATABASE_URL`: MySQL connection string
- `AUTH_SECRET`: NextAuth secret
- `NEXTAUTH_URL`: Public app URL, for example `http://localhost:3000`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth client for the "เข้าสู่ระบบด้วยบัญชี @msu.ac.th" button

### MSU Google sign-in

Only verified Google Workspace accounts on `msu.ac.th` can sign in. The first sign-in creates a `USER` with no password. An existing account with the same email, or a student account with the same student ID, signs in as that account. `ADMIN` accounts are rejected and keep signing in by username.

A mailbox whose name is an 11-digit number is treated as a student, and that number becomes the student ID. Any other mailbox is staff (shown as "บุคลากร"). The faculty or unit comes from the account's department in the MSU Google Workspace directory. Enable the **People API** in the same Google Cloud project, otherwise faculty stays empty. Sign-in only fills a student ID or faculty that is empty; it never overwrites one.

Create an OAuth client of type "Web application" in Google Cloud Console and add the authorized redirect URI `<NEXTAUTH_URL>/callback/google`. With `NEXTAUTH_URL=http://localhost:3000` that is `http://localhost:3000/api/auth/callback/google`.

When the app is served under a sub-path, `NEXTAUTH_URL` must end in the auth route, for example `https://smartlib.msu.ac.th/etraining/api/auth`. NextAuth builds the redirect URI from it, so `https://smartlib.msu.ac.th/etraining` alone produces a callback URL that does not exist.

`NEXT_PUBLIC_BASE_URL` is no longer needed by server-rendered public pages. Keep it only if a browser-side feature explicitly needs an absolute public URL.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
npx prisma validate
```

## Notes

- Public course pages read from Prisma directly on the server.
- Admin course APIs require `ADMIN` or `ORG_ADMIN`; organization admins are scoped to their own organization.
