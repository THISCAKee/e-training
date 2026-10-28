# Admin Dashboard Data

**Status:** Approved  
**Last updated:** October 28, 2026  
**Owner:** Not assigned  
**Related files:** `CONTEXT.md`, `prisma/schema.prisma`, `src/app/api/admin/stats/route.ts`, `src/components/admin/AdminStats.tsx`

## Abstract

The current admin overview reports learner, course, lesson, and enrollment totals, plus enrollment category, learner faculty, popular course, and certificate charts. The database also stores organizations, quizzes, questions, answer options, lesson progress, quiz attempts, podcasts, and hero slides. This design expands the overview with scoped counts, recent course/enrollment lists, and course-level enrollment counts grouped by category. At the user's direction, hero slide data is excluded from the overview; Podcast summaries remain in scope for `ADMIN`. Existing management tabs remain the place to browse and edit full records.

The implementation extends `GET /api/admin/stats` and the existing `AdminStats` client component. Reads remain request-time and read-only. `ADMIN` requests cover the system; `ORG_ADMIN` requests are filtered to the administrator's organization. Recent course and enrollment lists are capped at five; the course ranking can expand to all scoped courses. The category chart can expand to show every course and its enrollment count inside each category. `ADMIN` also sees YouTube view counts for each Podcast video. Recent quiz-attempt rows and HeroSlide summaries are excluded. The response does not expose credentials, learner identifiers, answer text, or full database rows.

## Goals and Non-Goals

| Goals | Non-goals |
|---|---|
| Show counts for the in-scope business data areas, including learning activity and managed content. | Show HeroSlide data in the dashboard overview. |
| Preserve the `ADMIN` and `ORG_ADMIN` access boundary for every count, chart, and recent item. | Put every database row or sensitive field on one dashboard page. |
| Add compact, bounded recent activity lists and per-course enrollment counts in the category chart. | Add exports, date-range filters, live polling, or a new database schema. |
| Keep the existing admin dashboard layout and navigation model. | Change learner enrollment, progress, quiz, or certificate behavior. |

## Background and Problem Statement

`src/components/admin/AdminStats.tsx` currently requests `GET /api/admin/stats` once when the overview mounts. The response includes learner, course, lesson, and enrollment counts, category enrollment totals, faculty totals, certificate status, and a course enrollment ranking. It omits direct counts for several models in `prisma/schema.prisma`, so the overview does not summarize the full platform.

The existing endpoint already authorizes `ADMIN` and `ORG_ADMIN` and scopes organization administrators' learners, courses, lessons, and enrollments. The expanded response must apply the same organization boundary to related lesson progress and quiz attempts. The endpoint currently loads every enrollment and learner to build some chart data. The expanded design should use count or aggregate queries for totals and bound each recent list to five rows, so the dashboard does not return all records just to display a summary.

## Architecture

The browser keeps the current admin shell and `AdminStats` component. On mount, the component requests the existing stats route. The route authenticates the session, derives a system or organization scope from the session, runs independent Prisma reads against MySQL, and returns only display-ready counts, existing distributions, and bounded recent activity. The component renders the result using the existing card and chart styles. Full browsing and editing continue through the current administration tabs.

### Core components

| Component | Responsibility | Primary storage | Failure behavior |
|---|---|---|---|
| Admin overview in `AdminStats` | Request and render counts, charts, and recent activity. | None | Keep the existing loading and error states; do not replace missing values with invented zeros. |
| `GET /api/admin/stats` | Authenticate, calculate scoped metrics, and return a compact JSON response. | None | Return 403 for an unauthorized role, 400 when an organization administrator has no organization, and 500 for a database failure. |
| Session and scope checks | Permit `ADMIN` and `ORG_ADMIN`; derive organization scope from the signed-in session. | Auth session | Reject unauthorized access before querying data. |
| Prisma data reads | Count and summarize records using model and relation filters. | MySQL | Let the route return its existing 500 response when a required query fails. |
| Existing management tabs | Provide full record browsing and editing for supported domains. | Existing APIs and MySQL | Keep existing tab behavior independent of summary loading. |

## Request Lifecycle

a. An administrator opens `/admin` and selects the Overview tab. `AdminStats` requests `/api/admin/stats`.

b. The route calls `auth()` and permits only `ADMIN` or `ORG_ADMIN`. The role and organization ID come from the session, not query parameters.

c. The route builds the data scope. `ADMIN` reads system-wide records. `ORG_ADMIN` reads learners in the assigned organization and courses owned by that organization; related lessons, enrollments, lesson progress, and quiz attempts are filtered through their course relationship.

d. The route runs independent count and aggregate queries for users, content, enrollments, progress, and quiz attempts. It retrieves all scoped course summaries with enrollment counts and categories, at most five recent courses and enrollments, and all scoped course summaries for the expandable ranking. Podcast and organization summaries are returned only for `ADMIN`; Podcast view counts come from YouTube. Recent quiz-attempt rows and HeroSlide data are not returned.

e. The request is read-only. It does not write dashboard state or change any source record.

f. The route returns the summary as JSON. It responds with 403 for unauthorized roles, 400 for an organization administrator without an organization ID, and 500 if a required database read fails.

g. `AdminStats` renders the response. It retains the current loading and error presentations, displays empty states for empty lists, and leaves full record management in the existing tabs.

## API and Data Contracts

The route remains `GET /api/admin/stats`. The JSON response contains a request timestamp, the applied scope, counts, existing analytics, and bounded recent lists. Dates are ISO strings. The route returns only fields used by the overview.

| Field | Type | Required | Description |
|---|---|---:|---|
| `generatedAt` | ISO timestamp | Yes | Time the response was assembled. |
| `scope` | `system` or `organization` with organization ID | Yes | Scope derived from the authenticated session. |
| `counts.learners` | Integer | Yes | Users with role `USER` inside the request scope. |
| `counts.organizations` | Integer | `ADMIN` only | Total organizations in the system. |
| `counts.courses`, `categories`, `lessons` | Integers | Yes | Content counts inside the request scope. |
| `counts.quizzes`, `questions`, `options` | Integers | Yes | Assessment structure counts inside the request scope. The response includes counts only, not question or answer text. |
| `counts.enrollments` | Total, in-progress, completed | Yes | Enrollment counts grouped by the existing enrollment status. |
| `counts.lessonProgress` | Total, completed | Yes | Progress record counts for lessons inside the request scope. |
| `counts.quizAttempts` | Total, passed | Yes | Attempt counts for quizzes inside the request scope. |
| `counts.podcasts` | Total and published counts | `ADMIN` only | Global Podcast counts. HeroSlide counts are excluded from this contract. |
| `analytics.categoryStats` | Category summaries with course arrays | Yes | Each scoped course appears in its category with its enrollment count, including courses with zero enrollments; uncategorized courses appear under “ไม่มีหมวดหมู่”. |
| `analytics` | Arrays and course summaries | Yes | Existing faculty and certificate analytics; all scoped courses for the ranking toggle; `ADMIN` also receives per-video Podcast view counts. |
| `recent` | Bounded arrays | Yes | At most five recent courses and enrollments. Quiz-attempt records and HeroSlide records are excluded. Include titles, status, and dates only. |

### Contract guarantees

a. The route is read-only and MySQL remains the source of truth.

b. `scope` is calculated from the authenticated session. The client cannot request a different organization by changing a URL parameter.

c. Recent course and enrollment lists are ordered newest first and capped at five entries. The course ranking initially shows five rows and can expand to every scoped course. Category totals are grouped from the same per-course enrollment counts shown in the category details.

d. Counts are best-effort request-time summaries. Concurrent writes may cause small differences between related counts because the dashboard does not promise a transactional point-in-time snapshot.

The route response is the only data contract for this page. No schema migration or external interface is introduced.

## Consistency, Idempotency, and Replay

Repeated GET requests do not change system state. The endpoint is not cached by this design, so a reload requests current database values. Independent reads can observe writes that occur while the request is running; the dashboard does not claim transaction-level snapshot consistency. This is acceptable for an operational overview, where the source records remain available in their management pages.

| Scenario | Expected behavior | Reasoning |
|---|---|---|
| The administrator reloads the page | Return a fresh summary for the same session scope. | The endpoint is read-only and request-time. |
| A record is created while counts are loading | Related totals may reflect slightly different instants. | The overview does not require a transactional snapshot. |
| A database read fails | Return 500 and show the dashboard error state. | Do not present partial or fabricated counts as complete. |
| An organization administrator changes a client parameter | Continue using the organization ID from the session. | Client input cannot expand the data boundary. |

## Security and Privacy Considerations

a. Allow only `ADMIN` and `ORG_ADMIN`. Keep server-side authorization in the route even though the admin page also checks the session.

b. Apply the organization filter to every direct and relation-based query for `ORG_ADMIN`, including lesson progress and quiz attempts.

c. Return counts and display fields only. Do not include password hashes, email addresses, student IDs, question text, answer options, or correctness flags in the overview response.

d. Return organizations and Podcasts only to `ADMIN`. Exclude HeroSlide data from the overview for every role. Do not add client-controlled organization filters.

e. Preserve current database retention and deletion behavior. The dashboard creates no stored copy, cache, or export.

## Operational Readiness

| Signal | SLO or alert | Owner | Launch gate |
|---|---|---|---|
| Summary completeness | No numeric SLO is defined in the repository. Compare each displayed metric with its model and scope. | Not assigned | Required |
| Route availability | Existing route logs `GET_STATS_ERROR`; no alert threshold is defined. | Not assigned | Recommended |
| Role and organization scope | Unauthorized roles receive 403; organization data is filtered by session organization ID. | Not assigned | Required |
| Query duration | No latency target is defined. Measure the expanded route against representative data before release. | Not assigned | Recommended |
| Empty and error states | Empty lists show empty states; failed requests show the existing error state. | Not assigned | Required |
| Regression of admin tabs | Existing management tabs remain available and keep their current behavior. | Not assigned | Required |

Rollout constraint: the change requires no database migration. It can be released and reverted with the application code. The production latency target and operational owner remain to be assigned.

## Alternatives Considered

| Alternative | Why it was considered | Why it was not selected |
|---|---|---|
| Extend the existing stats route and `AdminStats` component | The page already uses this request and rendering path. It preserves the existing shell, chart styles, and role filters. | Recommended. The endpoint must be kept bounded and scoped as its response grows. |
| Create a separate dashboard endpoint and summary service | It separates dashboard data from the existing stats route and can support later panels. | It adds another route and contract for one overview without a demonstrated need. |
| Render every database row in the overview | It would expose all records directly from one page. | It duplicates management tabs, grows response size with the database, and increases exposure of personal or assessment data. |
| Move all data reads into the admin page server component | It can avoid a client request for the first render. | The admin shell is currently client-rendered with local tab state; changing that boundary expands the work beyond the requested summary. |

## Open Questions

a. Assign an operational owner and a latency target after measuring the route against representative data.

b. Confirm the preferred owner and reviewer names for the design record; none are specified in the repository context.

## Decision and Next Steps

The approved decision is to extend `GET /api/admin/stats` and `AdminStats` with scoped counts, course enrollment counts within each category, an expandable ranking for all scoped courses, and per-video Podcast view statistics for `ADMIN`. Recent lists cover courses and enrollments only. Recent quiz-attempt rows and HeroSlide data are excluded; existing admin navigation and management tabs remain in place.

| Milestone | Deliverable | Exit criteria |
|---|---|---|
| M1 | Approve the scope and response contract. | Confirm the summary view, role scope, recent lists, and `ADMIN`-only panels. |
| M2 | Implement the scoped stats response and dashboard panels, then release. | Each category shows enrollment counts for its courses; the course ranking expands to all scoped courses; Podcast view counts appear per video for `ADMIN`; recent quiz-attempt rows and HeroSlide data are absent; no schema migration is needed. |
