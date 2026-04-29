# MSU e-Training

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
