import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Plus, Filter, Download, Search, Loader2, Trash2, Upload } from "lucide-react";
import { AddLeadModal } from "../components/modals/AddLeadModal";
import { AgentAddLeadModal } from "../components/modals/AgentAddLeadModal";
import { PromoteLeadModal } from "../components/modals/PromoteLeadModal";
import { BulkUploadLeadsModal } from "../components/modals/BulkUploadLeadsModal";
import { leadApi, adminApi, userApi } from "../../lib/api";

export function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [promotingLeadId, setPromotingLeadId] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isAssignedView = location.pathname.includes("assigned-leads");

  const role = localStorage.getItem("userRole");
  const isAdmin = role === "ADMIN";
  const canPromote = isAdmin || role === "TELECALLER";

  useEffect(() => {
    fetchLeads();
  }, [role, isAssignedView]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let res: any;
      
      if (isAssignedView) {
        res = await leadApi.getMyLeads();
      } else {
        if (role === "TELECALLER") {
          res = await leadApi.getLeads();
        } else if (isAdmin || role === "COUNSELLOR") {
          res = await adminApi.leads.list({ search: searchTerm });
        } else {
          res = await leadApi.getMyLeads();
        }
      }
      
      const rawLeads = res.data?.leads || res.leads || res.data || [];
      const mappedLeads = rawLeads.map((apiLead: any, index: number) => ({
        id: apiLead._id || apiLead.id || index + 1000,
        name: apiLead.name || "Unknown",
        phone: apiLead.phone || "-",
        country: apiLead.country || "-",
        interest: apiLead.interest || "-",
        course: apiLead.course || "-",
        source: apiLead.source || "-",
        assignedTo: apiLead.assignedTo?.name || apiLead.assignedAgent?.name || apiLead.agent || "-",
        sourceAgent: apiLead.sourceAgent?.name || "-",
        status: apiLead.status || "New",
        statusColor: "bg-blue-100 text-blue-700",
        followUpDate: apiLead.followUpDate ? new Date(apiLead.followUpDate).toISOString().split('T')[0] : "-"
      }));
      setLeads(mappedLeads);
    } catch (err) {
      console.error("Failed to load leads from API", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchLeads();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead? This action is permanent.")) {
      try {
        await leadApi.deleteLead(id);
        fetchLeads();
      } catch (err) {
        console.error("Failed to delete lead:", err);
        alert("Failed to delete lead. Please try again.");
      }
    }
  };


  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">
          {isAssignedView ? "Assigned Leads" : "Leads Management"}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          {isAssignedView ? "Manage leads assigned specifically to you" : "Manage and track all your leads in one place"}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search leads..."
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
            {isAdmin && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-[#4F46E5] text-[#4F46E5] rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Bulk Upload</span>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">

          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Interest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Lead Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Source Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Follow-up Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {lead.name.split(" ").map((n: string) => n[0]).join("")}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-[#111827]">{lead.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.phone}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.country}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.interest}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.course}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.source}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.sourceAgent}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#4F46E5] font-semibold">{lead.assignedTo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.statusColor}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.followUpDate}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-3">
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {canPromote && (
                      <button
                        onClick={() => setPromotingLeadId(lead.id)}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        Promote
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="text-sm text-[#6B7280]">
            Showing <span className="font-medium text-[#111827]">1</span> to{" "}
            <span className="font-medium text-[#111827]">{leads.length}</span> of{" "}
            <span className="font-medium text-[#111827]">{leads.length}</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table - Mobile */}
      <div className="lg:hidden bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">

          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Interest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Lead Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Source Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Follow-up Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {lead.name.split(" ").map((n: string) => n[0]).join("")}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-[#111827]">{lead.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.phone}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.country}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.interest}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.course}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.source}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-[#6B7280]">
                    {lead.sourceAgent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-indigo-700 font-bold">
                    {lead.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.statusColor}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{lead.followUpDate}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex flex-col gap-2">
                    <Link
                      to={`/leads/${lead.id}`}
                      className="text-[#4F46E5] hover:text-[#4338CA]"
                    >
                      View
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-left text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                    {canPromote && (
                      <button
                        onClick={() => setPromotingLeadId(lead.id)}
                        className="text-left text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        Promote
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="text-sm text-[#6B7280]">
            Showing <span className="font-medium text-[#111827]">1</span> to{" "}
            <span className="font-medium text-[#111827]">{leads.length}</span> of{" "}
            <span className="font-medium text-[#111827]">{leads.length}</span> results
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {role === "AGENT" || role === "AGENT_MANAGER" ? (
        <AgentAddLeadModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchLeads}
        />
      ) : (
        <AddLeadModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchLeads}
        />
      )}
      <PromoteLeadModal
        isOpen={!!promotingLeadId}
        leadId={promotingLeadId}
        onClose={() => setPromotingLeadId(null)}
        onSuccess={handleRefresh}
      />
      {showBulkModal && (
        <BulkUploadLeadsModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={fetchLeads}
        />
      )}
    </div>
  );
}