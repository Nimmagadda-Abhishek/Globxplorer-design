import { useState, useEffect, useRef } from "react";
import { Briefcase, MapPin, DollarSign, Clock, MessageCircle, Send, X, FileText, Upload } from "lucide-react";
import { studentApi } from "../../../lib/api";

export function StudentJobsPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState<string | null>(null);
  const [applyForm, setApplyForm] = useState({ resumeUrl: "", coverLetter: "" });
  const [isApplying, setIsApplying] = useState(false);

  // Chat Modal State
  const [chatAppId, setChatAppId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await studentApi.jobs.getOpen();
      const data = res.data || res.jobs || (Array.isArray(res) ? res : []);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await studentApi.jobs.getApplications();
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

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showApplyModal) return;
    try {
      setIsApplying(true);
      await studentApi.jobs.apply(showApplyModal, applyForm);
      setShowApplyModal(null);
      setApplyForm({ resumeUrl: "", coverLetter: "" });
      alert("Application submitted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  const fetchChat = async (appId: string) => {
    try {
      const res = await studentApi.jobs.chat.getMessages(appId);
      const msgs = res.data || res.messages || (Array.isArray(res) ? res : []);
      setChatMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  const openChat = (appId: string) => {
    setChatAppId(appId);
    setChatMessages([]);
    fetchChat(appId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatAppId) return;
    try {
      setIsSending(true);
      const res = await studentApi.jobs.chat.sendMessage(chatAppId, { message: chatInput });
      const newMsg = res.data || res.message || { message: chatInput, sender: 'student', createdAt: new Date().toISOString() };
      setChatMessages((prev) => [...prev, newMsg]);
      setChatInput("");
    } catch (err: any) {
      alert(err.message || "Failed to send message");
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
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Job Opportunities</h1>
        <p className="text-slate-500 mt-1 font-medium">Find part-time jobs posted by verified alumni.</p>
      </div>

      <div className="flex space-x-2 bg-slate-100/50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "jobs" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Open Jobs
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "applications" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          My Applications
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div></div>
      ) : activeTab === "jobs" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-slate-50 rounded-3xl border border-slate-100">
              No open jobs available at the moment.
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id || job.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="bg-green-50 text-green-600 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide">
                    {job.status || 'Open'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{job.title}</h3>
                <p className="text-slate-500 font-medium text-sm mb-4">{job.company}</p>
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <DollarSign className="w-4 h-4 text-slate-400" /> {job.salaryRange || 'Competitive'}
                  </div>
                </div>
                <button
                  onClick={() => setShowApplyModal(job._id || job.id)}
                  className="mt-6 w-full bg-slate-900 hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Apply Now
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-medium bg-slate-50 rounded-3xl border border-slate-100">
              You haven't applied to any jobs yet.
            </div>
          ) : (
            applications.map((app) => (
              <div key={app._id || app.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{app.job?.title || 'Unknown Job'}</h4>
                    <p className="text-sm font-medium text-slate-500">{app.job?.company || 'Company'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${
                      app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      app.status === 'Reviewed' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {app.status || 'Pending'}
                    </span>
                  </div>
                  <button
                    onClick={() => openChat(app._id || app.id)}
                    className="p-3 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-colors"
                    title="Chat with Alumni"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Apply for Job</h3>
              <button onClick={() => setShowApplyModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApply} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resume URL</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Upload className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/..."
                    value={applyForm.resumeUrl}
                    onChange={(e) => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Letter (Optional)</label>
                <textarea
                  placeholder="Tell us why you are a great fit..."
                  value={applyForm.coverLetter}
                  onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all min-h-[120px] resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isApplying}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isApplying ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      {chatAppId && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-lg font-black text-slate-900">Application Chat</h3>
              <p className="text-xs font-medium text-slate-500">Communicate with the poster</p>
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
                <div key={idx} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.sender === 'student' ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm'}`}>
                    {msg.message}
                    <div className={`text-[10px] mt-1 text-right ${msg.sender === 'student' ? 'text-violet-200' : 'text-slate-400'}`}>
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
