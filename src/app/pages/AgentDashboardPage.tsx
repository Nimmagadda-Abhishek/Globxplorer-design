import React, { useState } from 'react';
import {
  Users, UserPlus, FileText, CheckCircle2, DollarSign, Calendar, Target,
  GraduationCap, ExternalLink, QrCode, Search, Gift, BellRing, Briefcase,
  Settings, MessageSquare, ChevronRight, Edit, Star, ShieldCheck, Download,
  TrendingUp, Globe, HelpCircle, FileCheck,
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
    { title: "This Month Earnings", value: `₹${summaryData?.thisMonth || "0"}`, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50" },
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
              <input name="email" type="email" placeholder="Email Address *" required className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50" />
              <input name="phone" type="text" placeholder="Contact Number *" required className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50" />
              <button type="submit" className="w-full py-2.5 bg-white text-[#4F46E5] font-black rounded-xl text-sm hover:bg-gray-50 transition-colors shadow-md mt-2">
                Submit Details
              </button>
            </form>
          </div>

          {/* Section 14: Follow-up Reminders */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
            <h2 className="text-base font-bold text-[#111827] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#F59E0B]" /> Actions Required
            </h2>
            <div className="space-y-3">
              {reminders.length > 0 ? reminders.map((rem, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-[#F9FAFB] border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${rem.type === 'document' ? 'bg-red-500' : rem.type === 'payment' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">{rem.title || rem.message}</h4>
                    <p className="text-xs text-[#6B7280]">{rem.description || rem.desc || rem.date}</p>
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center text-sm font-bold text-gray-500">
                  No reminders available.
                </div>
              )}
            </div>
          </div>
          {/* Section 8: My Business Profile (Mini) & Section 10 */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
            <h2 className="text-base font-bold text-[#111827] mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#6B7280]" /> Profile & Tools
            </h2>
          </div>

          {/* Section 12 & 13: Support & Links */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => window.open('https://globxplore.in/', '_blank')}
              className="p-4 bg-white border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow text-[#4B5563] hover:text-[#4F46E5]"
            >
              <Globe className="w-6 h-6" />
              <span className="text-xs font-bold">Visit Website</span>
            </button>
            <button className="p-4 bg-white border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow text-[#4B5563] hover:text-[#4F46E5]">
              <HelpCircle className="w-6 h-6" />
              <span className="text-xs font-bold">Get Support</span>
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
    </div>
  );
}
