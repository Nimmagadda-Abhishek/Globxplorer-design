import { useState, useEffect } from "react";
import { PhoneCall, Search, Filter, Download, Plus, Trash2 } from "lucide-react";
import { userApi } from "../../lib/api";
import { AddTelecallerModal } from "../components/modals/AddTelecallerModal";

export function TelecallersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [telecallers, setTelecallers] = useState<any[]>([]);
  const role = localStorage.getItem("userRole");
  const isAdmin = role === "ADMIN";
  const fetchTelecallers = async () => {
    try {
      const res: any = await userApi.getTelecallers();
      const data = Array.isArray(res) ? res : (res.data || []);
      setTelecallers(data);
    } catch (err) {
      console.error("Failed to fetch telecallers", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this telecaller? This action cannot be undone.")) {
      try {
        await userApi.deleteUser(id);
        fetchTelecallers();
      } catch (err) {
        console.error("Failed to delete telecaller", err);
        alert("Failed to delete telecaller. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchTelecallers();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">Telecallers Team</h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">Manage and track internal outreach specialists</p>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search telecallers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F8FAFC] transition-colors">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F8FAFC] transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Telecaller</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  TC ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {telecallers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#6B7280]">
                    No telecallers currently registered.
                  </td>
                </tr>
              ) : telecallers.map((tc) => (
                <tr key={tc._id || tc.gxId} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-[#4F46E5]">{tc.gxId}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-700">
                          {tc.name ? tc.name.charAt(0).toUpperCase() : "?"}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-[#111827]">{tc.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-[#111827] mb-1">{tc.email}</p>
                    <p className="text-xs text-[#6B7280]">{tc.phone}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${tc.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tc.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(tc._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Telecaller"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddTelecallerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchTelecallers} />
    </div>
  );
}
