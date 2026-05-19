import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  Users2, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Shield, 
  History, 
  Loader2, 
  Trash2, 
  Mail, 
  Phone,
  BarChart3,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { adminApi } from "../../lib/api";
import { AddUserModal } from "../components/modals/AddUserModal";
import { toast } from "sonner";

export function AlumniManagersPage() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0
  });

  useEffect(() => {
    fetchManagers();
  }, [statusFilter, pagination.currentPage]);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.currentPage,
        limit: 10,
      };
      if (statusFilter !== "All") params.status = statusFilter.toLowerCase();
      if (search) params.search = search;
      
      const res: any = await adminApi.alumniManagers.list(params);
      const data = res.data || res;
      setManagers(data.users || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalUsers: data.totalUsers || 0
      });
    } catch (err) {
      console.error("Failed to fetch alumni managers:", err);
      toast.error("Failed to load alumni managers");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      await adminApi.alumniManagers.updateStatus(id, !currentStatus);
      toast.success(`Alumni Manager ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchManagers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchManagers();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Alumni Managers</h1>
          <p className="text-sm text-[#6B7280]">Manage alumni relations team and their performance.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] rounded-xl text-sm font-bold text-white hover:bg-[#4338CA] transition-colors shadow-lg shadow-indigo-100"
        >
          <UserPlus className="w-4 h-4" />
          Add Alumni Manager
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F3F4F6] flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative max-w-md min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by name, email or GX ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
            />
          </form>
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#374151] outline-none"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
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
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Manager Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">GX ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {managers.map((manager, index) => (
                <tr key={manager._id || index} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center text-[#4F46E5] font-black text-xs">
                        {manager.name ? manager.name.split(" ").map((n: any) => n[0]).join("") : "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111827]">{manager.name}</p>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                            <Mail className="w-3 h-3" />
                            {manager.email}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                            <Phone className="w-3 h-3" />
                            {manager.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-mono font-bold text-[#374151] bg-gray-100 px-2 py-1 rounded">
                      {manager.gxId}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => handleStatusToggle(manager._id, manager.isActive)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-colors ${
                        manager.isActive ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {manager.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {manager.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/alumni-managers/${manager._id}`}
                        className="p-2 text-[#6B7280] hover:text-[#4F46E5] hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-[#6B7280]">
                    No alumni managers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#F3F4F6] flex items-center justify-between">
            <p className="text-xs text-[#6B7280]">
              Showing <span className="font-bold text-[#111827]">{managers.length}</span> of <span className="font-bold text-[#111827]">{pagination.totalUsers}</span> managers
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={pagination.currentPage === 1}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                className="px-3 py-1.5 text-xs font-bold text-[#374151] border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button 
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                className="px-3 py-1.5 text-xs font-bold text-[#374151] border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchManagers} />
    </div>
  );
}
