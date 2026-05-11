import { Users2, UserPlus, Search, Filter, MoreHorizontal, Shield, Edit2, Lock, History, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AddUserModal } from "../components/modals/AddUserModal";
import { adminApi, userApi } from "../../lib/api";

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (roleFilter !== "All Roles") params.role = roleFilter.toLowerCase().replace(" ", "_");
      if (search) params.search = search;
      
      const res: any = await adminApi.users.list(params);
      const userData = res.data?.users || res.users || (Array.isArray(res) ? res : []);
      setUsers(userData);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action is permanent.")) {
      try {
        await userApi.deleteUser(id);
        fetchUsers();
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">User Management</h1>
          <p className="text-sm text-[#6B7280]">Manage all roles, permissions, and system access.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] rounded-xl text-sm font-bold text-white hover:bg-[#4338CA] transition-colors shadow-lg shadow-indigo-100 z-50"
        >
          <UserPlus className="w-4 h-4" />
          Create New User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
            />
          </form>
          <div className="flex items-center gap-2">
            <button onClick={fetchUsers} className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#6B7280] hover:bg-gray-50">
              <Filter className="w-4 h-4" />
            </button>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#374151] outline-none"
            >
              <option>All Roles</option>
              <option>Agent Manager</option>
              <option>Counsellor</option>
              <option>Telecaller</option>
              <option>Alumni Manager</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
               <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
            </div>
          )}

          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {users.map((user, index) => (
                <tr key={user._id || user.id || index} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center text-[#4F46E5] font-black text-xs">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111827]">{user.name}</p>
                        <p className="text-xs text-[#6B7280]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span className="text-sm font-medium text-[#374151]">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      user.status === "Active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <History className="w-3.5 h-3.5" />
                      {user.activity}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {localStorage.getItem("userRole") === "ADMIN" && (
                        <button 
                          onClick={() => handleDelete(user._id || user.id)}
                          title="Delete User" 
                          className="p-2 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button title="Edit User" className="p-2 text-[#6B7280] hover:text-[#4F46E5] hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button title="Reset Password" className="p-2 text-[#6B7280] hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                        <Lock className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchUsers} />
    </div>
  );
}
