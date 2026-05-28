# MSU e-Training Context

A Next.js platform designed for course enrollment, tracking lesson progress, taking quizzes, earning certificates, and administrative course management scoped by organization.

## Language

### Users & Roles

**Learner**:
A registered user who enrolls in courses, views lessons, and completes quizzes.
_Avoid_: Student, Client, Customer

**Administrator**:
A user with unrestricted system-wide access to manage all courses, organizations, and users.
_Avoid_: Superadmin, Owner

**Organization Administrator**:
A user whose administrative capabilities (managing courses, viewing logs, etc.) are restricted to a specific **Organization** they are assigned to.
_Avoid_: Department Admin, Org Owner

### Learning & Content

**Course**:
A structured learning program composed of ordered **Lessons** and categorized under a **Category**.
_Avoid_: Training Program, Module

**Lesson**:
A single topic within a **Course** consisting of a video and optionally a **Quiz**.
_Avoid_: Unit, Chapter

**Category**:
A classification label used to group related **Courses** (e.g., Programming, Design).
_Avoid_: Tag, Group

**Organization**:
An academic department, faculty, or business unit that owns specific **Courses** and to which **Learner**s and **Organization Administrator**s can belong.
_Avoid_: Faculty, Department, Unit

**AI Literacy Skill**:
Specific capability tags (e.g., Data Research, Data Analysis, Academic Communication, English Proficiency, Data Privacy) that a **Course** can offer.
_Avoid_: Tag, Competency

### Assessments & Progress

**Course Enrollment**:
The relationship linking a **Learner** to a **Course**, tracking status as either in progress or completed.
_Avoid_: Registration, Sign-up

**Lesson Progress**:
A record tracking a **Learner**'s completion status and video viewing completion percentage for a specific **Lesson**.
_Avoid_: Viewing History

**Quiz**:
An assessment linked to a **Lesson** containing multiple multiple-choice **Questions**.
_Avoid_: Test, Exam

**Question**:
A single query within a **Quiz** that contains multiple **Options** with one correct answer.
_Avoid_: Problem

**Option**:
A possible answer to a **Question**, marked as correct or incorrect.
_Avoid_: Choice, Answer

**Quiz Attempt**:
A logged instance of a **Learner** submitting answers for a **Quiz**, which calculates their score and passing status.
_Avoid_: Quiz Result, Submission

---

## Flagged Ambiguities

- **User vs. Learner**: Inside the database schema, this is represented by `User`, but conceptually, any user with the role `USER` is a **Learner**.
- **Organization vs. Department**: The code comments mention `department` (สังกัด/คณะ) and the schema uses `Organization`. We canonicalize on **Organization** to represent any department or faculty.

---

## Example Dialogue

**Developer**: "Are **Learner**s automatically enrolled in all **Courses** owned by their **Organization**?"

**Domain Expert**: "No. A **Learner** must manually choose to initiate a **Course Enrollment**. However, **Organization Administrator**s can only manage **Courses** and view progress for **Learner**s belonging to their own **Organization**."

**Developer**: "When is a **Course Enrollment** marked as completed?"

**Domain Expert**: "When the **Learner** has completed all **Lessons** and passed all associated **Quizzes** in that **Course**."
