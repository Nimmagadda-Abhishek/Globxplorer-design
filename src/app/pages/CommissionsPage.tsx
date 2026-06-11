import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Download, Filter, Search, TrendingUp, Calendar, CheckCircle2, AlertCircle, ChevronRight 
} from 'lucide-react';
import { agentApi } from '../../lib/api';

export function CommissionsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchCommissions = async () => {
      setLoading(true);
      try {
        const [summaryRes, listRes] = await Promise.all([
          agentApi.commissions.getSummary().catch(() => ({ data: null })),
          agentApi.commissions.list().catch(() => ({ data: [] }))
        ]);
        if (summaryRes?.data) setSummary(summaryRes.data);
        if (listRes?.data) setCommissions(Array.isArray(listRes.data) ? listRes.data : []);
      } catch (err) {
        console.error("Error fetching commissions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-6 max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Commissions & Payouts</h1>
          <p className="text-sm text-[#6B7280]">Track your earnings, pending payouts, and payment history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-[#E5E7EB] text-[#4B5563] text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4 group hover:border-[#4F46E5] transition-colors">
           <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
           </div>
           <div>
             <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Total Earned</p>
             <h4 className="text-2xl font-black text-[#111827]">₹{summary?.total || "0"}</h4>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4 group hover:border-green-500 transition-colors">
           <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
           </div>
           <div>
             <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Paid Out</p>
             <h4 className="text-2xl font-black text-[#111827]">₹{summary?.paid || "0"}</h4>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4 group hover:border-orange-500 transition-colors">
           <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6" />
           </div>
           <div>
             <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Pending Status</p>
             <h4 className="text-2xl font-black text-[#111827]">₹{summary?.pending || "0"}</h4>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4 group hover:border-cyan-500 transition-colors">
           <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div>
             <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Upcoming</p>
             <h4 className="text-2xl font-black text-[#111827]">₹{summary?.upcoming || "0"}</h4>
           </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-[#F3F4F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search by student, ID, or university..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#4B5563] text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter Status
             </button>
             <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#4B5563] text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date Range
             </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-xs font-black text-[#6B7280] uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-black text-[#6B7280] uppercase tracking-wider">Student Details</th>
                <th className="px-6 py-4 text-xs font-black text-[#6B7280] uppercase tracking-wider">Institution & Country</th>
                <th className="px-6 py-4 text-xs font-black text-[#6B7280] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-[#6B7280] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-black text-[#6B7280] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {commissions.map((comm: any, i: number) => (
                <tr key={i} className="hover:bg-[#F9FAFB] transition-colors group cursor-pointer">
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-[#4B5563]">{comm.id || `COM-00${i+1}`}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-[#111827]">{comm.student || comm.studentName || comm.studentId?.name || "Unknown"}</div>
                    <div className="text-xs text-[#6B7280]">{comm.gxId || comm.studentId?.gxId || `GXST-${1000+i}`}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-[#374151]">{comm.university || "University"}</div>
                    <div className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> {comm.country || "Other"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-black text-[#111827]">₹{(comm.amount || comm.amountEarned || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                      comm.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
                      comm.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {comm.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-[#4B5563]">{comm.date || (comm.createdAt ? new Date(comm.createdAt).toLocaleDateString() : "-")}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-[#9CA3AF] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {loading && commissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm font-bold text-gray-500">
                    Loading commissions data...
                  </td>
                </tr>
              )}
              {!loading && commissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm font-bold text-gray-500">
                    No commission history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between bg-white">
          <span className="text-sm text-[#6B7280] font-medium">Showing <span className="font-bold text-[#111827]">{commissions.length > 0 ? 1 : 0}</span> to <span className="font-bold text-[#111827]">{commissions.length}</span> of <span className="font-bold text-[#111827]">{commissions.length}</span> entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-bold text-[#9CA3AF] cursor-not-allowed">Previous</button>
            <button className="px-3 py-1.5 bg-[#4F46E5] text-white rounded-lg text-sm font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-bold text-[#4B5563] hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
