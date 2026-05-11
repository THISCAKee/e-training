// src/components/admin/AdminStats.tsx
"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, BarChart3, TrendingUp, Activity } from "lucide-react";

type CategoryStat = {
  name: string;
  count: number;
};

type Stats = {
  userCount: number;
  courseCount: number;
  enrollmentCount: number;
  categoryStats: CategoryStat[];
  facultyStats: CategoryStat[];
};

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  gradient,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  gradient?: string;
}) => (
  <div
    className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all duration-300`}
  >
    <div
      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}
    ></div>
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}
      >
        {icon}
      </div>
      {trendValue && (
        <div
          className={`flex items-center text-sm font-medium ${trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-gray-500"}`}
        >
          {trend === "up" && <TrendingUp size={16} className="mr-1" />}
          {trend === "down" && <Activity size={16} className="mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
        {value}
      </h3>
      <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
    </div>
  </div>
);

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

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
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลสถิติ...</p>
      </div>
    );

  if (!stats)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
          <Activity size={32} />
        </div>
        <p className="text-gray-800 font-medium text-lg">
          ไม่สามารถโหลดข้อมูลสถิติได้
        </p>
        <p className="text-gray-500 text-sm mt-1">
          กรุณาลองใหม่อีกครั้งในภายหลัง
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="ผู้ใช้งานทั้งหมด (Total Users)"
          value={stats.userCount}
          icon={<Users size={24} />}
          gradient="from-blue-500 to-indigo-600"
          trend="up"
        />
        <StatCard
          title="หลักสูตรทั้งหมด (Total Courses)"
          value={stats.courseCount}
          icon={<BookOpen size={24} />}
          gradient="from-emerald-400 to-teal-500"
          trend="neutral"
        />
        <StatCard
          title="การลงทะเบียนเรียน (Active Enrollments)"
          value={stats.enrollmentCount}
          icon={<BarChart3 size={24} />}
          gradient="from-amber-400 to-orange-500"
          trend="up"
        />
      </div>

      {/* Charts Section Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Chart Placeholder (e.g., User Registration or Enrollment over time) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                สถิติการเข้าเรียนแยกตามหมวดหมู่ (Category Stats)
              </h2>
              <p className="text-sm text-gray-500">
                จำนวนการลงทะเบียนเรียนในแต่ละหมวดหมู่ (Category)
              </p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none">
              <option>เรียงจากมากไปน้อย</option>
            </select>
          </div>

          <div className="w-full space-y-6">
            {stats.categoryStats && stats.categoryStats.length > 0 ? (
              stats.categoryStats.map((cat, idx) => {
                const maxCount = Math.max(
                  ...stats.categoryStats.map((c) => c.count),
                );
                const percentage =
                  maxCount === 0 ? 0 : (cat.count / maxCount) * 100;
                // สลับสีไล่ระดับสำหรับแต่ละบาร์เพื่อให้ดูน่าสนใจ
                const colors = [
                  "bg-blue-500",
                  "bg-emerald-500",
                  "bg-purple-500",
                  "bg-amber-500",
                  "bg-rose-500",
                  "bg-teal-500",
                ];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={idx} className="flex items-center">
                    <div
                      className="w-1/3 text-sm font-semibold text-gray-700 truncate pr-4"
                      title={cat.name}
                    >
                      {cat.name}
                    </div>
                    <div className="w-2/3 flex items-center">
                      <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden flex-1">
                        <div
                          className={`${barColor} h-4 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-4 text-sm font-bold text-gray-800 w-10 text-right">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-[300px] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                <BarChart3 size={48} className="mb-4 text-blue-300" />
                <p className="font-medium text-gray-600">
                  ไม่มีข้อมูลหมวดหมู่ (No Data)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Chart - Faculty Stats (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              สถิติคณะที่ลงเรียน (Faculty Stats)
            </h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative">
            {stats.facultyStats && stats.facultyStats.length > 0 ? (
              <div className="w-full space-y-8 relative">
                {/* Visual Pie Chart (using SVG) */}
                <div className="flex justify-center mb-6 relative">
                  <div className="relative w-56 h-56 group">
                    <svg
                      viewBox="0 0 120 120"
                      className="w-full h-full transform -rotate-90 drop-shadow-sm"
                    >
                      {(() => {
                        const totalStudents = stats.facultyStats.reduce(
                          (sum, f) => sum + f.count,
                          0,
                        );
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius; // ~251.327
                        let currentOffset = 0;

                        return stats.facultyStats.map((faculty, idx) => {
                          const percentage =
                            totalStudents === 0
                              ? 0
                              : faculty.count / totalStudents;
                          // If percentage is 100%, subtract a tiny bit so it doesn't disappear
                          const sliceCircumference =
                            percentage === 1
                              ? circumference - 0.01
                              : percentage * circumference;
                          const strokeDasharray = `${sliceCircumference} ${circumference}`;
                          const strokeDashoffset = -currentOffset;
                          currentOffset += sliceCircumference;

                          const colors = [
                            "#3b82f6",
                            "#10b981",
                            "#8b5cf6",
                            "#f59e0b",
                            "#ef4444",
                            "#14b8a6",
                            "#6366f1",
                            "#f43f5e",
                            "#84cc16",
                          ];
                          const color = colors[idx % colors.length];

                          const isHovered = hoveredSlice === idx;

                          return (
                            <circle
                              key={idx}
                              cx="60"
                              cy="60"
                              r={radius}
                              fill="transparent"
                              stroke={color}
                              strokeWidth={isHovered ? "24" : "20"}
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className={`transition-all duration-300 ease-out cursor-pointer ${hoveredSlice !== null && hoveredSlice !== idx ? "opacity-50" : "opacity-100"}`}
                              onMouseEnter={() => setHoveredSlice(idx)}
                              onMouseLeave={() => setHoveredSlice(null)}
                            />
                          );
                        });
                      })()}
                    </svg>

                    {/* Inner Content */}
                    <div className="absolute inset-0 m-auto w-24 h-24 rounded-full flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none">
                          Total
                        </p>
                        <p className="text-xl font-black text-gray-800">
                          {stats.facultyStats.reduce(
                            (sum, f) => sum + f.count,
                            0,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Tooltip */}
                    {hoveredSlice !== null && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 w-48 bg-white border border-gray-100 shadow-xl rounded-lg p-3 z-10 pointer-events-none animate-in fade-in zoom-in duration-200">
                        {(() => {
                          const faculty = stats.facultyStats[hoveredSlice];
                          const totalStudents = stats.facultyStats.reduce(
                            (sum, f) => sum + f.count,
                            0,
                          );
                          const percentage =
                            totalStudents === 0
                              ? 0
                              : (faculty.count / totalStudents) * 100;
                          return (
                            <div className="text-center">
                              <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-1">
                                {faculty.name}
                              </p>
                              <div className="flex justify-center items-center space-x-2">
                                <span className="text-sm font-bold text-blue-600">
                                  {faculty.count} คน
                                </span>
                                <span className="text-xs text-gray-400">
                                  ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {stats.facultyStats.map((faculty, idx) => {
                    const colors = [
                      "#3b82f6",
                      "#10b981",
                      "#8b5cf6",
                      "#f59e0b",
                      "#ef4444",
                      "#14b8a6",
                      "#6366f1",
                      "#f43f5e",
                      "#84cc16",
                    ];
                    const color = colors[idx % colors.length];
                    const totalStudents = stats.facultyStats.reduce(
                      (sum, f) => sum + f.count,
                      0,
                    );
                    const percentage =
                      totalStudents === 0
                        ? 0
                        : (faculty.count / totalStudents) * 100;
                    const isHovered = hoveredSlice === idx;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isHovered ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"}`}
                        onMouseEnter={() => setHoveredSlice(idx)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          ></div>
                          <span
                            className={`text-xs font-semibold truncate ${isHovered ? "text-gray-900" : "text-gray-600"}`}
                            title={faculty.name}
                          >
                            {faculty.name}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="text-xs font-bold text-gray-800">
                            {faculty.count} คน
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full h-[300px] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                <p className="text-sm">ไม่มีข้อมูลคณะ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
