import { UserCheck, GraduationCap, CheckCircle, Clock, BarChart3, TrendingUp, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi, userApi } from "../../lib/api";

export function CounsellorPanelPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("userRole");
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    fetchCounsellors();
  }, []);

  const fetchCounsellors = async () => {
    setLoading(true);
    try {
      const res = await adminApi.counsellors.list();
      setData(res.data || null);
    } catch (err) {
      console.error("Failed to fetch counsellors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this counsellor? This action is permanent.")) {
      try {
        await userApi.deleteUser(id);
        fetchCounsellors();
      } catch (err) {
        console.error("Failed to delete counsellor:", err);
        alert("Failed to delete counsellor. Please try again.");
      }
    }
  };

  const counsellors = data?.counsellors || [];
  
  const totalStudents = counsellors.reduce((acc: number, c: any) => acc + (c.studentsHandled || 0), 0);
  const avgVisa = counsellors.length 
    ? counsellors.reduce((acc: number, c: any) => acc + (c.visaSuccess?.ratePercent || 0), 0) / counsellors.length 
    : 0;
  const avgDays = counsellors.length 
    ? counsellors.reduce((acc: number, c: any) => acc + (c.avgProcessing?.avgProcessingDays || 0), 0) / counsellors.length 
    : 0;
  const validSatisfaction = counsellors.filter((c: any) => c.satisfaction !== null);
  const avgSatisfaction = validSatisfaction.length 
    ? validSatisfaction.reduce((acc: number, c: any) => acc + c.satisfaction, 0) / validSatisfaction.length 
    : 0;

  return (
    <div className="space-y-8 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
           <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-black text-[#111827]">Counsellor Panel</h1>
        <p className="text-sm text-[#6B7280]">Review counselor performance and student interactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Students Handled", value: totalStudents, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Visa Success", value: `${avgVisa.toFixed(1)}%`, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Avg Processing", value: `${avgDays.toFixed(1)} Days`, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Satisfaction", value: validSatisfaction.length ? `${avgSatisfaction.toFixed(1)}/5` : "N/A", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black text-[#111827]">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm overflow-hidden">
        <h3 className="text-lg font-bold text-[#111827] mb-6">Top Counsellors</h3>
        <div className="space-y-1">
          {counsellors.map((c: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-[#E5E7EB]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center font-bold text-[#4F46E5] uppercase">
                  {c.name ? c.name[0] : "?"}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">{c.name}</p>
                  <p className="text-[10px] text-[#6B7280] uppercase font-black tracking-widest">{c.studentsHandled || 0} Applications</p>
                </div>
              </div>
              <div className="flex items-center gap-12 text-right">
                <div>
                  <p className="text-xs font-black text-[#10B981]">{c.visaSuccess?.ratePercent || 0}%</p>
                  <p className="text-[10px] text-[#9CA3AF] font-bold">Success Rate</p>
                </div>
                <div>
                  <p className="text-xs font-black text-[#111827]">{c.avgProcessing?.avgProcessingDays || 0} Days</p>
                  <p className="text-[10px] text-[#9CA3AF] font-bold">Avg. Time</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(e, c.counsellorId || c._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                    title="Delete Counsellor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {counsellors.length === 0 && !loading && (
            <div className="py-12 text-center text-[#9CA3AF] font-bold">No counsellors found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

