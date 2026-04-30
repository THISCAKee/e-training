// src/components/admin/CourseList.tsx (ฉบับสมบูรณ์)
"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Search, X, User as UserIcon, Plus } from "lucide-react";

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
    };
  }[];
  skillDataResearch: boolean;
  skillDataAnalysis: boolean;
  skillAcademicCommunication: boolean;
  skillEnglishProficiency: boolean;
  skillDataPrivacy: boolean;
};

const emptyCourse = {
  id: 0,
  title: "",
  description: "",
  imageUrl: "",
  // videoUrl: "",
  createdAt: "",
  categoryId: null,
  skillDataResearch: false,
  skillDataAnalysis: false,
  skillAcademicCommunication: false,
  skillEnglishProficiency: false,
  skillDataPrivacy: false,
};

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentCourse, setCurrentCourse] =
    useState<Partial<Course>>(emptyCourse);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for Pagination and Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"IN_PROGRESS" | "COMPLETED">(
    "IN_PROGRESS"
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== search) {
        setDebouncedSearch(search);
        setCurrentPage(1); // Reset to page 1 on new search
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

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
    fetchCourses(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);
  
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
      fetchCourses(currentPage, debouncedSearch); // Refresh list
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // (เพิ่ม) เริ่มโหลด
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

    setIsSubmitting(false);
    setIsFormVisible(false);
    setCurrentCourse(emptyCourse);
    fetchCourses(currentPage, debouncedSearch); // Refresh list after save
  };

  const openStudentList = (
    course: Course,
    tab: "IN_PROGRESS" | "COMPLETED"
  ) => {
    setSelectedCourse(course);
    setModalTab(tab);
    setShowModal(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Course Management</h2>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72 text-gray-700">
            <input
              type="text"
              placeholder="ค้นหาหลักสูตร..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <button
            onClick={handleAddNew}
            className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm font-medium"
          >
            <Plus size={18} className="mr-2" />
            Add New Course
          </button>
        </div>
      </div>

      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-5 animate-fade-in-up"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-gray-800">
              {currentCourse.id ? "Edit Course" : "Add New Course"}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={currentCourse.title}
                onChange={(e) =>
                  setCurrentCourse({ ...currentCourse, title: e.target.value })
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={currentCourse.description}
                onChange={(e) =>
                  setCurrentCourse({
                    ...currentCourse,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={currentCourse.imageUrl || ""}
                onChange={(e) =>
                  setCurrentCourse({ ...currentCourse, imageUrl: e.target.value })
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={currentCourse.categoryId || ""}
                onChange={(e) =>
                  setCurrentCourse({
                    ...currentCourse,
                    categoryId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-white"
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
                <span className="text-xs text-blue-500 mt-1 block">Loading categories...</span>
              )}
            </div>

            {/* AI Literacy Skills */}
            <div className="md:col-span-2 border-t border-gray-200 pt-4">
              <label className="block text-sm font-bold text-gray-800 mb-3">AI Literacy (5 ทักษะ)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <input
                    type="checkbox"
                    id="skillDataResearch"
                    checked={currentCourse.skillDataResearch || false}
                    onChange={(e) =>
                      setCurrentCourse({ ...currentCourse, skillDataResearch: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="skillDataResearch" className="text-sm text-gray-700 cursor-pointer">การค้นคว้าข้อมูล</label>
                </div>

                <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <input
                    type="checkbox"
                    id="skillDataAnalysis"
                    checked={currentCourse.skillDataAnalysis || false}
                    onChange={(e) =>
                      setCurrentCourse({ ...currentCourse, skillDataAnalysis: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="skillDataAnalysis" className="text-sm text-gray-700 cursor-pointer">การวิเคราะห์ข้อมูล</label>
                </div>

                <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <input
                    type="checkbox"
                    id="skillAcademicCommunication"
                    checked={currentCourse.skillAcademicCommunication || false}
                    onChange={(e) =>
                      setCurrentCourse({ ...currentCourse, skillAcademicCommunication: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="skillAcademicCommunication" className="text-sm text-gray-700 cursor-pointer">การสื่อสารเชิงวิชาการ</label>
                </div>

                <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <input
                    type="checkbox"
                    id="skillEnglishProficiency"
                    checked={currentCourse.skillEnglishProficiency || false}
                    onChange={(e) =>
                      setCurrentCourse({ ...currentCourse, skillEnglishProficiency: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="skillEnglishProficiency" className="text-sm text-gray-700 cursor-pointer">การใช้ภาษาอังกฤษ</label>
                </div>

                <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <input
                    type="checkbox"
                    id="skillDataPrivacy"
                    checked={currentCourse.skillDataPrivacy || false}
                    onChange={(e) =>
                      setCurrentCourse({ ...currentCourse, skillDataPrivacy: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="skillDataPrivacy" className="text-sm text-gray-700 cursor-pointer">ความเป็นส่วนตัวของข้อมูลและความมั่นคงปลอดภัยทางข้อมูล</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsFormVisible(false)}
              className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Course"}
            </button>
          </div>
        </form>
      )}

      {/* Table to display courses */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full bg-white text-black">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b text-left font-medium">Title</th>
              <th className="py-3 px-4 border-b text-center font-medium">Lessons</th>
              <th className="py-3 px-4 border-b text-center font-medium">กำลังเรียน</th>
              <th className="py-3 px-4 border-b text-center font-medium text-green-600">
                สำเร็จ/สอบผ่าน
              </th>
              <th className="py-3 px-4 border-b text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังโหลดข้อมูล...</span>
                  </div>
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">ไม่พบหลักสูตรที่ค้นหา</p>
                    <p className="text-sm">ลองเปลี่ยนคำค้นหาใหม่</p>
                  </div>
                </td>
              </tr>
            ) : (
              courses.map((course) => {
                const studyingCount = course.enrollments.filter(
                  (e) => e.status === "IN_PROGRESS"
                ).length;
                const completedCount = course.enrollments.filter(
                  (e) => e.status === "COMPLETED"
                ).length;

                return (
                  <tr key={course.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">{course.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{course.description}</div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {course._count.lessons}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openStudentList(course, "IN_PROGRESS")}
                        className="bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer shadow-sm"
                      >
                        {studyingCount} คน
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openStudentList(course, "COMPLETED")}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer shadow-sm"
                      >
                        {completedCount} คน
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md text-xs font-semibold transition"
                        >
                          จัดการบทเรียน
                        </Link>
                        <button
                          onClick={() => handleEdit(course)}
                          className="bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-md text-xs font-semibold transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-md text-xs font-semibold transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal แสดงรายชื่อ */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 truncate pr-4">
                {selectedCourse.title}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 text-sm">
              <button
                className={`flex-1 py-3.5 font-semibold transition-colors ${
                  modalTab === "IN_PROGRESS"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
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
                className={`flex-1 py-3.5 font-semibold transition-colors ${
                  modalTab === "COMPLETED"
                    ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
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
            <div className="p-0 max-h-[50vh] overflow-y-auto">
              {selectedCourse.enrollments.filter((e) => e.status === modalTab)
                .length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                  <UserIcon size={40} className="text-gray-300 mb-3" />
                  <p className="font-medium">ไม่มีผู้เรียนในสถานะนี้</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {selectedCourse.enrollments
                    .filter((e) => e.status === modalTab)
                    .map((enroll, index) => (
                      <li
                        key={index}
                        className="flex items-center p-4 hover:bg-blue-50/30 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 shrink-0 font-bold shadow-sm">
                           {enroll.user.name ? enroll.user.name.charAt(0).toUpperCase() : <UserIcon size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
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
                        <div className="ml-3">
                          <Link
                            href={`/admin/users/${enroll.user.id}`}
                            className="text-xs font-medium border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            ดูข้อมูล
                          </Link>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4">
        <span>ข้อมูลทั้งหมด <span className="font-bold text-gray-900">{totalCount}</span> รายการ</span>
        <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition-colors border border-gray-200 shadow-sm"
          >
            ก่อนหน้า
          </button>
          <span className="px-4 py-2 font-medium">
            หน้า {currentPage} จาก {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || loading || totalPages === 0}
            className="px-4 py-2 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition-colors border border-gray-200 shadow-sm"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
