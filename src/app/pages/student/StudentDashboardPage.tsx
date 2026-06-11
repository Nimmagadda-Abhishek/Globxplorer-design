import {
  FileWarning,
  Calendar,
  ShieldCheck,
  UserCircle,
  BellRing,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  Gift,
  CreditCard,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { studentPortalApi } from "../../../lib/api";

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [webinars, setWebinars] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, webRes, pipeRes, docRes, requestsRes] = await Promise.all([
          studentPortalApi.dashboard.get().catch(() => null),
          studentPortalApi.support.getWebinars().catch(() => null),
          studentPortalApi.pipeline.get().catch(() => null),
          studentPortalApi.documents.getAll().catch(() => null),
          studentPortalApi.payment.getMyRequests().catch(() => ({ success: true, data: [] }))
        ]);

        const dashData = dashRes?.data || dashRes || null;
        if (dashData) {
          if (pipeRes?.success && pipeRes.data && !dashData.timeline) {
            dashData.timeline = pipeRes.data.timeline;
          }
          if (pipeRes?.success && pipeRes.data && !dashData.currentStage) {
            dashData.currentStage = pipeRes.data.currentStage;
          }
          if (docRes?.success && docRes.data && dashData.missingDocsCount === undefined) {
            dashData.missingDocsCount = (docRes.data.missing || []).length;
          }
        }

        setDashboardData(dashData);
        setWebinars(webRes?.data || webRes || []);
        
        const requests = requestsRes?.data || requestsRes || [];
        setPendingPayments(Array.isArray(requests) ? requests.filter((r: any) => r.status?.toLowerCase() === 'pending') : []);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Use real data if available, fallback to empty/N/A values
  const currentStage = dashboardData?.currentStage || "Pending";
  const missingDocs = dashboardData?.missingDocsCount || 0;
  const upcomingTask = dashboardData?.pendingTasks?.[0] || null;
  const assignedCounsellor = dashboardData?.counsellor?.name || "Not Assigned";
  const unreadAlerts = dashboardData?.notificationsCount || 0;
  const userName = dashboardData?.name || localStorage.getItem("userName") || "Student";
  const cards = [
    {
      title: "Current Stage",
      value: currentStage,
      subtitle: dashboardData?.university || "Not specified",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100"
    },
    {
      title: "Missing Documents",
      value: `${missingDocs < 10 ? '0' + missingDocs : missingDocs} Documents`,
      subtitle: "Pending upload",
      icon: FileWarning,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      title: "Upcoming Task",
      value: upcomingTask?.title || "No pending tasks",
      subtitle: upcomingTask?.subtitle || "You're all caught up!",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      title: "Subscription Status",
      value: dashboardData?.subscription?.plan && dashboardData.subscription.plan !== "none" ? dashboardData.subscription.plan.charAt(0).toUpperCase() + dashboardData.subscription.plan.slice(1) : "Free Plan",
      subtitle: dashboardData?.subscription?.active ? `Active until ${dashboardData.subscription.expiry}` : dashboardData?.subscription?.expiry === "Expired" ? "Subscription Expired" : "No active subscription",
      icon: ShieldCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
    {
      title: "Counsellor Assigned",
      value: assignedCounsellor,
      subtitle: dashboardData?.counsellor?.region ? `Expert - ${dashboardData.counsellor.region}` : "Region not set",
      icon: UserCircle,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100"
    },
    {
      title: "Recent Alerts",
      value: `${unreadAlerts < 10 ? '0' + unreadAlerts : unreadAlerts} Updates`,
      subtitle: "Recent notifications",
      icon: BellRing,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100"
    },
    {
      title: "Pending Payments",
      value: pendingPayments.length > 0 ? `${pendingPayments.length} Requests` : "No pending dues",
      subtitle: pendingPayments.length > 0 ? `Total: ₹${pendingPayments.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}` : "All clear!",
      icon: CreditCard,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-100",
      path: "/student/payments"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, {userName}! 👋</h1>
          <p className="text-slate-500 mt-1 font-medium">Your journey to study abroad is {dashboardData?.completionPercentage || 0}% complete. Keep it up!</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => (card as any).path && navigate((card as any).path)}
            className={`p-6 bg-white border ${card.border} rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 ${card.bg} rounded-2xl`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{card.title}</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{card.value}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-2">Student Portal Guide</h2>
              <p className="text-indigo-100 font-medium mb-6 max-w-md">Discover all the features of your CRM dashboard. Track applications, manage documents, attend webinars, and communicate with your counsellor seamlessly.</p>
              <button 
                onClick={() => navigate("/student/manual")}
                className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4" />
                Read Manual
              </button>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-32 h-32 bg-indigo-400 rounded-full blur-2xl opacity-30"></div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900">Application Timeline</h3>
              <button className="text-sm font-bold text-indigo-600 hover:underline">View Full Journey</button>
            </div>

            <div className="space-y-6">
              {(dashboardData?.timeline || [
                { label: "Application Started", date: "N/A", status: "upcoming" },
              ]).map((step: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step.status === 'completed' ? 'bg-green-500 border-green-500' :
                      step.status === 'current' ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200'
                      }`}>
                      {step.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      {step.status === 'current' && <Clock className="w-3.5 h-3.5 text-indigo-500" />}
                    </div>
                    {idx !== (dashboardData?.timeline?.length || 1) - 1 && <div className={`w-0.5 h-12 ${step.status === 'completed' ? 'bg-green-500' : 'bg-slate-100'}`}></div>}
                  </div>
                  <div className="pt-0.5">
                    <p className={`text-sm font-black ${step.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>{step.label}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">Upcoming Webinars</h3>
            <div className="space-y-4">
              {webinars.length > 0 ? webinars.map((webinar: any, i: number) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
                  <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wider mb-2">
                    {webinar.type || webinar.topicType || "Webinar"}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{webinar.title}</h4>
                  <p className="text-xs font-bold text-slate-500 mt-1">{new Date(webinar.scheduledFor || Date.now()).toLocaleString()}</p>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-sm font-bold text-slate-400">No upcoming webinars found.</p>
                </div>
              )}
            </div>
            <button className="w-full mt-6 py-3 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">
              Browse All Webinars
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
