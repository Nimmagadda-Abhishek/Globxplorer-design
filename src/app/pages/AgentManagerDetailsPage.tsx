import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Mail, Phone, ShieldCheck } from "lucide-react";
import { userApi } from "../../lib/api";

export function AgentManagerDetailsPage() {
  const { id } = useParams();
  const [manager, setManager] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!id) return;
        const res: any = await userApi.getAgentManagerById(id);
        setManager(res.data || res);
      } catch (err) {
        console.error("Failed to load details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-6">Loading details...</div>;
  if (!manager) return <div className="p-6">Manager not found.</div>;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <Link to="/agent-managers" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Agent Managers
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] h-32"></div>
        <div className="px-6 sm:px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-xl p-1 shadow-md">
              <div className="w-full h-full bg-[#F3F4F6] rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-[#4F46E5]">
                  {manager.name ? manager.name.split(" ").map((n: string) => n[0]).join("").substring(0,2) : "?"}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
              <ShieldCheck className="w-4 h-4" />
              {manager.role || "AGENT_MANAGER"}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#111827] mb-1">{manager.name}</h1>
            <p className="text-[#6B7280] font-medium mb-6">ID: {manager.gxId}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#111827]">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center border border-[#E5E7EB]">
                    <Mail className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Email Address</p>
                    <p className="text-sm font-medium">{manager.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[#111827]">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center border border-[#E5E7EB]">
                    <Phone className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Phone Number</p>
                    <p className="text-sm font-medium">{manager.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
