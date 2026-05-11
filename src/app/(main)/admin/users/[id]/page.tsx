"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  KeyRound,
  User as UserIcon,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  IdCard,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  Edit3
} from "lucide-react";

type Enrollment = {
  id: number;
  status: string;
  enrolledAt: string;
  course: {
    id: number;
    title: string;
  };
};

type UserDetail = {
  id: number;
  name: string;
  email: string;
  role: string;
  studentId: string | null;
  faculty: string | null;
  major: string | null;
  year: string | null;
  enrollments: Enrollment[];
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = String(params.id);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserDetail>>({});
  const [facultyList, setFacultyList] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch User
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data);
      setEditedUser({
        name: data.name,
        studentId: data.studentId || "",
        faculty: data.faculty || "",
        major: data.major || "",
        year: data.year || "",
      });
    } catch (error) {
      console.error(error);
      alert("Error loading user data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchFaculties = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/faculties");
      if (res.ok) {
        const data = await res.json();
        setFacultyList(data);
      }
    } catch (err) {
      console.error("Error fetching faculties", err);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchFaculties();
  }, [fetchUser, fetchFaculties]);

  const handleRemoveCourse = async (enrollmentId: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าจะยกเลิกคอร์สเรียนนี้ของผู้ใช้?")) return;

    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUser();
      } else {
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleSaveProfile = async () => {
    if (!confirm("ยืนยันการบันทึกข้อมูล?")) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedUser),
      });

      if (res.ok) {
        setIsEditing(false);
        fetchUser(); // Reload data
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (!confirm("ยืนยันการเปลี่ยนรหัสผ่านให้ผู้ใช้นี้?")) return;

    try {
      const res = await fetch(`/api/admin/users/${params.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        alert("เปลี่ยนรหัสผ่านสำเร็จ!");
        setNewPassword("");
        setIsChangingPassword(false);
      } else {
        const msg = await res.text();
        alert(`เกิดข้อผิดพลาด: ${msg}`);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-xl font-bold text-gray-800">ไม่พบข้อมูลผู้ใช้</p>
        <Link href="/admin" className="mt-4 text-blue-600 hover:underline">
          กลับสู่แดชบอร์ด
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-2"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              กลับไปหน้าจัดการผู้ใช้
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              รายละเอียดผู้ใช้งาน
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                user.role === "ADMIN"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : user.role === "ORG_ADMIN"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Profile & Password */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100">
                    <UserIcon size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {user.name || "ไม่ระบุชื่อ"}
                    </h2>
                    <p className="text-sm text-gray-500 truncate max-w-[150px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-full transition-colors tooltip"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit3 size={18} />
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-full transition-colors"
                      disabled={savingProfile}
                      title="ยกเลิก"
                    >
                      <X size={18} />
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                      disabled={savingProfile}
                      title="บันทึก"
                    >
                      <Save size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                {/* Profile Fields */}
                <div className="space-y-4">
                  <ProfileField
                    icon={<UserIcon size={16} />}
                    label="ชื่อ-นามสกุล"
                    value={editedUser.name}
                    isEditing={isEditing}
                    onChange={(val) =>
                      setEditedUser({ ...editedUser, name: val })
                    }
                  />
                  <ProfileField
                    icon={<Mail size={16} />}
                    label="อีเมล"
                    value={user.email}
                    isEditing={false}
                  />
                  <ProfileField
                    icon={<IdCard size={16} />}
                    label="รหัสนิสิต"
                    value={editedUser.studentId}
                    isEditing={isEditing}
                    onChange={(val) =>
                      setEditedUser({ ...editedUser, studentId: val })
                    }
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <Building size={16} className="mr-2 text-gray-400" />
                      คณะ
                    </div>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          list="faculty-options"
                          value={editedUser.faculty || ""}
                          onChange={(e) =>
                            setEditedUser({ ...editedUser, faculty: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="เลือกหรือพิมพ์ชื่อคณะ"
                        />
                        <datalist id="faculty-options">
                          {facultyList.map((f, i) => (
                            <option key={i} value={f} />
                          ))}
                        </datalist>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900 font-medium pl-6">
                        {user.faculty || "-"}
                      </div>
                    )}
                  </div>
                  <ProfileField
                    icon={<GraduationCap size={16} />}
                    label="สาขา"
                    value={editedUser.major}
                    isEditing={isEditing}
                    onChange={(val) =>
                      setEditedUser({ ...editedUser, major: val })
                    }
                  />
                  <ProfileField
                    icon={<Calendar size={16} />}
                    label="ชั้นปี"
                    value={editedUser.year}
                    isEditing={isEditing}
                    onChange={(val) =>
                      setEditedUser({ ...editedUser, year: val })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Password Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                    <KeyRound size={18} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">การรักษาความปลอดภัย</h3>
                </div>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                >
                  {isChangingPassword ? "ยกเลิก" : "เปลี่ยนรหัสผ่าน"}
                </button>
              </div>

              {isChangingPassword ? (
                <form
                  onSubmit={handleChangePassword}
                  className="space-y-3 animate-fade-in"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
                    </label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="พิมพ์รหัสผ่านใหม่..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    บันทึกรหัสผ่าน
                  </button>
                </form>
              ) : (
                <p className="text-xs text-gray-500">
                  คุณสามารถตั้งรหัสผ่านใหม่ให้ผู้ใช้งานในกรณีที่ผู้ใช้งานลืมรหัสผ่าน
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Enrolled Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    หลักสูตรที่ลงทะเบียน
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    ผู้ใช้นี้ได้ลงทะเบียนเรียนทั้งหมด {user.enrollments.length} หลักสูตร
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BookOpenIcon />
                </div>
              </div>

              <div className="p-0 flex-1 overflow-x-auto">
                {user.enrollments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <GraduationCap size={24} className="text-gray-300" />
                    </div>
                    <p className="font-medium text-gray-500">
                      ยังไม่มีประวัติการลงทะเบียน
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50/50 text-gray-500 uppercase tracking-wider text-xs font-semibold">
                      <tr>
                        <th className="py-4 px-6 text-left w-1/2">ชื่อหลักสูตร</th>
                        <th className="py-4 px-6 text-center">สถานะ</th>
                        <th className="py-4 px-6 text-center">วันที่ลงทะเบียน</th>
                        <th className="py-4 px-6 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {user.enrollments.map((enroll) => (
                        <tr
                          key={enroll.id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {enroll.course.title}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                enroll.status === "COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {enroll.status === "COMPLETED" ? (
                                <CheckCircle size={12} />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                              )}
                              {enroll.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center text-gray-500 text-xs">
                            {new Date(enroll.enrolledAt).toLocaleDateString("th-TH", {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleRemoveCourse(enroll.id)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="ยกเลิกการลงทะเบียน"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent for Profile Fields
function ProfileField({
  icon,
  label,
  value,
  isEditing,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  isEditing: boolean;
  onChange?: (val: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
        <span className="text-gray-400 mr-2">{icon}</span>
        {label}
      </div>
      {isEditing && onChange ? (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          placeholder={`ระบุ${label}`}
        />
      ) : (
        <div className={`text-sm font-medium pl-6 ${value ? "text-gray-900" : "text-gray-400 italic"}`}>
          {value || "-"}
        </div>
      )}
    </div>
  );
}

function BookOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );
}

