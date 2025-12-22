// src/components/admin/CourseList.tsx (ฉบับสมบูรณ์)
"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Search, X, User as UserIcon } from "lucide-react";

type Category = {
  id: number;
  name: string;
};

type Course = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  // videoUrl?: string | null;
  createdAt: string;
  _count: { lessons: number };
  categoryId: number | null;
  enrollments: {
    enrolledAt: string | number | Date;
    status: "IN_PROGRESS" | "COMPLETED";
    user: {
      id: number;
      name: string | null;
      email: string | null;
      // image: string | null;
    };
  }[];
};

const emptyCourse = {
  id: 0,
  title: "",
  description: "",
  imageUrl: "",
  // videoUrl: "",
  createdAt: "",
  categoryId: null,
};

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentCourse, setCurrentCourse] =
    useState<Partial<Course>>(emptyCourse);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // States for Pagination and Search
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"IN_PROGRESS" | "COMPLETED">(
    "IN_PROGRESS"
  );

  const fetchCourses = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/courses?page=${page}&pageSize=10&search=${searchTerm}`
      );
      const data = await response.json();
      setCourses(data.data);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    // ดึง Categories เมื่อ Component โหลด
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/admin/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses(currentPage, search);
  }, [currentPage, search]);
  const handleAddNew = () => {
    setCurrentCourse(emptyCourse);
    setIsFormVisible(true);
  };

  const handleEdit = (course: Course) => {
    setCurrentCourse(course);
    setIsFormVisible(true);
  };

  const handleDelete = async (courseId: number) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      fetchCourses(); // Refresh list
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // (เพิ่ม) เริ่มโหลด
    setFormError(null); // (เพิ่ม) เคลียร์ Error เก่า
    const isEditing = currentCourse.id;
    const url = isEditing
      ? `/api/admin/courses/${currentCourse.id}`
      : "/api/admin/courses";
    const method = isEditing ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentCourse),
    });

    setIsFormVisible(false);
    setCurrentCourse(emptyCourse);
    fetchCourses(); // Refresh list after save
  };

  if (loading) return <p>Loading courses...</p>;

  const openStudentList = (
    course: Course,
    tab: "IN_PROGRESS" | "COMPLETED"
  ) => {
    setSelectedCourse(course);
    setModalTab(tab);
    setShowModal(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Course Management</h2>
        <Link
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          href={""}
        >
          + Add New Course
        </Link>
      </div>

      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-gray-100 rounded-lg space-y-4"
        >
          <h3 className="text-xl font-semibold">
            {currentCourse.id ? "Edit Course" : "Add New Course"}
          </h3>
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={currentCourse.title}
              onChange={(e) =>
                setCurrentCourse({ ...currentCourse, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={currentCourse.description}
              onChange={(e) =>
                setCurrentCourse({
                  ...currentCourse,
                  description: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input
              type="text"
              value={currentCourse.imageUrl || ""}
              onChange={(e) =>
                setCurrentCourse({ ...currentCourse, imageUrl: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              value={currentCourse.categoryId || ""} // ถ้าเป็น null ให้เป็น string ว่าง
              onChange={(e) =>
                setCurrentCourse({
                  ...currentCourse,
                  // แปลงกลับเป็น number หรือ null
                  categoryId: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full p-2 border rounded"
              disabled={loadingCategories}
            >
              <option value="">-- No Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {loadingCategories && (
              <span className="text-xs">Loading categories...</span>
            )}
          </div>
          {/*<div>
            <label className="block text-sm font-medium">Video URL</label>
            <input
              type="url"
              value={currentCourse.videoUrl || ""}
              onChange={(e) =>
                setCurrentCourse({ ...currentCourse, videoUrl: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>*/}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsFormVisible(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by course title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 pl-10 border rounded-md"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Table to display courses */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Title</th>
              <th className="py-2 px-4 border-b text-center">Lessons</th>
              {/* --- vvv เพิ่ม Header --- */}
              <th className="py-2 px-4 border-b text-center">กำลังเรียน</th>
              <th className="py-2 px-4 border-b text-center text-green-600">
                สำเร็จ/สอบผ่าน
              </th>
              {/* --- ^^^ --------------- */}
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map((course) => {
                // --- vvv คำนวณจำนวนผู้เรียนในแต่ละรอบ vvv ---
                const studyingCount = course.enrollments.filter(
                  (e) => e.status === "IN_PROGRESS"
                ).length;
                const completedCount = course.enrollments.filter(
                  (e) => e.status === "COMPLETED"
                ).length;
                // --- ^^^ ----------------------------------

                return (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <div className="font-medium">{course.title}</div>
                      {/* (Optional) แสดงหมวดหมู่ถ้ามี */}
                      {/* <div className="text-xs text-gray-500">{course.category?.name}</div> */}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {course._count.lessons}
                    </td>

                    {/* ปุ่มแสดงจำนวนคนกำลังเรียน */}
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={() => openStudentList(course, "IN_PROGRESS")}
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition text-xs font-semibold px-3 py-1 rounded-full cursor-pointer"
                      >
                        {studyingCount} คน
                      </button>
                    </td>

                    {/* ปุ่มแสดงจำนวนคนเรียนจบ */}
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={() => openStudentList(course, "COMPLETED")}
                        className="bg-green-100 text-green-800 hover:bg-green-200 transition text-xs font-semibold px-3 py-1 rounded-full cursor-pointer"
                      >
                        {completedCount} คน
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b text-center space-x-2">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs font-semibold"
                      >
                        จัดการบทเรียน
                      </Link>
                      <button // เปลี่ยนจาก Link เป็น button เพื่อความถูกต้องตาม accessibility
                        onClick={() => handleEdit(course)}
                        className="text-blue-500 hover:text-blue-700 text-sm underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-500 hover:text-red-700 text-sm underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* --- ส่วน Modal แสดงรายชื่อ --- */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 truncate pr-4">
                {selectedCourse.title}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b text-sm">
              <button
                className={`flex-1 py-3 font-medium ${
                  modalTab === "IN_PROGRESS"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
                onClick={() => setModalTab("IN_PROGRESS")}
              >
                กำลังเรียน (
                {
                  selectedCourse.enrollments.filter(
                    (e) => e.status === "IN_PROGRESS"
                  ).length
                }
                )
              </button>
              <button
                className={`flex-1 py-3 font-medium ${
                  modalTab === "COMPLETED"
                    ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
                onClick={() => setModalTab("COMPLETED")}
              >
                สำเร็จ/สอบผ่าน (
                {
                  selectedCourse.enrollments.filter(
                    (e) => e.status === "COMPLETED"
                  ).length
                }
                )
              </button>
            </div>

            {/* List Content */}
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {selectedCourse.enrollments.filter((e) => e.status === modalTab)
                .length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  ไม่มีผู้เรียนในสถานะนี้
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {selectedCourse.enrollments
                    .filter((e) => e.status === modalTab)
                    .map((enroll, index) => (
                      <li
                        key={index}
                        className="flex items-center p-4 hover:bg-gray-50 transition"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3 shrink-0">
                          {/* แสดงรูปถ้ามี หรือแสดง icon คน */}
                          {/* {enroll.user.image ? (
                             <img src={enroll.user.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                           ) : (
                             <UserIcon size={20} />
                           )} */}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {enroll.user.name || "Unknown Name"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {enroll.user.email}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            เริ่มเมื่อ:{" "}
                            {new Date(enroll.enrolledAt).toLocaleDateString(
                              "th-TH"
                            )}
                          </p>
                        </div>
                        <div className="ml-2">
                          <Link
                            href={`/admin/users/${enroll.user.id}`}
                            className="text-xs border border-blue-200 text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            ดูข้อมูล
                          </Link>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Total {totalCount} courses
        </span>
        <div className="flex space-x-2">
          <Link
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            // disabled={currentPage === 1 || loading}
            className="px-4 py-2 text-sm bg-gray-200 rounded-md disabled:opacity-50"
            href={""}
          >
            Previous
          </Link>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            // disabled={currentPage === totalPages || loading}
            className="px-4 py-2 text-sm bg-gray-200 rounded-md disabled:opacity-50"
            href={""}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
