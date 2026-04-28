// src/components/admin/OrganizationList.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Building2, UserPlus, Trash2 } from "lucide-react";

type OrgUser = { id: number; name: string | null; email: string; role: string };
type Organization = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  users: OrgUser[];
  _count: { users: number; courses: number };
};

export default function OrganizationList() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "", description: "", userName: "", userEmail: "", userPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Add user modal
  const [addUserOrgId, setAddUserOrgId] = useState<number | null>(null);
  const [addUserData, setAddUserData] = useState({ name: "", email: "", password: "" });
  const [addUserError, setAddUserError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (debouncedSearch !== search) { setDebouncedSearch(search); setCurrentPage(1); }
    }, 500);
    return () => clearTimeout(t);
  }, [search, debouncedSearch]);

  const fetchOrgs = async (page = 1, s = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations?page=${page}&pageSize=10&search=${s}`);
      const data = await res.json();
      setOrgs(data.data); setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage); setTotalCount(data.totalCount);
    } catch { console.error("Failed to fetch orgs"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrgs(currentPage, debouncedSearch); }, [currentPage, debouncedSearch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setFormError(null);
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message || "เกิดข้อผิดพลาด"); return; }
      setShowCreateForm(false);
      setFormData({ name: "", description: "", userName: "", userEmail: "", userPassword: "" });
      fetchOrgs(currentPage, debouncedSearch);
    } catch { setFormError("เกิดข้อผิดพลาด"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("คุณต้องการลบหน่วยงานนี้ใช่หรือไม่?")) return;
    await fetch(`/api/admin/organizations/${id}`, { method: "DELETE" });
    fetchOrgs(currentPage, debouncedSearch);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault(); setAddUserError(null);
    try {
      const res = await fetch(`/api/admin/organizations/${addUserOrgId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addUserData, role: "ORG_ADMIN" }),
      });
      const data = await res.json();
      if (!res.ok) { setAddUserError(data.message || "เกิดข้อผิดพลาด"); return; }
      setAddUserOrgId(null); setAddUserData({ name: "", email: "", password: "" });
      fetchOrgs(currentPage, debouncedSearch);
    } catch { setAddUserError("เกิดข้อผิดพลาด"); }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">จัดการหน่วยงาน</h2>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-72 text-gray-700">
            <input type="text" placeholder="ค้นหาหน่วยงาน..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm font-medium">
            <Plus size={18} className="mr-2" /> เพิ่มหน่วยงาน
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">เพิ่มหน่วยงานใหม่</h3>
            <button type="button" onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          {formError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{formError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อหน่วยงาน *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">รายละเอียด</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" />
            </div>
          </div>
          {/* User section */}
          <div className="border-t border-gray-200 pt-5">
            <h4 className="text-md font-bold text-gray-700 mb-3 flex items-center"><UserPlus size={18} className="mr-2 text-blue-600" /> สร้างบัญชีผู้ดูแลหน่วยงาน (ไม่บังคับ)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อผู้ใช้</label>
                <input type="text" value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">อีเมล</label>
                <input type="email" value={formData.userEmail} onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">รหัสผ่าน</label>
                <input type="password" value={formData.userPassword} onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setShowCreateForm(false)}
              className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกหน่วยงาน"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full bg-white text-black">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b text-left font-medium">หน่วยงาน</th>
              <th className="py-3 px-4 border-b text-center font-medium">ผู้ดูแล</th>
              <th className="py-3 px-4 border-b text-center font-medium">คอร์ส</th>
              <th className="py-3 px-4 border-b text-center font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && orgs.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังโหลดข้อมูล...</span>
                </div>
              </td></tr>
            ) : orgs.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-lg font-medium">ยังไม่มีหน่วยงาน</p>
                  <p className="text-sm">กดปุ่ม &quot;เพิ่มหน่วยงาน&quot; เพื่อเริ่มต้น</p>
                </div>
              </td></tr>
            ) : (
              orgs.map((org) => (
                <tr key={org.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold shadow-sm">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{org.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{org.description || "-"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-sm font-bold text-gray-800">{org._count.users}</span>
                      {org.users.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {org.users.map((u) => u.email).join(", ")}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">{org._count.courses} คอร์ส</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => setAddUserOrgId(org.id)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md text-xs font-semibold transition">
                        <UserPlus size={14} className="inline mr-1" />เพิ่มผู้ดูแล
                      </button>
                      <button onClick={() => handleDelete(org.id)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-md text-xs font-semibold transition">
                        <Trash2 size={14} className="inline mr-1" />ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {addUserOrgId && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800">เพิ่มผู้ดูแลหน่วยงาน</h3>
              <button onClick={() => { setAddUserOrgId(null); setAddUserError(null); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              {addUserError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{addUserError}</div>}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อ</label>
                <input type="text" value={addUserData.name} onChange={(e) => setAddUserData({ ...addUserData, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">อีเมล *</label>
                <input type="email" value={addUserData.email} onChange={(e) => setAddUserData({ ...addUserData, email: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสผ่าน *</label>
                <input type="password" value={addUserData.password} onChange={(e) => setAddUserData({ ...addUserData, password: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" required />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => { setAddUserOrgId(null); setAddUserError(null); }}
                  className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 font-medium">ยกเลิก</button>
                <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium">เพิ่มผู้ดูแล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4">
        <span>ข้อมูลทั้งหมด <span className="font-bold text-gray-900">{totalCount}</span> รายการ</span>
        <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors border border-gray-200 shadow-sm">ก่อนหน้า</button>
          <span className="px-4 py-2 font-medium">หน้า {currentPage} จาก {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || loading || totalPages === 0}
            className="px-4 py-2 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors border border-gray-200 shadow-sm">ถัดไป</button>
        </div>
      </div>
    </div>
  );
}
