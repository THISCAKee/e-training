# Admin Dashboard Data Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the admin overview with role-scoped counts, per-course enrollment counts grouped by category, an all-course ranking toggle, Podcast view counts per video, and concise recent activity.

**Architecture:** Extend `GET /api/admin/stats` with a shared TypeScript response contract, session-derived Prisma filters, count aggregates, per-course enrollment counts grouped by category, all scoped course ranking rows, and recent course/enrollment lists capped at five. Use the existing YouTube stats helper for per-video Podcast views shown to `ADMIN`. Update `AdminStats` while retaining the current layout, tabs, loading state, and error state.

**Tech Stack:** Next.js 16.4.3 App Router, React 19.3.0, Prisma 6.19.3, MySQL, TypeScript 5.9.3, Tailwind CSS 4.3.3.

**Spec:** [2026-10-28-admin-dashboard-data-coverage-design.md](../specs/2026-10-28-admin-dashboard-data-coverage-design.md)

## Global Constraints

- `ADMIN` requests cover the system; `ORG_ADMIN` requests are filtered to the administrator's organization.
- Summary counts are request-time; each recent activity list is capped at five records.
- The course ranking returns every scoped course summary; it shows the top five by default and expands on demand.
- Category summaries include every scoped course and its enrollment count; category details expand on demand.
- Podcast view counts come from YouTube; records without returned statistics display an unavailable value.
- Do not return or render a recent quiz-attempt list.
- It does not expose credentials, learner identifiers, answer text, or full database rows in the overview.
- The route is read-only and MySQL remains the source of truth.
- The design introduces no schema migration.
- The route remains `GET /api/admin/stats`.
- Keep the current admin dashboard layout, navigation model, charts, and management tabs.
- Do not add or run tests or verification commands during implementation unless the user requests them.

## Review Focus

- An unauthenticated or unsupported role must still receive 403; an `ORG_ADMIN` session without an organization ID must still receive 400.
- Every relation-based query for an `ORG_ADMIN`, including lesson progress and quiz attempts, must use the session organization through the related course.
- Empty categories and recent lists must render explicit empty states; failed required reads must use the existing error state and must not show partial counts as complete.
- Recent course and enrollment lists must be newest-first and return at most five records, including when more records share the same timestamp.
- The ranking list contains every scoped course; the default display is five courses, with a button to expand and collapse the full graph.
- `ADMIN` receives Podcast view counts for each video; `ORG_ADMIN` does not receive Podcast statistics.
- No response or rendered list may include learner identifiers, credentials, question text, answer options, or correctness flags.

---

### Task 1: Define the dashboard contract and extend the stats route

**Files:**
- Create: `src/lib/stats/admin-dashboard.ts`
- Modify: `src/app/api/admin/stats/route.ts`

**Interfaces:**
- Produces: `AdminStatsResponse`, imported as a type by the route and `AdminStats`.
- `AdminStatsResponse` contains `generatedAt`, session-derived `scope`, `counts`, existing `analytics`, and `recent` arrays.
- `counts` contains learners, organizations (ADMIN only), courses, categories, lessons, quizzes, questions, options, enrollment totals by status, lesson progress totals/completed, quiz attempt totals/passed, and Podcast totals plus published totals (ADMIN only). HeroSlide data is excluded from the dashboard response.
- `analytics.categoryStats` groups every scoped course under its category with the course's enrollment count; `courseEnrollmentStats` contains all scoped courses; Podcast view stats are optional and ADMIN-only.
- `recent` contains courses and enrollments for both roles, with at most five entries each. Do not include quiz attempts, Podcast recency rows, learner identifiers, or HeroSlide records.

- [x] **Step 1: Define shared response types in `src/lib/stats/admin-dashboard.ts`**

  Use ISO timestamp strings for all dates. Model system and organization scope explicitly. Keep ADMIN-only counts and lists optional so the response does not expose restricted panels to `ORG_ADMIN`.

- [x] **Step 2: Build all direct and relation-based Prisma filters from the authenticated session in `src/app/api/admin/stats/route.ts`**

  Preserve the existing 403 and 400 responses. For `ORG_ADMIN`, scope learners by `organizationId`, owned courses by `organizationId`, and lessons, quizzes, questions, options, enrollments, lesson progress, and quiz attempts through their course relationship. Count categories referenced by scoped courses. Do not accept a client-provided organization ID.

- [x] **Step 3: Return counts and existing analytics from request-time reads**

  Count all in-scope business models represented by the design; HeroSlide is excluded at the user's direction. Preserve faculty, certificate, and course-enrollment analytics. Build category totals and per-course enrollment details from the scoped course query. Keep required reads in the same failure boundary so any required database failure returns 500 instead of partial data.

- [x] **Step 4: Add recent queries and per-video Podcast view statistics**

  Return at most five course titles/dates and enrollment course titles/status/dates. Do not query or return recent quiz attempts. Fetch YouTube view counts for each Podcast video for `ADMIN`; missing counts remain unavailable. Include all scoped courses in the ranking analytics. Do not query or return HeroSlide records. Add stable ID tie-breakers to sorted results and omit learner fields. Set `generatedAt` when assembling the response.

**Acceptance conditions:**
- ADMIN sees system-wide counts, category enrollment counts for every course, all courses in the ranking, and per-video Podcast view stats; recent quiz attempts and HeroSlide data are absent.
- ORG_ADMIN sees counts and recent course/enrollment records limited to the session organization; organization and Podcast summaries are absent. HeroSlide data is absent for every role.
- Existing status codes and the current analytics fields remain available.

### Task 2: Render the expanded overview in `AdminStats`

**Files:**
- Modify: `src/components/admin/AdminStats.tsx`
- No change: `src/app/(main)/admin/page.tsx` (it already renders `AdminStats` for the Overview tab).

**Interfaces:**
- Consumes: `AdminStatsResponse` from `src/lib/stats/admin-dashboard.ts`.
- Produces: an overview with applicable count cards, enrollment/progress/quiz summaries, category-level course enrollment details, an expandable all-course ranking, per-video Podcast view stats for ADMIN, and bounded course/enrollment recent lists.

- [x] **Step 1: Replace the duplicated local response shape with `AdminStatsResponse`**

  Keep existing loading and error states. Do not default failed or missing API data to zero.

- [x] **Step 2: Render summary cards for every count in the response**

  Keep the current card style and make the grid responsive. Render organization and Podcast cards only when the response includes the ADMIN-only values. Do not render a HeroSlide card. Include enrollment status, completed lesson progress, and passed quiz attempt totals.

- [x] **Step 3: Add compact recent panels for each returned list**

  Show at most five course/enrollment rows with titles, statuses, and localized dates. Do not render a recent quiz-attempt panel. Render an ADMIN-only Podcast views panel with one bar and view count per video; keep unavailable YouTube counts distinct from zero. Do not render a HeroSlide panel.

- [x] **Step 4: Extend the category chart and add an all-course ranking toggle**

  Keep the existing category totals, let each category expand to show enrollment counts for its courses, and allow the full category list to expand. Show five courses initially in the ranking and allow it to expand to all scoped courses. Retain the current management tabs for full record browsing and editing.

**Acceptance conditions:**
- The dashboard presents summary coverage for all in-scope business data areas without rendering raw tables; categories expose enrollment counts for every scoped course; the ranking expands to every scoped course; Podcast views are shown per video to ADMIN; recent quiz-attempt rows and HeroSlide data are absent.
- ADMIN-only panels are not rendered for ORG_ADMIN.
- Empty lists show empty states; the existing loading and error presentations continue to work.
- Existing charts and management navigation remain usable.

## Execution Note

The active session instruction prohibits adding or running tests or verification commands unless requested. This plan therefore contains no test or verification commands; its review focus records the behaviors to preserve while implementing the approved design.
