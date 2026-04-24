// src/components/admin/AdminStats.tsx
"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, BarChart3, TrendingUp, Activity } from "lucide-react";

type Stats = {
  userCount: number;
  courseCount: number;
  enrollmentCount: number;
};

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  gradient
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  gradient?: string;
}) => (
  <div className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all duration-300`}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
        {icon}
      </div>
      {trendValue && (
        <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-gray-500'}`}>
          {trend === 'up' && <TrendingUp size={16} className="mr-1" />}
          {trend === 'down' && <Activity size={16} className="mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-gray-800 tracking-tight">{value}</h3>
      <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
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
        <p className="text-gray-800 font-medium text-lg">ไม่สามารถโหลดข้อมูลสถิติได้</p>
        <p className="text-gray-500 text-sm mt-1">กรุณาลองใหม่อีกครั้งในภายหลัง</p>
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
          trendValue="+12% เดือนนี้"
        />
        <StatCard
          title="หลักสูตรทั้งหมด (Total Courses)"
          value={stats.courseCount}
          icon={<BookOpen size={24} />}
          gradient="from-emerald-400 to-teal-500"
          trend="neutral"
          trendValue="คงที่"
        />
        <StatCard
          title="การลงทะเบียนเรียน (Active Enrollments)"
          value={stats.enrollmentCount}
          icon={<BarChart3 size={24} />}
          gradient="from-amber-400 to-orange-500"
          trend="up"
          trendValue="+5% เดือนนี้"
        />
      </div>

      {/* Charts Section Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Chart Placeholder (e.g., User Registration or Enrollment over time) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">สถิติการเข้าเรียน (Enrollment Trends)</h2>
              <p className="text-sm text-gray-500">จำนวนการลงทะเบียนเรียนในแต่ละเดือน</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none">
              <option>ปีนี้ (This Year)</option>
              <option>ปีที่แล้ว (Last Year)</option>
            </select>
          </div>
          
          <div className="w-full h-[300px] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
             <BarChart3 size={48} className="mb-4 text-blue-300" />
             <p className="font-medium text-gray-600">พื้นที่สำหรับแสดงกราฟ (Chart Area)</p>
             <p className="text-sm">สามารถใช้งานร่วมกับ Recharts หรือ Chart.js</p>
          </div>
        </div>

        {/* Secondary Chart / List Placeholder */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">ข้อมูลผู้ใช้ใหม่ (New Users)</h2>
          <p className="text-sm text-gray-500 mb-6">สัดส่วนผู้ใช้ใหม่เปรียบเทียบกับผู้ใช้เดิม</p>
          
          <div className="w-full h-[200px] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 mb-6">
             <div className="w-24 h-24 rounded-full border-8 border-emerald-400 border-r-blue-500 flex items-center justify-center">
               <span className="text-xs font-bold text-gray-500">Pie Chart</span>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center">
                   <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                   <span className="text-sm text-gray-600">ผู้ใช้ใหม่</span>
                </div>
                <span className="text-sm font-bold text-gray-800">65%</span>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                   <span className="text-sm text-gray-600">ผู้ใช้เดิม</span>
                </div>
                <span className="text-sm font-bold text-gray-800">35%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
