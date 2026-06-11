import { Search, Plus, Filter, RotateCcw, MoreVertical, CheckCircle, Clock, FileText, Gift, CreditCard, ChevronRight, Info, HelpCircle, Users, UserPlus, GraduationCap, FileCheck, CheckCircle2, XCircle, DollarSign, Calendar, Users2, BarChart3, TrendingUp, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router";
import { adminApi, telecallerApi } from "../../lib/api";
import { AgentManagerDashboardPage } from "./AgentManagerDashboardPage";
import { AgentDashboardPage } from "./AgentDashboardPage";
import { CounsellorDashboardPage } from "./CounsellorDashboardPage";
import { VisaAgentDashboardPage } from "./visa-agent/VisaAgentDashboardPage";
import { PaymentRequestModal } from "../components/modals/PaymentRequestModal";
import { AddLeadModal } from "../components/modals/AddLeadModal";

export function DashboardPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "ADMIN";
  const isAdmin = role === "ADMIN";
  const isAM = role === "AGENT_MANAGER";
  const isAgent = role === "AGENT";
  const isCounsellor = role === "COUNSELLOR";
  const isTelecaller = role === "TELECALLER";
  const isVisaAgent = role === "VISA_AGENT";

  const [activeUpdateTab, setActiveUpdateTab] = useState("All");
  const [loading, setLoading] = useState(isAdmin);
  const [summary, setSummary] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [selectedIntake, setSelectedIntake] = useState("Apr 27 - July 27 +3 more");
  const [selectedCountry, setSelectedCountry] = useState("Andorra , Australia +42 more");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  const [universityUpdates, setUniversityUpdates] = useState<any[]>([]);

  const filteredUpdates = activeUpdateTab === "All"
    ? universityUpdates
    : universityUpdates.filter(u => u.country === activeUpdateTab);

  useEffect(() => {
    if (role === "STUDENT") {
      navigate("/student", { replace: true });
    } else if (role === "ALUMNI") {
      navigate("/alumni", { replace: true });
    } else if (role === "ALUMNI_MANAGER") {
      navigate("/alumni-manager", { replace: true });
    } else if (isAdmin || isTelecaller) {
      fetchDashboardData();
    }
  }, [role, isAdmin, isTelecaller, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isTelecaller) {
        const res = await telecallerApi.dashboard.getSummary();
        setSummary(res.data);
      } else {
        const [summaryRes, chartsRes] = await Promise.all([
          adminApi.dashboard.getSummary(),
          adminApi.dashboard.getCharts()
        ]) as [any, any];
        setSummary(summaryRes.data);
        setCharts(chartsRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const adminKPIs = [
    { title: "Total Leads", value: summary?.totalLeads || "0", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "New Leads Today", value: summary?.newLeadsToday || "0", icon: UserPlus, color: "text-green-600", bg: "bg-green-50" },
    { title: "Active Students", value: summary?.activeStudents || "0", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Applications Submitted", value: summary?.applicationsSubmitted || "0", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Offer Letters Received", value: summary?.offerLettersReceived || "0", icon: FileCheck, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Visa Approved", value: summary?.visaApproved || "0", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Visa Refused", value: summary?.visaRefused || "0", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { title: "Revenue This Month", value: summary?.revenueThisMonth ? `₹${Number(summary.revenueThisMonth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₹0.00", icon: DollarSign, color: "text-cyan-600", bg: "bg-cyan-50" },
    { title: "Pending Follow-ups", value: summary?.pendingFollowUps || "0", icon: Calendar, color: "text-pink-600", bg: "bg-pink-50" },
    { title: "Active Employees", value: summary?.activeEmployeesToday || "0", icon: Users2, color: "text-slate-600", bg: "bg-slate-50" },
  ];

  const performanceStats = [
    { title: isTelecaller ? "Total Leads" : "Students with Apps", value: isTelecaller ? (summary?.totalLeads || "0") : (summary?.activeStudents || "0") },
    { title: isTelecaller ? "New Leads" : "Total Apps", value: isTelecaller ? (summary?.newLeadsToday || "0") : (summary?.applicationsSubmitted || "0") },
    { title: isTelecaller ? "Leads you have contacted" : "Students with Offers", value: isTelecaller ? (summary?.leadsContacted || "0") : (summary?.offerLettersReceived || "0") },
    { title: isTelecaller ? "Pending Leads" : "Total Payments Done", value: isTelecaller ? (summary?.pendingLeads || "0") : (summary?.totalPayments || "0") },
  ];

  const pendingActions = isTelecaller ? [
    { title: "Pending – Low", count: summary?.pending?.low ?? 0, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-l-yellow-400" },
    { title: "Pending – Medium", count: summary?.pending?.medium ?? 0, color: "text-orange-600", bg: "bg-orange-50", border: "border-l-orange-400" },
    { title: "Pending – High", count: summary?.pending?.high ?? 0, color: "text-red-600", bg: "bg-red-50", border: "border-l-red-500" },
    { title: "Completed – Total", count: (summary?.completed?.low ?? 0) + (summary?.completed?.medium ?? 0) + (summary?.completed?.high ?? 0), color: "text-green-600", bg: "bg-green-50", border: "border-l-green-500" },
    { title: "Missed – Total", count: (summary?.missed?.low ?? 0) + (summary?.missed?.medium ?? 0) + (summary?.missed?.high ?? 0), color: "text-purple-600", bg: "bg-purple-50", border: "border-l-purple-400" },
    { title: "Rejected – Total", count: (summary?.rejected?.low ?? 0) + (summary?.rejected?.medium ?? 0) + (summary?.rejected?.high ?? 0), color: "text-slate-600", bg: "bg-slate-50", border: "border-l-slate-400" },
  ] : [
    { title: "Pre-STI Students", count: summary?.preStiCount || 0, color: "text-[#4F46E5]", bg: "", border: "border-l-[#4F46E5]" },
    { title: "Add New Applications", count: summary?.newApplicationsCount || 0, color: "text-[#4B5563]", bg: "", border: "border-l-transparent" },
    { title: "Review Apps on Hold", count: summary?.appsOnHoldCount || 0, color: "text-[#4B5563]", bg: "", border: "border-l-transparent" },
    { title: "Review Offers Received", count: summary?.offersToReviewCount || 0, color: "text-[#4B5563]", bg: "", border: "border-l-transparent" },
    { title: "Update Visa Status", count: summary?.visaUpdatesPending || 0, color: "text-[#4B5563]", bg: "", border: "border-l-transparent" },
  ];

  if (isAM) {
    return <AgentManagerDashboardPage />;
  }

  if (isAgent) {
    return <AgentDashboardPage />;
  }

  if (isCounsellor) {
    return <CounsellorDashboardPage />;
  }

  if (isVisaAgent) {
    return <VisaAgentDashboardPage />;
  }

  return (
    <div className={`p-6 bg-[#F8FAFC] min-h-screen ${isAdmin ? "space-y-8" : ""} relative`}>

      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
            <p className="text-sm font-bold text-[#4F46E5]">Loading dashboard insights...</p>
          </div>
        </div>
      )}

      {/* Admin KPI Grid */}

      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {adminKPIs.map((kpi, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} transition-colors group-hover:scale-110 duration-200`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">{kpi.title}</p>
              <h4 className="text-xl font-black text-[#111827]">{kpi.value}</h4>
            </div>
          ))}
        </div>
      )}

      {/* Admin Charts Preview Section */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-[#111827]">Leads vs Conversions</h2>
                <p className="text-xs text-[#6B7280]">Monthly performance overview</p>
              </div>
              <select className="text-xs font-bold bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-1.5 outline-none">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-64 bg-white rounded-xl border border-dashed border-[#E5E7EB] flex items-center justify-center pt-4">
              {charts?.leadsVsConversions && charts.leadsVsConversions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.leadsVsConversions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="leads" name="Total Leads" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="conversions" name="Conversions" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 text-[#CBD5E1] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#94A3B8]">Loading Chart Data...</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-[#111827]">Team Ranking</h2>
            </div>
            <div className="space-y-4">
              {(charts?.teamRanking || summary?.topPerformers || []).length > 0 ? (
                (charts?.teamRanking || summary?.topPerformers).map((performer: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-[#4F46E5]">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#111827]">{performer.name}</p>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${performer.score}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#111827]">{performer.score}%</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6B7280] text-center py-4">No performance data available</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Top Section: Filters and Action Buttons */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">


        <div className="w-full lg:w-[480px] flex gap-3">
          {!isTelecaller && (
            <>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex-1 bg-white border border-indigo-200 text-indigo-600 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-50 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Request Payment
              </button>
              <button
                onClick={() => navigate('/pipeline')}
                className="flex-1 bg-white border border-[#E5E7EB] text-[#111827] py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Application
              </button>
            </>
          )}
          <button
            onClick={() => isTelecaller ? setShowAddLeadModal(true) : navigate('/pipeline')}
            className="flex-1 bg-[#4F46E5] text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-indigo-100 hover:bg-[#4338CA] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isTelecaller ? "Add Lead" : "Add Student"}
          </button>
        </div>

        {showPaymentModal && <PaymentRequestModal onClose={() => setShowPaymentModal(false)} />}
        <AddLeadModal isOpen={showAddLeadModal} onClose={() => setShowAddLeadModal(false)} />

      </div>

      {isAdmin ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden mb-8">
          <div className="p-8 border-b border-[#F3F4F6] bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#4F46E5] flex items-center justify-center shadow-md shadow-indigo-200">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#111827]">Administrator Manual</h2>
                <p className="text-sm font-medium text-[#6B7280] mt-1">Complete guide to all features and capabilities within your GlobXplorer workspace</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Analytics & Dashboard",
                icon: BarChart3,
                color: "text-blue-600",
                bg: "bg-blue-50",
                desc: "Monitor overall business KPIs, team rankings, lead conversion charts, and daily active users in real-time."
              },
              {
                title: "User Management",
                icon: Users,
                color: "text-purple-600",
                bg: "bg-purple-50",
                desc: "Add, edit, and disable users across all roles (Agents, Counsellors, Telecallers, etc.). Assign roles and manage permissions."
              },
              {
                title: "Lead Pipeline",
                icon: Filter,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                desc: "Track every lead from New to Converted. Reassign leads between telecallers, filter by priority, and monitor follow-ups."
              },
              {
                title: "Application Processing",
                icon: FileText,
                color: "text-orange-600",
                bg: "bg-orange-50",
                desc: "Review student applications, track offer letters, update university statuses, and process documents submitted by students."
              },
              {
                title: "Visa Operations",
                icon: CheckCircle2,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                desc: "Monitor visa application statuses, approve visa grants, and manage the visa pipeline alongside Visa Agents."
              },
              {
                title: "Financials & Payments",
                icon: DollarSign,
                color: "text-cyan-600",
                bg: "bg-cyan-50",
                desc: "Track total revenue, approve payment requests, generate invoices, and manage agent commissions."
              },
              {
                title: "Marketing & Offers",
                icon: Gift,
                color: "text-pink-600",
                bg: "bg-pink-50",
                desc: "Upload promotional materials, manage partner university offers, and broadcast announcements to agents."
              },
              {
                title: "Notifications & Alerts",
                icon: Info,
                color: "text-rose-600",
                bg: "bg-rose-50",
                desc: "Send system-wide alerts, configure automated WhatsApp triggers, and monitor notification delivery logs."
              },
              {
                title: "System Settings",
                icon: RotateCcw,
                color: "text-slate-600",
                bg: "bg-slate-50",
                desc: "Configure global platform settings, update company profiles, and manage integrations."
              }
            ].map((feature, i) => (
              <div key={i} className="p-5 rounded-2xl border border-[#F3F4F6] hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                <div className={`w-10 h-10 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#111827] mb-2">{feature.title}</h3>
                <p className="text-xs font-medium text-[#6B7280] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Performance Section */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111827]">Your Performance</h2>
              <button className="p-1.5 hover:bg-gray-50 rounded-lg text-[#9CA3AF]">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {performanceStats.map((stat, i) => (
                  <div key={i} className="relative p-5 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-md transition-shadow">
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#4F46E5] rounded-r-full" />
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-[#6B7280]">{stat.title}</span>
                      <MoreVertical className="w-4 h-4 text-[#9CA3AF] cursor-pointer" />
                    </div>
                    <span className="text-2xl font-bold text-[#111827]">{stat.value}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Pending Tasks Section */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Pending Actions List */}


            {/* Task Detail / Empty Task State */}
            <div className="xl:col-span-8 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm min-h-[400px] overflow-hidden">
              {isTelecaller ? (
                <div className="h-full flex flex-col">
                  <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-[#111827]">Task Breakdown</h3>
                      <p className="text-xs text-[#6B7280]">Full breakdown of all your tasks by status</p>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-4 flex-1">
                    {/* Pending */}
                    <div className="rounded-xl border border-yellow-100 bg-yellow-50/50 p-4">
                      <p className="text-xs font-black text-yellow-700 uppercase tracking-widest mb-3">⏳ Pending</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">Low</span>
                          <span className="font-bold text-yellow-600">{summary?.pending?.low ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">Medium</span>
                          <span className="font-bold text-orange-500">{summary?.pending?.medium ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">High</span>
                          <span className="font-bold text-red-600">{summary?.pending?.high ?? 0}</span>
                        </div>
                        <div className="pt-2 border-t border-yellow-100 flex items-center justify-between text-sm">
                          <span className="font-black text-[#111827]">Total</span>
                          <span className="font-black text-yellow-700">{(summary?.pending?.low ?? 0) + (summary?.pending?.medium ?? 0) + (summary?.pending?.high ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Completed */}
                    <div className="rounded-xl border border-green-100 bg-green-50/50 p-4">
                      <p className="text-xs font-black text-green-700 uppercase tracking-widest mb-3">✅ Completed</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">Low</span>
                          <span className="font-bold text-green-500">{summary?.completed?.low ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">Medium</span>
                          <span className="font-bold text-green-600">{summary?.completed?.medium ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">High</span>
                          <span className="font-bold text-green-700">{summary?.completed?.high ?? 0}</span>
                        </div>
                        <div className="pt-2 border-t border-green-100 flex items-center justify-between text-sm">
                          <span className="font-black text-[#111827]">Total</span>
                          <span className="font-black text-green-700">{(summary?.completed?.low ?? 0) + (summary?.completed?.medium ?? 0) + (summary?.completed?.high ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Missed */}
                    <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                      <p className="text-xs font-black text-purple-700 uppercase tracking-widest mb-3">📵 Missed</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">Low</span>
                          <span className="font-bold text-purple-500">{summary?.missed?.low ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">Medium</span>
                          <span className="font-bold text-purple-600">{summary?.missed?.medium ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">High</span>
                          <span className="font-bold text-purple-700">{summary?.missed?.high ?? 0}</span>
                        </div>
                        <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-sm">
                          <span className="font-black text-[#111827]">Total</span>
                          <span className="font-black text-purple-700">{(summary?.missed?.low ?? 0) + (summary?.missed?.medium ?? 0) + (summary?.missed?.high ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Rejected */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">❌ Rejected</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">Low</span>
                          <span className="font-bold text-slate-500">{summary?.rejected?.low ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">Medium</span>
                          <span className="font-bold text-slate-600">{summary?.rejected?.medium ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">High</span>
                          <span className="font-bold text-slate-700">{summary?.rejected?.high ?? 0}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                          <span className="font-black text-[#111827]">Total</span>
                          <span className="font-black text-slate-700">{(summary?.rejected?.low ?? 0) + (summary?.rejected?.medium ?? 0) + (summary?.rejected?.high ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 h-full min-h-[400px]">
                  <div className="w-32 h-32 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-6 relative">
                    <div className="w-24 h-24 bg-white rounded-full shadow-inner flex items-center justify-center">
                      <Search className="w-10 h-10 text-[#9CA3AF]" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center">
                      <div className="w-4 h-4 bg-[#4F46E5] rounded-full animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#111827] mb-2">No Pending Task</h3>
                  <p className="text-[#6B7280] text-center max-w-sm mb-8 leading-relaxed">
                    You have completed all of the pending tasks that required your immediate attention.
                  </p>
                  <button
                    onClick={() => navigate('/pipeline')}
                    className="px-10 py-3 bg-[#4F46E5] text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-[#4338CA] transition-all transform hover:-translate-y-0.5"
                  >
                    Add Student
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Telecaller Manual OR University Updates */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4">
          {isTelecaller ? (
            /* ── Telecaller Website Manual ── */
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex-1">
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#F3F4F6] bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center shadow-md shadow-indigo-200">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#111827]">Telecaller Manual</h2>
                    <p className="text-[11px] text-[#6B7280]">Your quick-start guide to GlobXplorer</p>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[620px]">
                {/* Quick Start */}
                <div className="px-6 pt-5 pb-3">
                  <p className="text-[10px] font-black text-[#4F46E5] uppercase tracking-widest mb-3">🚀 Quick Start</p>
                  <div className="space-y-2.5">
                    {[
                      { step: "1", text: "Log in with your GX ID & password on the Login page." },
                      { step: "2", text: "Your Dashboard loads instantly with today's stats." },
                      { step: "3", text: "Click \"Add Lead\" to register a new prospective student." },
                      { step: "4", text: "Go to Queue to see leads assigned to you and call them." },
                      { step: "5", text: "Log a Follow-up after every call to track progress." },
                    ].map(({ step, text }) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="min-w-[22px] h-[22px] rounded-full bg-[#4F46E5] text-white text-[10px] font-black flex items-center justify-center mt-0.5">{step}</span>
                        <p className="text-xs text-[#374151] leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mx-6 my-3 border-t border-dashed border-[#E5E7EB]" />

                {/* Features */}
                <div className="px-6 pb-3">
                  <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">📌 Key Features</p>
                  <div className="space-y-3">
                    {[
                      {
                        icon: Users,
                        color: "bg-blue-50 text-blue-600",
                        title: "Dashboard",
                        desc: "View your daily stats: total leads, new leads, leads you've contacted, and pending count.",
                      },
                      {
                        icon: Plus,
                        color: "bg-indigo-50 text-indigo-600",
                        title: "Add Lead",
                        desc: "Tap the 'Add Lead' button on the dashboard to register a new lead. Fill in name, phone, country of interest, and source.",
                      },
                      {
                        icon: Clock,
                        color: "bg-yellow-50 text-yellow-600",
                        title: "Lead Queue",
                        desc: "Find all leads assigned to you in the Queue page. Each card shows priority (Low / Medium / High) and call status.",
                      },
                      {
                        icon: CheckCircle,
                        color: "bg-green-50 text-green-600",
                        title: "Follow-ups",
                        desc: "After calling a lead, tap 'Add Follow-up' on their card. Set the next call date, notes, and outcome.",
                      },
                      {
                        icon: FileText,
                        color: "bg-purple-50 text-purple-600",
                        title: "Lead Status",
                        desc: "Update lead status to: Pending, Interested, Not Interested, Converted, or Rejected from the lead detail screen.",
                      },
                      {
                        icon: BarChart3,
                        color: "bg-rose-50 text-rose-600",
                        title: "Task Breakdown",
                        desc: "See Pending / Completed / Missed / Rejected follow-ups broken down by priority in the 'Task Breakdown' panel.",
                      },
                    ].map(({ icon: Icon, color, title, desc }) => (
                      <div key={title} className="flex items-start gap-3 p-3 rounded-xl border border-[#F3F4F6] hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors group">
                        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#111827] mb-0.5">{title}</p>
                          <p className="text-[11px] text-[#6B7280] leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mx-6 my-3 border-t border-dashed border-[#E5E7EB]" />

                {/* Tips */}
                <div className="px-6 pb-6">
                  <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">💡 Pro Tips</p>
                  <div className="space-y-2">
                    {[
                      "Always update the lead status after every call — it keeps your queue clean.",
                      "High-priority leads appear at the top of your Queue; call them first.",
                      "Use the Follow-up 'Next Call Date' to remind yourself to call back.",
                      "If a lead is unreachable 3 times, mark it as 'Missed' so the admin is aware.",
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#F59E0B] text-xs mt-0.5">✦</span>
                        <p className="text-[11px] text-[#374151] leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── University Updates (admin / other roles) ── */
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex-1">
              <div className="p-6 border-b border-[#F3F4F6]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#111827]">University updates</h2>
                  <div className="flex items-center gap-1 text-[#4F46E5] text-xs font-bold cursor-pointer hover:underline">
                    <HelpCircle className="w-4 h-4" />
                    How it Works
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {["All", "Canada", "USA", "UK", "Ireland", "Others"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveUpdateTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${activeUpdateTab === tab
                        ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]"
                        : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#4F46E5]"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-y-auto max-h-[600px]">
                {filteredUpdates.map((update, i) => (
                  <div key={i} className="p-6 border-b border-[#F3F4F6] last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{update.country}</span>
                      <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">{update.type}</span>
                    </div>
                    <h4 className="font-bold text-[#111827] mb-2 group-hover:text-[#4F46E5] transition-colors">{update.title}</h4>
                    <p className="text-xs text-[#6B7280] leading-relaxed mb-4 line-clamp-3">{update.description}</p>
                    <div className="flex justify-end">
                      <span className="text-[10px] text-[#9CA3AF] font-medium">{update.date}</span>
                    </div>
                  </div>
                ))}
                {filteredUpdates.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#94A3B8]">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-[#6B7280]">No recent updates found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}