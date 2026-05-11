import { useState, useEffect } from "react";
import { Calendar, Plus, Search, Clock, AlertCircle, CheckCircle2, Filter, Loader2 } from "lucide-react";
import { AddFollowUpModal } from "../components/modals/AddFollowUpModal";
import { amApi } from "../../lib/api";

export function FollowUpsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await amApi.followUps.list();
      setFollowUps(res.data || []);
    } catch (err) {
      console.error("Failed to fetch follow-ups", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFollowUps = followUps.filter(followUp => {
    const studentName = followUp.studentName || followUp.target || "";
    const type = followUp.type || "";
    const priority = followUp.priority || "Medium";

    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || priority.toLowerCase() === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const overdueCount = followUps.filter(f => f.status?.toLowerCase() === "overdue").length;
  const todayCount = followUps.filter(f => {
    const today = new Date().toISOString().split('T')[0];
    return f.dueDate === today;
  }).length;
  const upcomingCount = followUps.filter(f => f.status?.toLowerCase() === "scheduled" || f.status?.toLowerCase() === "pending").length;

  const handleComplete = async (id: string) => {
    try {
      await amApi.followUps.update(id, { status: 'completed' });
      fetchFollowUps();
    } catch (err) {
      console.error("Failed to complete follow-up", err);
    }
  };

  const handleReschedule = (id: string) => {
    alert("Reschedule feature - coming soon!");
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">Follow-ups</h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">Manage all your follow-up tasks and reminders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Total Follow-ups</p>
          <p className="text-2xl font-bold text-[#111827]">{followUps.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Due Today</p>
          <p className="text-2xl font-bold text-orange-600">{todayCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">{upcomingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search follow-ups by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Follow-up
          </button>
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-4 relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
             <p className="text-sm font-bold text-indigo-600">Loading your follow-ups...</p>
          </div>
        )}
        
        {filteredFollowUps.map((followUp) => {
          const isOverdue = followUp.status?.toLowerCase() === "overdue";
          const priority = followUp.priority?.toLowerCase() || "medium";
          const priorityStyles = 
            priority === "high" ? "bg-red-100 text-red-700" :
            priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700";
          
          return (
            <div key={followUp.id || followUp._id} className={`bg-white rounded-lg border shadow-sm p-5 hover:shadow-md transition-shadow ${
              isOverdue ? "border-red-200 bg-red-50/10" : "border-[#E5E7EB]"
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                    isOverdue ? "bg-red-100" : "bg-blue-50"
                  }`}>
                    {isOverdue ? <AlertCircle className="w-6 h-6 text-red-600" /> : <Clock className="w-6 h-6 text-blue-600" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-[#111827]">{followUp.studentName || followUp.target}</h3>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyles}`}>
                        {followUp.priority || "Medium"} Priority
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280] mb-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {followUp.dueDate} {followUp.dueTime ? `at ${followUp.dueTime}` : ''}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#6B7280] rounded-full"></span>
                        {followUp.type || "General Follow-up"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#6B7280] rounded-full"></span>
                        Agent: {followUp.agent || "Assigned"}
                      </div>
                    </div>
                    
                    <p className="text-sm text-[#6B7280]">{followUp.notes || "No additional notes provided."}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReschedule(followUp.id || followUp._id)}
                    className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F8FAFC] transition-colors"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleComplete(followUp.id || followUp._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredFollowUps.length === 0 && !loading && (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB]">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
             </div>
             <h3 className="text-lg font-black text-[#111827]">All follow-ups completed!</h3>
             <p className="text-sm text-[#6B7280]">You have no pending tasks matching your criteria.</p>
          </div>
        )}
      </div>

      <AddFollowUpModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}