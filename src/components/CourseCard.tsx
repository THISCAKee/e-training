// src/components/CourseCard.tsx
import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/data/courses"; // นำเข้า Type ที่เราสร้างไว้

// กำหนดว่า props ที่รับเข้ามาต้องมีหน้าตาเป็นอย่างไร
type CourseCardProps = {
  course: Course;
};

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <Link href={`/courses/${course.id}`}>
        <Image
          src={course.imageUrl}
          alt={course.title}
          width={600}
          height={400}
          unoptimized
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm h-20 overflow-hidden">
            {course.description}
          </p>
          <div className="mt-4 text-blue-600 font-semibold hover:text-blue-800">
            ดูรายละเอียด →
          </div>
        </div>
      </Link>
    </div>
  );
}
