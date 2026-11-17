// src/components/CourseCard.tsx
import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/data/courses"; // นำเข้า Type ที่เราสร้างไว้

// กำหนดว่า props ที่รับเข้ามาต้องมีหน้าตาเป็นอย่างไร
type CourseCardProps = {
  course: Course;
};

export default function CourseCard({ course }: CourseCardProps) {
  const imageUrl = course.imageUrl || "/bg-hero.jpg";

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-colors duration-200 hover:border-gray-400">
      <Link href={`/courses/${course.id}`} className="block">
        <Image
          src={imageUrl}
          alt={course.title}
          width={600}
          height={400}
          unoptimized
          className="w-full h-44 object-cover border-b border-gray-200"
        />
        <div className="p-5">
          {course.category?.name && (
            <span className="inline-block text-xs font-medium tracking-wide text-accent-text mb-2">
              {course.category.name}
            </span>
          )}
          <h3 className="text-lg font-semibold leading-snug text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 min-h-16">
            {course.description}
          </p>
          <div className="mt-4 text-sm text-gray-900 font-medium">
            ดูรายละเอียด <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
