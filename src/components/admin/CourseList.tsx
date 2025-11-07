// src/components/admin/CourseList.tsx (ฉบับสมบูรณ์)
"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

type Course = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  // videoUrl?: string | null;
  createdAt: string;
  _count: { lessons: number };
};

const emptyCourse = {
  id: 0,
  title: "",
  description: "",
  imageUrl: "",
  // videoUrl: "",
  createdAt: "",
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

  const fetchCourses = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/courses?page=${page}&pageSize=10&search=${searchTerm}`,
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
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6">
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{course.title}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {course._count.lessons}
                  </td>
                  <td className="py-2 px-4 border-b text-center space-x-2">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs font-semibold"
                    >
                      แก้ไขบทเรียน
                    </Link>
                    <Link
                      onClick={() => handleEdit(course)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      href={""}
                    >
                      Edit
                    </Link>
                    <Link
                      onClick={() => handleDelete(course.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      href={""}
                    >
                      Delete
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
