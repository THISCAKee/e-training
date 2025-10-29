// src/components/admin/CourseList.tsx (ฉบับสมบูรณ์)
"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";

type Course = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
};

const emptyCourse = {
  id: 0,
  title: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  createdAt: "",
};

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentCourse, setCurrentCourse] =
    useState<Partial<Course>>(emptyCourse);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add New Course
        </button>
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
          </div>
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

      {/* Table to display courses */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b text-left">Title</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b text-center">{course.id}</td>
                <td className="py-2 px-4 border-b">{course.title}</td>
                <td className="py-2 px-4 border-b text-center">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="bg-green-500 text-white px-3 py-1 mx-2 rounded hover:bg-green-600 text-xs font-semibold"
                  >
                    เพิ่มบทเรียน
                  </Link>
                  <button
                    onClick={() => handleEdit(course)}
                    className="text-blue-500 hover:text-blue-700 mr-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
