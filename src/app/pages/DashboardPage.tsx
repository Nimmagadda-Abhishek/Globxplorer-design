import { Search, Plus, Filter, RotateCcw, MoreVertical, CheckCircle, Clock, FileText, Gift, CreditCard, ChevronRight, Info, HelpCircle, Users, UserPlus, GraduationCap, FileCheck, CheckCircle2, XCircle, DollarSign, Calendar, Users2, BarChart3, TrendingUp, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { adminApi } from "../../lib/api";
import { AgentManagerDashboardPage } from "./AgentManagerDashboardPage";
import { AgentDashboardPage } from "./AgentDashboardPage";
import { CounsellorDashboardPage } from "./CounsellorDashboardPage";
import { VisaAgentDashboardPage } from "./visa-agent/VisaAgentDashboardPage";
import { PaymentRequestModal } from "../components/modals/PaymentRequestModal";

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
  const [selectedIntake, setSelectedIntake] = useState("Apr 27 - July 27 +3 more");
  const [selectedCountry, setSelectedCountry] = useState("Andorra , Australia +42 more");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
    } else if (isAdmin) {
      fetchDashboardData();
    }
  }, [role, isAdmin, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, chartsRes] = await Promise.all([
        adminApi.dashboard.getSummary(),
        adminApi.dashboard.getCharts()
      ]);
      setSummary(summaryRes.data);
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
    { title: "Students with Apps", value: summary?.activeStudents || "0" },
    { title: "Total Apps", value: summary?.applicationsSubmitted || "0" },
    { title: "Students with Offers", value: summary?.offerLettersReceived || "0" },
    { title: "Total Payments Done", value: summary?.totalPayments || "0" },
  ];

  const pendingActions = [
    { title: "Pre-STI Students", count: summary?.preStiCount || 0 },
    { title: "Add New Applications", count: summary?.newApplicationsCount || 0 },
    { title: "Review Apps on Hold", count: summary?.appsOnHoldCount || 0 },
    { title: "Review Offers Received", count: summary?.offersToReviewCount || 0 },
    { title: "Update Visa Status", count: summary?.visaUpdatesPending || 0 },
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
            <div className="h-64 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 text-[#CBD5E1] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#94A3B8]">Analytics Visualization Ready</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-[#111827]">Team Ranking</h2>
              <button className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider">View All</button>
            </div>
            <div className="space-y-4">
              {(summary?.topPerformers || []).length > 0 ? (
                summary.topPerformers.map((performer: any, i: number) => (
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
          <button
            onClick={() => navigate('/pipeline')}
            className="flex-1 bg-[#4F46E5] text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-indigo-100 hover:bg-[#4338CA] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {showPaymentModal && <PaymentRequestModal onClose={() => setShowPaymentModal(false)} />}

      </div>

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
              <div className="mt-6 text-center">
                <button className="text-sm font-bold text-[#111827] underline hover:text-[#4F46E5]">Show More</button>
              </div>
            </div>
          </div>

          {/* Pending Tasks Section */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Pending Actions List */}
            <div className="xl:col-span-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden h-fit">
              {pendingActions.map((action, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-5 cursor-pointer transition-colors border-b border-[#F3F4F6] last:border-0 ${i === 0 ? "bg-[#EEF2FF] border-l-4 border-l-[#4F46E5]" : "hover:bg-gray-50"
                    }`}
                >
                  <span className={`text-sm font-bold ${i === 0 ? "text-[#4F46E5]" : "text-[#4B5563]"}`}>
                    {action.title}
                  </span>
                  <span className={`text-sm font-bold ${i === 0 ? "text-[#4F46E5]" : "text-[#111827]"}`}>
                    {action.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Empty Task State */}
            <div className="xl:col-span-8 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col items-center justify-center p-12 min-h-[400px]">
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
          </div>
        </div>

        {/* Sidebar: University Updates */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex-1">
            <div className="p-6 border-b border-[#F3F4F6]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#111827]">University updates</h2>
                <div className="flex items-center gap-1 text-[#4F46E5] text-xs font-bold cursor-pointer hover:underline">
                  <HelpCircle className="w-4 h-4" />
                  How it Works
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["All", "Canada", "USA", "UK", "Others"].map((tab) => (
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
                  <p className="text-xs text-[#6B7280] leading-relaxed mb-4 line-clamp-3">
                    {update.description}
                  </p>
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

            <div className="p-4 bg-gray-50 border-t border-[#F3F4F6] text-center">
              <button className="text-xs font-bold text-[#111827] underline hover:text-[#4F46E5]">See all updates</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}