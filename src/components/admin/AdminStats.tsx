// src/components/admin/AdminStats.tsx
"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, Video, BarChart3 } from "lucide-react";

type Stats = {
  userCount: number;
  courseCount: number;
  // lessonCount: number;
  enrollmentCount: number;
};

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="p-3 rounded-full bg-blue-100 text-blue-600">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 py-8">Loading stats...</p>;
  if (!stats)
    return (
      <p className="text-center text-red-500 py-8">Could not load stats.</p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
      <StatCard
        title="Total Users"
        value={stats.userCount}
        icon={<Users size={24} />}
      />
      <StatCard
        title="Total Courses"
        value={stats.courseCount}
        icon={<BookOpen size={24} />}
      />
      {/*<StatCard
        title="Total Lessons"
        value={stats.lessonCount}
        icon={<Video size={24} />}
      />*/}
      <StatCard
        title="Active Enrollments"
        value={stats.enrollmentCount}
        icon={<BarChart3 size={24} />}
      />
    </div>
  );
}
