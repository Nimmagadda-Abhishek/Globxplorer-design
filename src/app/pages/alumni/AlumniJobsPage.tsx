import { useState, useEffect, useRef } from "react";
import { Briefcase, MapPin, DollarSign, Eye, Users, CheckCircle2, Plus, Loader2, FileText, MessageCircle, Send, X } from "lucide-react";
import { alumniApi } from "../../../lib/api";

export function AlumniJobsPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salaryRange: ""
  });

  // Chat State
  const [chatAppId, setChatAppId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobsRes, perfRes] = await Promise.all([
        alumniApi.jobs.getAll().catch(() => null),
        alumniApi.jobs.getPerformance().catch(() => null)
      ]);

      const jobsData = jobsRes?.data || jobsRes?.jobs || (Array.isArray(jobsRes) ? jobsRes : []);
      setJobs(jobsData);

      if (perfRes?.stats) {
        let totalViews = 0;
        let totalApplicants = 0;
        let totalHires = 0;
        let totalCommissions = 0;

        perfRes.stats.forEach((item: any) => {
          totalViews += item.performance?.views || 0;
          totalApplicants += item.performance?.applicants || 0;
          totalHires += item.performance?.successfulHires || 0;
          totalCommissions += item.performance?.commissions || 0;
        });

        setPerformance({
          views: totalViews,
          applicants: totalApplicants,
          hires: totalHires,
          commissions: `₹${totalCommissions}`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await alumniApi.jobs.getApplications();
      const data = res.data || res.applications || (Array.isArray(res) ? res : []);
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "jobs") {
      fetchJobs();
    } else {
      fetchApplications();
    }
  }, [activeTab]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await alumniApi.jobs.post(formData);
      setShowAdd(false);
      setFormData({ title: "", company: "", location: "", salaryRange: "" });
      alert("Job posted for verification!");
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Failed to post job");
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await alumniApi.jobs.updateApplicationStatus(appId, newStatus);
      // Update local state
      setApplications(applications.map(app => 
        (app._id || app.id) === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const openChat = async (appId: string) => {
    setChatAppId(appId);
    setChatMessages([]);
    try {
      const res = await alumniApi.jobs.chat.getMessages(appId);
      const msgs = res.data || res.messages || (Array.isArray(res) ? res : []);
      setChatMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatAppId) return;
    try {
      setIsSending(true);
      const res = await alumniApi.jobs.chat.sendMessage(chatAppId, chatInput);
      const newMsg = res.data || res.message || { message: chatInput, sender: 'alumni', createdAt: new Date().toISOString() };
      setChatMessages(prev => [...prev, newMsg]);
      setChatInput("");
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verified Jobs</h1>
          <p className="text-slate-500 mt-1 font-medium">Post opportunities and track your referral commissions.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      <div className="flex space-x-2 bg-slate-100/50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "jobs" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          My Job Posts
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "applications" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Applications Received
        </button>
      </div>

      {activeTab === "jobs" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Views", value: performance?.views || 0, icon: Eye, color: "text-blue-600", bg: "bg-blue-100" },
              { label: "Applicants", value: performance?.applicants || 0, icon: Users, color: "text-amber-600", bg: "bg-amber-100" },
              { label: "Successful Hires", value: performance?.hires || 0, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
              { label: "Earned Commission", value: performance?.commissions || "₹0", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-100" }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
              </div>
            ))}
          </div>

          {showAdd && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">Post Job Opportunity</h3>
              <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
                  <input type="text" placeholder="Part-time Cafe Staff" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                  <input type="text" placeholder="Tim Hortons" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                  <input type="text" placeholder="Toronto, ON" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Salary Range</label>
                  <input type="text" placeholder="18 CAD/hr" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold">Submit for Verification</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">Your Job Posts</h3>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <div key={job.id || job._id} className="border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {job.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900">{job.title}</h4>
                    <p className="text-sm font-bold text-slate-700">{job.company}</p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><MapPin className="w-4 h-4" /> {job.location}</span>
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><DollarSign className="w-4 h-4" /> {job.salaryRange}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">Applications Received</h3>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500">
              No applications received yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <div key={app._id || app.id} className="border border-slate-100 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{app.student?.name || 'Applicant'}</h4>
                      <p className="text-sm font-bold text-slate-500">{app.job?.title || 'Unknown Job'} • {app.job?.company || 'Company'}</p>
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-violet-600 text-xs font-bold mt-2 inline-block hover:underline">
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</label>
                      <select 
                        value={app.status || 'Pending'}
                        onChange={(e) => handleUpdateStatus(app._id || app.id, e.target.value)}
                        className="border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500/20"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => openChat(app._id || app.id)}
                      className="flex items-center gap-2 bg-violet-50 text-violet-600 px-4 py-2 rounded-xl font-bold hover:bg-violet-100 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" /> Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Drawer */}
      {chatAppId && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-lg font-black text-slate-900">Application Chat</h3>
              <p className="text-xs font-medium text-slate-500">Communicate with the applicant</p>
            </div>
            <button onClick={() => setChatAppId(null)} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-violet-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">No messages yet. Send a message to start the conversation!</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'alumni' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.sender === 'alumni' ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm'}`}>
                    {msg.message}
                    <div className={`text-[10px] mt-1 text-right ${msg.sender === 'alumni' ? 'text-violet-200' : 'text-slate-400'}`}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all bg-slate-50 focus:bg-white"
              />
              <button
                type="submit"
                disabled={isSending || !chatInput.trim()}
                className="bg-violet-600 text-white p-3 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center justify-center shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
