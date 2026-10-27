# Podcast Admin Implementation Plan

**Goal:** Allow ADMIN to maintain YouTube podcast episodes through the existing workspace.
**Architecture:** Prisma Podcast table, authenticated CRUD route handlers, client form/list and server-rendered public catalog.
**Tech Stack:** Next.js 16 / React 19 / Prisma 6 / MySQL.
**Spec:** docs/superpowers/specs/2026-10-27-podcast-admin-design.md

## Constraints
Only ADMIN can manage podcasts. Never expose drafts publicly. No dependencies or changes to course data.

## Review focus
Reject malformed IDs and hostile video URLs, preserve drafts, report failed writes, show empty/loading/error states, reload published catalog after writes.

- [x] Test YouTube URL normalization, validation and role restrictions.
- [x] Add model/migration, validation and authenticated CRUD endpoints.
- [x] Add admin navigation and create/edit/delete form with publication and order fields.
- [x] Connect public route to published database records.
- [x] Generate client, check migration state and apply additive migration if possible; run tests/typecheck/lint.

Validation: 105 tests passed, TypeScript and scoped ESLint passed. Applied only the new Podcast migration. Authenticated HTTP smoke check passed create/list/edit/delete, persistence and public draft exclusion; temporary data removed. Verified Podcasts navigation and add form in the existing authenticated Chrome tab. Restarted dev server after generating Prisma Client to replace the cached pre-migration instance.
