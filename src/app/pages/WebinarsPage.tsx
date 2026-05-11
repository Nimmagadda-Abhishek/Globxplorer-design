import { useState, useEffect } from "react";
import { Video, Calendar, Clock, ExternalLink, Bookmark, Plus, X } from "lucide-react";
import { supportApi } from "../../lib/api";

const TOPIC_TYPES = [
  "Weekly policy updates",
  "Visa rejection case breakdowns",
  "Real cost analysis videos",
  "“Mistakes parents make” series",
  "Interview mock highlights",
  "Other"
];

export function WebinarsPage() {
  const [webinars, setWebinars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const role = localStorage.getItem("userRole");
  const canCreate = role === "ADMIN" || role === "COUNSELLOR";

  const [formData, setFormData] = useState({
    title: "",
    topicType: "Other",
    meetingLink: "",
    scheduledFor: "",
    description: ""
  });

  const fetchWebinars = async () => {
    try {
      const res: any = await supportApi.getWebinars();
      const data = Array.isArray(res) ? res : (res.data || res.webinars || []);
      setWebinars(data);
    } catch (err) {
      console.error("Failed to fetch webinars", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebinars();
  }, []);

  const handleCreateWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supportApi.createWebinar(formData);
      setShowCreateModal(false);
      setFormData({
        title: "",
        topicType: "Other",
        meetingLink: "",
        scheduledFor: "",
        description: ""
      });
      fetchWebinars();
    } catch (err) {
      console.error("Failed to create webinar", err);
      alert("Failed to schedule webinar. Please check all fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading upcoming webinars...</div>;

  return (
    <div className="p-4 sm:p-6 lg:max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-3xl font-bold text-[#111827] mb-2">Student Webinars</h1>
          <p className="text-sm sm:text-base text-[#6B7280]">Join interactive sessions with experts to guide your student through their journey</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-semibold hover:bg-[#4338CA] transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Schedule Webinar
          </button>
        )}
      </div>

      <div className="space-y-4">
        {webinars.length > 0 ? (
          webinars.map((session) => (
            <div key={session._id || session.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 sm:p-6 shadow-sm hover:border-[#4F46E5] transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center bg-indigo-50 rounded-xl p-4">
                <div className="text-center">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">
                    {session.scheduledFor ? new Date(session.scheduledFor).toLocaleString('default', { month: 'short' }) : '---'}
                  </p>
                  <p className="text-2xl font-black text-[#111827]">
                    {session.scheduledFor ? new Date(session.scheduledFor).getDate() : '--'}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-md">
                    {session.topicType || 'General'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2 leading-snug">
                  {session.title}
                </h3>
                
                <div className="flex flex-wrap gap-4 text-xs font-medium text-[#6B7280]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{session.scheduledFor ? new Date(session.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-red-500" />
                    <span>Online Session</span>
                  </div>
                </div>
                {session.description && (
                  <p className="mt-2 text-xs text-[#6B7280] line-clamp-2 italic">
                    {session.description}
                  </p>
                )}
              </div>

              <div className="w-full sm:w-auto flex flex-row sm:flex-col gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#F3F4F6]">
                <a 
                  href={session.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-semibold hover:bg-[#4338CA] transition-colors whitespace-nowrap shadow-sm"
                >
                  Join Meeting
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button className="p-2.5 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8FAFC] transition-colors shadow-sm">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB]">
            <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-[#E5E7EB]" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-1">No webinars found</h3>
            <p className="text-[#6B7280]">Check back later for newly scheduled sessions</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" onClick={() => !isSubmitting && setShowCreateModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111827]">Schedule New Webinar</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors">
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <form onSubmit={handleCreateWebinar} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Webinar Title</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                    placeholder="e.g. Masterclass: UK Student Visa Decoded"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Topic Type</label>
                  <select
                    required
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all appearance-none"
                    value={formData.topicType}
                    onChange={(e) => setFormData({ ...formData, topicType: e.target.value })}
                  >
                    {TOPIC_TYPES.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">Schedule For</label>
                    <input
                      required
                      type="datetime-local"
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                      value={formData.scheduledFor}
                      onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-1.5">Meeting Link</label>
                    <input
                      required
                      type="url"
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                      placeholder="Zoom / Google Meet URL"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1.5">Description (Optional)</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none"
                    placeholder="Provide a brief overview of what will be covered..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border border-[#E5E7EB] text-[#4B5563] rounded-xl font-semibold hover:bg-[#F9FAFB] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#4F46E5] text-white rounded-xl font-semibold hover:bg-[#4338CA] transition-all disabled:opacity-50 shadow-md"
                  >
                    {isSubmitting ? "Scheduling..." : "Schedule Webinar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
