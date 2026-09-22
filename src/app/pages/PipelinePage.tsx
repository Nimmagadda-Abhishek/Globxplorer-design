import { Search, Plus, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AddStudentModal } from "../components/modals/AddStudentModal";
import { AgentAddLeadModal } from "../components/modals/AgentAddLeadModal";
import { adminApi, agentApi, amApi, counsellorApi } from "../../lib/api";

export function PipelinePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const role = localStorage.getItem("userRole") || "ADMIN";

  const [dynamicStages, setDynamicStages] = useState<{id: string, name: string, color: string}[]>([]);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const role = localStorage.getItem("userRole") || "ADMIN";
      let res: any;

      switch (role) {
        case "AGENT":
          res = await agentApi.students.list();
          break;
        case "AGENT_MANAGER":
          res = await amApi.students.list();
          break;
        case "COUNSELLOR":
          res = await counsellorApi.getPipeline();
          break;
        default:
          res = await adminApi.students.getPipeline();
      }

      // Handle grouped data structure: [{ _id: 'StageName', students: [...] }, ...]
      const rawData = res.data || res.pipeline || [];
      let flatStudents: any[] = [];
      const colors = ["bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-cyan-500"];

      if (Array.isArray(rawData) && rawData.length > 0 && rawData[0].students) {
        setDynamicStages(rawData.map((group: any, idx: number) => ({
          id: (group._id || "Unknown").toLowerCase(),
          name: group._id || "Unknown",
          color: colors[idx % colors.length]
        })));
        flatStudents = rawData.flatMap((group: any) => 
          group.students.map((s: any) => {
            let stage = (s.pipelineStage || group._id || "").toLowerCase();
            return { ...s, stage };
          })
        );
      } else {
        const studentData = res.data?.students || res.data || res.pipeline || [];
        flatStudents = Array.isArray(studentData) ? studentData : Object.values(studentData).flat();
        
        // Ensure stage is present for filtering
        flatStudents = flatStudents.map(s => {
          let stage = (s.stage || s.pipelineStage || "lead").toLowerCase();
          return { ...s, stage };
        });

        // Extract unique stages
        const uniqueStages = Array.from(new Set(flatStudents.map(s => s.stage)));
        setDynamicStages(uniqueStages.map((stageId, idx) => ({
          id: stageId,
          name: stageId.charAt(0).toUpperCase() + stageId.slice(1),
          color: colors[idx % colors.length]
        })));
      }

      setStudents(flatStudents);
    } catch (err) {
      console.error("Failed to fetch pipeline:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Student Pipeline</h1>
          <p className="text-sm text-[#6B7280]">Track every student from lead to departure.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] rounded-xl text-sm font-bold text-white hover:bg-[#4338CA] transition-shadow shadow-lg shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search students in pipeline..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>
        <div className="h-10 w-px bg-gray-200" />
        <div className="flex gap-2">
          <button className="px-4 py-2.5 text-xs font-bold text-[#374151] border border-[#E5E7EB] rounded-xl hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#9CA3AF]" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
          </div>
        )}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Country</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Counsellor</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Current Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-bold text-[#6B7280]">{student.gxId || student._id}</td>
                    <td className="px-6 py-5 text-sm font-black text-[#111827]">{student.name}</td>
                    <td className="px-6 py-5">
                      <span className="bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-1 rounded-lg text-xs font-bold text-[#374151]">
                        {student.country || student.preferredCountry || student.interestedCountry || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-[#6B7280]">{student.assignedCounsellor?.name || student.counsellor?.name || "Unassigned"}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${dynamicStages.find(s => s.id === student.stage)?.color || "bg-gray-300"} rounded-full`} />
                        <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                          {dynamicStages.find(s => s.id === student.stage)?.name || student.stage}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
      {role === "AGENT" || role === "AGENT_MANAGER" ? (
        <AgentAddLeadModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchPipeline}
        />
      ) : role === "TELECALLER" ? (
        <TelecallerAddLeadModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchPipeline}
        />
      ) : (
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchPipeline}
        />
      )}
    </div>
  );
}
