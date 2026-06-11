
import React, { useState } from 'react';
import {
  Users, UserPlus, FileText, CheckCircle2, DollarSign, Calendar, Target,
  GraduationCap, ExternalLink, QrCode, Search, Gift, BellRing, Briefcase,
  Settings, MessageSquare, ChevronRight, Edit, Star, ShieldCheck, Download,
  TrendingUp, Globe, HelpCircle, FileCheck, Award,
  Link
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { agentApi } from '../../lib/api';
import { AgentAddLeadModal } from '../components/modals/AgentAddLeadModal';
import { toast } from 'sonner';

export function AgentDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTierDetails, setShowTierDetails] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const [commissionsSummary, setCommissionsSummary] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, leadsRes, studentsRes, updatesRes, commRes, offersRes, remindersRes] = await Promise.all([
          agentApi.dashboard.getSummary().catch(() => ({ data: null })),
          agentApi.leads.list({ limit: 5 }).catch(() => ({ data: [] })),
          agentApi.students.list({ limit: 5 }).catch(() => ({ data: [] })),
          agentApi.dashboard.getUpdates().catch(() => ({ data: [] })),
          agentApi.commissions.getSummary().catch(() => ({ data: null })),
          agentApi.offers.getOffers().catch(() => ({ data: [] })),
          agentApi.notifications.list().catch(() => ({ data: [] }))
        ]);
        if (summaryRes?.data) setSummaryData(summaryRes.data);
        
        // Merge Leads and Students for the dashboard view
        const leadsArray = Array.isArray(leadsRes?.data) ? leadsRes.data : (leadsRes?.data?.leads || []);
        const studentsArray = Array.isArray(studentsRes?.data) ? studentsRes.data : (studentsRes?.data?.students || []);
        
        // Map students to look like leads if they aren't already
        const mappedStudents = studentsArray.map((s: any) => ({
          ...s,
          name: s.name || s.fullName,
          status: s.status || s.stage || 'Lead'
        }));

        setLeads([...leadsArray, ...mappedStudents].slice(0, 5));
        
        if (updatesRes?.data) setAlerts(Array.isArray(updatesRes.data) ? updatesRes.data : []);
        if (commRes?.data) setCommissionsSummary(commRes.data);
        if (offersRes?.data) setOffers(Array.isArray(offersRes.data) ? offersRes.data : []);
        if (remindersRes?.data) setReminders(Array.isArray(remindersRes.data) ? remindersRes.data : []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpis = [
    { title: "Total Students Referred", value: summaryData?.totalStudents || "0", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Active Applications", value: summaryData?.activeApplications || "0", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Total Commission Earned", value: `₹${summaryData?.totalCommission || "0"}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "This Month Earnings", value: `₹${summaryData?.thisMonthEarnings || "0"}`, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50" },
    { title: "Follow-ups Due", value: summaryData?.pendingFollowUps || "0", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Conversion Rate", value: `${summaryData?.conversionRate || "0"}%`, icon: Target, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-8 max-w-[1600px] mx-auto pb-24">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Welcome back, Agent!</h1>
          <p className="text-sm text-[#6B7280]">Here's what's happening with your students today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-[#4F46E5] text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-[#4338CA] transition-all flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Quick Add Lead
          </button>
        </div>
      </div>

      {/* Section 1: KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <h4 className="text-2xl font-black text-[#111827] mb-1">{kpi.value}</h4>
            <p className="text-xs font-bold text-[#6B7280] leading-tight">{kpi.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column (Main Content) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Section 2: My Students Table & Section 4: Application Status Tracker */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111827]">My Added Leads</h2>
              <button onClick={() => navigate('/leads')} className="text-sm font-bold text-[#4F46E5] hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <th className="px-6 py-3 text-xs font-black text-[#6B7280] uppercase tracking-wider">Lead Name</th>
                    <th className="px-6 py-3 text-xs font-black text-[#6B7280] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-black text-[#6B7280] uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-xs font-black text-[#6B7280] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-black text-[#6B7280] uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {leads.length > 0 ? leads.map((lead: any, i: number) => (
                    <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#111827]">{lead.name}</div>
                        <div className="text-[10px] font-black text-[#4F46E5] uppercase">{lead.gxId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4B5563]">{lead.email}</td>
                      <td className="px-6 py-4 text-sm text-[#4B5563]">{lead.phone}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-[#4F46E5] text-xs font-bold rounded-lg border border-indigo-100 whitespace-nowrap">
                          {lead.status || 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-bold text-[#4F46E5] hover:underline">Details</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm font-bold text-gray-500">
                        {loading ? 'Loading leads...' : 'No leads found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Commission Dashboard */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#111827]">Commission Dashboard</h2>
              <button className="text-sm font-bold text-[#4F46E5] hover:underline">Payout Details</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                <p className="text-xs font-bold text-[#6B7280] mb-1">Total Earned</p>
                <p className="text-xl font-black text-[#111827]">₹{commissionsSummary?.total || "0"}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-700 mb-1">Paid Out</p>
                <p className="text-xl font-black text-green-700">₹{commissionsSummary?.paid || "0"}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-xs font-bold text-orange-700 mb-1">Pending Status</p>
                <p className="text-xl font-black text-orange-700">₹{commissionsSummary?.pending || "0"}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-700 mb-1">Upcoming</p>
                <p className="text-xl font-black text-blue-700">₹{commissionsSummary?.upcoming || "0"}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-[#374151] mb-4">Country-wise Earnings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {commissionsSummary?.countryWise && Object.entries(commissionsSummary.countryWise).length > 0 ? (
                Object.entries(commissionsSummary.countryWise).map(([country, amount], i) => {
                  const colors = [
                    "from-blue-500 to-cyan-500",
                    "from-purple-500 to-pink-500",
                    "from-emerald-500 to-teal-500",
                    "from-orange-500 to-red-500"
                  ];
                  return (
                    <div key={i} className={`p-4 rounded-xl text-white bg-gradient-to-br ${colors[i % colors.length]} shadow-sm`}>
                      <p className="text-xs font-bold opacity-90 mb-1">{country}</p>
                      <p className="text-lg font-black">₹{amount as number}</p>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-4 py-4 text-center text-sm font-bold text-gray-500">
                  No commission data available.
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Offers & Benefits */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111827]">Partner Offers & Benefits</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {offers.length > 0 ? offers.map((offer, i) => (
                <div key={i} className="flex gap-4 p-4 border border-[#E5E7EB] rounded-xl hover:border-[#4F46E5] hover:bg-[#EEF2FF] transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[#4F46E5] group-hover:bg-white group-hover:shadow-sm">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827] text-sm group-hover:text-[#4F46E5]">{offer.title}</h4>
                    <p className="text-xs text-[#6B7280] mt-1">{offer.description || offer.desc}</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 py-8 text-center text-sm font-bold text-gray-500">
                  No active offers at the moment.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-6">

          {/* Section: Tier Status */}
          {summaryData?.tierDetails && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[100px] -z-0 ${summaryData.tierDetails.badge === 'Gold' || summaryData.tierDetails.badge === 'Platinum' ? 'bg-amber-100' : summaryData.tierDetails.badge === 'Silver' ? 'bg-slate-200' : 'bg-orange-50'}`}></div>
              <h2 className="text-lg font-black text-[#111827] mb-1 relative z-10 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Current Tier: {summaryData.tierDetails.badge}
              </h2>
              <p className="text-sm text-[#4B5563] font-bold mb-1 relative z-10">{summaryData.tierDetails.name}</p>
              <p className="text-xs text-[#6B7280] mb-4 relative z-10 line-clamp-2">{summaryData.tierDetails.bonus || summaryData.tierDetails.description}</p>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#4B5563]">Progress to Next Tier</span>
                  <button onClick={() => setShowTierDetails(true)} className="text-[10px] font-black text-[#4F46E5] uppercase tracking-widest hover:underline cursor-pointer">
                    Know More
                  </button>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#111827]">{summaryData.tierDetails.currentCount} / {summaryData.tierDetails.nextTierAt || 'MAX'}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${summaryData.tierDetails.nextTierAt ? Math.min(100, (summaryData.tierDetails.currentCount / summaryData.tierDetails.nextTierAt) * 100) : 100}%` }} />
                </div>
                {summaryData.tierDetails.nextTierAt && (summaryData.tierDetails.nextTierAt - summaryData.tierDetails.currentCount > 0) ? (
                  <p className="text-[10px] text-center text-[#6B7280] mt-2 font-medium">
                    {summaryData.tierDetails.nextTierAt - summaryData.tierDetails.currentCount} more students to unlock next tier!
                  </p>
                ) : (
                  <p className="text-[10px] text-center text-amber-600 mt-2 font-bold uppercase tracking-widest">
                    Maximum Tier Reached!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Quick Add Lead Panel */}
          <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Quick Add Lead
            </h2>
            <form className="space-y-3 relative z-10" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value;
              const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              
              try {
                await agentApi.leads.create({ name, phone, email });
                toast.success("Lead added successfully!");
                form.reset();
                // Refresh list
                const leadsRes = await agentApi.leads.list({ limit: 5 });
                if (leadsRes?.data) setLeads(leadsRes.data);
              } catch (err: any) {
                toast.error(err.message || "Failed to add lead");
              }
            }}>
              <input name="name" type="text" placeholder="Full Name *" required className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50" />
              <input name="email" type="email" placeholder="Email Address (Optional)" className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50" />
              <input name="phone" type="text" placeholder="Contact Number *" required className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50" />
              <button type="submit" className="w-full py-2.5 bg-white text-[#4F46E5] font-black rounded-xl text-sm hover:bg-gray-50 transition-colors shadow-md mt-2">
                Submit Details
              </button>
            </form>
          </div>

          {/* Agent Platform Manual */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-0"></div>
            <h2 className="text-lg font-black text-[#111827] mb-2 relative z-10 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#4F46E5]" /> Agent Operations Manual
            </h2>
            <p className="text-xs text-[#6B7280] mb-6 relative z-10">Your guide to all platform features & options.</p>
            
            <div className="space-y-4 relative z-10">
              <div className="group cursor-default">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#111827] group-hover:text-blue-600 transition-colors">Quick Add Lead</h4>
                </div>
                <p className="text-xs text-[#6B7280] pl-9 leading-relaxed">
                  Use the quick form above to register new prospective students. Provide their Name, Email, and Phone. They instantly appear in your <strong>My Added Leads</strong> list.
                </p>
              </div>

              <div className="group cursor-default">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#111827] group-hover:text-purple-600 transition-colors">My Added Leads & Students</h4>
                </div>
                <p className="text-xs text-[#6B7280] pl-9 leading-relaxed">
                  Track all your referrals. Monitor real-time status updates as leads progress from initial contact to successful university enrollment. Click "Details" to view full profiles.
                </p>
              </div>

              <div className="group cursor-default">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#111827] group-hover:text-emerald-600 transition-colors">Commission Dashboard</h4>
                </div>
                <p className="text-xs text-[#6B7280] pl-9 leading-relaxed">
                  Transparent tracking of your earnings. View total earned, pending payouts, and successfully paid commissions. Includes a breakdown of earnings by country.
                </p>
              </div>

              <div className="group cursor-default">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Gift className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#111827] group-hover:text-orange-600 transition-colors">Partner Offers & Benefits</h4>
                </div>
                <p className="text-xs text-[#6B7280] pl-9 leading-relaxed">
                  Access exclusive promotions, university tie-up benefits, and upcoming webinars. Keep an eye out here for special incentive programs and bonuses.
                </p>
              </div>

              <div className="group cursor-default">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#111827] group-hover:text-cyan-600 transition-colors">Profile & Settings</h4>
                </div>
                <p className="text-xs text-[#6B7280] pl-9 leading-relaxed">
                  Manage your personal details. View your official <strong>GX ID</strong>, update your contact information, and upload your profile picture via the <strong>Profile</strong> tab in the sidebar.
                </p>
              </div>
              
              <div className="group cursor-default">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#111827] group-hover:text-rose-600 transition-colors">KT Docs & Materials</h4>
                </div>
                <p className="text-xs text-[#6B7280] pl-9 leading-relaxed">
                  Navigate to <strong>KT Docs</strong> in the sidebar to download brochures, marketing materials, and university application forms to assist your marketing efforts.
                </p>
              </div>
            </div>
          </div>

          {/* Section 12 & 13: Support & Links */}
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => window.open('https://globxplore.in/', '_blank')}
              className="p-4 bg-white border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow text-[#4B5563] hover:text-[#4F46E5]"
            >
              <Globe className="w-6 h-6" />
              <span className="text-xs font-bold">Visit Website</span>
            </button>
          </div>

        </div>
      </div>
      <AgentAddLeadModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={async () => {
          const leadsRes = await agentApi.leads.list({ limit: 5 });
          if (leadsRes?.data) setLeads(leadsRes.data);
        }}
      />

      {/* Tier Details Modal */}
      {showTierDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowTierDetails(false)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
              <h2 className="text-lg font-black text-[#111827] flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Commission Tier Details
              </h2>
              <button onClick={() => setShowTierDetails(false)} className="text-[#6B7280] hover:text-[#111827] p-2">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#111827] uppercase tracking-widest border-b border-[#E5E7EB] pb-2">Category Wise Targets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                    <h4 className="text-sm font-black text-orange-700">Starter (Bronze)</h4>
                    <p className="text-xs text-orange-600 mt-1 font-medium">&lt; 5 Students</p>
                  </div>
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl">
                    <h4 className="text-sm font-black text-slate-700">Growth (Silver)</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">5 to 15 Students</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <h4 className="text-sm font-black text-amber-700">Pro (Gold)</h4>
                    <p className="text-xs text-amber-600 mt-1 font-medium">16 to 30 Students</p>
                  </div>
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <h4 className="text-sm font-black text-indigo-700">Elite (Platinum)</h4>
                    <p className="text-xs text-indigo-600 mt-1 font-medium">31 to 100 Students</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#111827] uppercase tracking-widest border-b border-[#E5E7EB] pb-2">Commission Bonuses</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-xl">
                    <div>
                      <h4 className="text-sm font-black text-[#111827]">Starter - Bronze</h4>
                      <p className="text-xs text-[#6B7280]">Basic</p>
                    </div>
                    <span className="text-sm font-bold text-[#4B5563]">Regular Commission</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-xl bg-[#F9FAFB]">
                    <div>
                      <h4 className="text-sm font-black text-[#111827]">Growth - Silver</h4>
                      <p className="text-xs text-[#6B7280]">Advanced</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">+ ₹5K per student</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-xl">
                    <div>
                      <h4 className="text-sm font-black text-[#111827]">Pro - Gold</h4>
                      <p className="text-xs text-[#6B7280]">Professional</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">+ ₹7K per student</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-indigo-100 rounded-xl bg-indigo-50">
                    <div>
                      <h4 className="text-sm font-black text-[#111827]">Elite - Platinum</h4>
                      <p className="text-xs text-[#6B7280]">Ultimate</p>
                    </div>
                    <span className="text-sm font-bold text-[#4F46E5]">+ ₹10K per ALL students</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex justify-end">
              <button onClick={() => setShowTierDetails(false)} className="px-6 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
