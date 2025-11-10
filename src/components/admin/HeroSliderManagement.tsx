// src/components/admin/HeroSliderManagement.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link"; // ใช้ Link สำหรับ linkUrl

type Slide = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
};

const emptySlide: Partial<Slide> = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "/courses", // Default link
  order: 0,
  isActive: true,
};

export default function HeroSliderManagement() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Partial<Slide>>(emptySlide);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // (ฟังก์ชัน fetchSlides, handleAddNew, handleEdit, handleDelete, handleSubmit
  //  จะคล้ายกับใน CourseList.tsx มากครับ)

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero-slides");
      const data = await res.json();
      setSlides(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleAddNew = () => {
    setCurrentSlide(emptySlide);
    setIsFormVisible(true);
  };

  const handleEdit = (slide: Slide) => {
    setCurrentSlide(slide);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slide?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete slide");
      }

      // Refresh the slides list after successful deletion
      fetchSlides();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete slide. Please try again.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    // (Logic POST/PATCH)
    // (ขอย่อส่วนนี้ไว้ก่อนนะครับ Logic จะเหมือนกับ handleSubmit ใน CourseList.tsx)
    const isEditing = currentSlide.id;
    const url = isEditing
      ? `/api/admin/hero-slides/${currentSlide.id}`
      : "/api/admin/hero-slides";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentSlide),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error);
      }
      setIsFormVisible(false);
      fetchSlides(); // โหลดใหม่
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (โค้ดสำหรับฟอร์มและตาราง) ...
  // (เนื่องจากยาวมาก ขอยกตัวอย่างเฉพาะส่วนฟอร์ม)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Hero Slides</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add New Slide
        </button>
      </div>

      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-gray-100 rounded-lg space-y-4 text-black"
        >
          <h3 className="text-xl font-semibold">
            {currentSlide.id ? "Edit Slide" : "Add Slide"}
          </h3>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={currentSlide.title}
              onChange={(e) =>
                setCurrentSlide({ ...currentSlide, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              // required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium">Subtitle</label>
            <textarea
              value={currentSlide.subtitle || ""}
              onChange={(e) =>
                setCurrentSlide({ ...currentSlide, subtitle: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input
              type="text"
              value={currentSlide.imageUrl || ""}
              onChange={(e) =>
                setCurrentSlide({ ...currentSlide, imageUrl: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium">
              Link URL (e.g., /courses/1)
            </label>
            <input
              type="text"
              value={currentSlide.linkUrl || ""}
              onChange={(e) =>
                setCurrentSlide({ ...currentSlide, linkUrl: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium">Order</label>
            <input
              type="number"
              value={currentSlide.order || 0}
              onChange={(e) =>
                setCurrentSlide({
                  ...currentSlide,
                  order: parseInt(e.target.value),
                })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Is Active */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentSlide.isActive}
                onChange={(e) =>
                  setCurrentSlide({
                    ...currentSlide,
                    isActive: e.target.checked,
                  })
                }
                className="h-5 w-5"
              />
              <span>Active (Show this slide on homepage)</span>
            </label>
          </div>

          {/* (Error และปุ่ม Submit) */}
          {formError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {formError}
            </div>
          )}
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsFormVisible(false)}
              disabled={isSubmitting}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* (ตารางแสดง List of Slides) */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b text-left">Title</th>
              <th className="py-2 px-4 border-b text-left">Link</th>
              <th className="py-2 px-4 border-b text-left">Order</th>
              <th className="py-2 px-4 border-b text-left">Active</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : (
              slides.map((slide) => (
                <tr key={slide.id}>
                  <td className="py-2 px-4 border-b">{slide.title}</td>
                  <td className="py-2 px-4 border-b">{slide.linkUrl}</td>
                  <td className="py-2 px-4 border-b">{slide.order}</td>
                  <td className="py-2 px-4 border-b">
                    {slide.isActive ? "Yes" : "No"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleEdit(slide)}
                      className="text-blue-500 hover:text-blue-700 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
