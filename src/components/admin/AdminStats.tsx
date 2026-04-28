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
              <h2 className="text-lg font-bold text-gray-800">สถิติการเข้าเรียนแยกตามหมวดหมู่ (Category Stats)</h2>
              <p className="text-sm text-gray-500">จำนวนการลงทะเบียนเรียนในแต่ละหมวดหมู่ (Category)</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none">
              <option>เรียงจากมากไปน้อย</option>
            </select>
          </div>
          
          <div className="w-full space-y-6">
            {stats.categoryStats && stats.categoryStats.length > 0 ? (
              stats.categoryStats.map((cat, idx) => {
                const maxCount = Math.max(...stats.categoryStats.map(c => c.count));
                const percentage = maxCount === 0 ? 0 : (cat.count / maxCount) * 100;
                // สลับสีไล่ระดับสำหรับแต่ละบาร์เพื่อให้ดูน่าสนใจ
                const colors = [
                  "bg-blue-500", "bg-emerald-500", "bg-purple-500", 
                  "bg-amber-500", "bg-rose-500", "bg-teal-500"
                ];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={idx} className="flex items-center">
                    <div className="w-1/3 text-sm font-semibold text-gray-700 truncate pr-4" title={cat.name}>
                      {cat.name}
                    </div>
                    <div className="w-2/3 flex items-center">
                      <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden flex-1">
                        <div 
                          className={`${barColor} h-4 rounded-full transition-all duration-1000 ease-out`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-4 text-sm font-bold text-gray-800 w-10 text-right">{cat.count}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-[300px] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                <BarChart3 size={48} className="mb-4 text-blue-300" />
                <p className="font-medium text-gray-600">ไม่มีข้อมูลหมวดหมู่ (No Data)</p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Chart - Faculty Stats (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">สถิติคณะที่ลงเรียน (Faculty Stats)</h2>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {stats.facultyStats && stats.facultyStats.length > 0 ? (
              <div className="w-full space-y-8">
                {/* Visual Pie Chart (using conic-gradient) */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-48 h-48 rounded-full shadow-inner border-4 border-white overflow-hidden group">
                    <div 
                      className="absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-105"
                      style={{
                        background: `conic-gradient(${
                          stats.facultyStats.map((faculty, idx, arr) => {
                            const total = stats.enrollmentCount;
                            const prevSum = arr.slice(0, idx).reduce((acc, curr) => acc + curr.count, 0);
                            const startPercent = (prevSum / total) * 100;
                            const endPercent = ((prevSum + faculty.count) / total) * 100;
                            
                            const colors = [
                              "#3b82f6", "#10b981", "#8b5cf6", 
                              "#f59e0b", "#ef4444", "#14b8a6",
                              "#6366f1", "#f43f5e", "#84cc16"
                            ];
                            const color = colors[idx % colors.length];
                            
                            return `${color} ${startPercent}% ${endPercent}%`;
                          }).join(", ")
                        })`
                      }}
                    ></div>
                    {/* Inner Circle for Donut Effect */}
                    <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                       <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none">Total</p>
                          <p className="text-xl font-black text-gray-800">{stats.enrollmentCount}</p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {stats.facultyStats.map((faculty, idx) => {
                    const colors = [
                      "#3b82f6", "#10b981", "#8b5cf6", 
                      "#f59e0b", "#ef4444", "#14b8a6",
                      "#6366f1", "#f43f5e", "#84cc16"
                    ];
                    const color = colors[idx % colors.length];
                    const percentage = stats.enrollmentCount === 0 ? 0 : (faculty.count / stats.enrollmentCount) * 100;
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                          <span className="text-xs font-semibold text-gray-600 truncate" title={faculty.name}>
                            {faculty.name}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                           <span className="text-xs font-bold text-gray-800">{faculty.count} คน</span>
                           <span className="text-[10px] text-gray-400 block">{percentage.toFixed(1)}%</span>
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
