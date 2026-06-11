import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Mail, Phone, MapPin, UserCheck, Calendar, ImageIcon, MessageSquare } from "lucide-react";
import { adminApi, userApi } from "../../lib/api";

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${path}`;
};

export function AgentDetailsPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!id) return;
        const role = localStorage.getItem("userRole") || "ADMIN";
        const res: any = role === "ADMIN"
          ? await adminApi.agents.getById(id)
          : await userApi.getAgentById(id);

        const responseData = res.data || res;
        setAgent(responseData.agent || responseData);
      } catch (err) {
        console.error("Failed to load agent details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-6">Loading details...</div>;
  if (!agent) return <div className="p-6">Agent not found.</div>;

  const hasPhoto = !!agent.agentDetails?.businessBoardPhoto;
  const photoUrl = getImageUrl(agent.agentDetails?.businessBoardPhoto);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <Link to="/agents" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Agents
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        {/* Top Banner / Image */}
        {hasPhoto ? (
          <div
            className="h-64 sm:h-80 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${photoUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-32 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        )}

        <div className="px-6 sm:px-8 pb-8 relative z-10">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-xl p-1 shadow-md border border-gray-100">
              <div className="w-full h-full bg-[#F3F4F6] rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-teal-600">
                  {(agent.agentDetails?.businessName || agent.name || "U")[0].toUpperCase()}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm bg-emerald-100 text-emerald-800 border border-emerald-200">
              <UserCheck className="w-4 h-4" />
              {agent.role || "AGENT"}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-black text-[#111827] mb-1">{agent.agentDetails?.businessName || agent.name}</h1>
            <p className="text-[#6B7280] font-bold text-sm mb-8 flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">ID: {agent.gxId}</span>
              <span>•</span>
              Owner: {agent.name}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Contact & Location */}
              <div className="space-y-6">
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-5">
                  <h3 className="text-xs font-black text-[#9CA3AF] uppercase tracking-wider mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[#111827]">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E5E7EB]">
                        <Mail className="w-4 h-4 text-[#4F46E5]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Email Address</p>
                        <p className="text-sm font-bold">{agent.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[#111827]">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E5E7EB]">
                        <Phone className="w-4 h-4 text-[#4F46E5]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Phone Number</p>
                        <p className="text-sm font-bold">{agent.phone || agent.agentDetails?.customerWhatsappNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {agent.agentDetails && (
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-5">
                    <h3 className="text-xs font-black text-[#9CA3AF] uppercase tracking-wider mb-4">Location Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-[#4F46E5] mt-0.5" />
                        <div>
                          <p className="font-bold text-[#111827]">{agent.agentDetails.businessAreaName || "N/A"}</p>
                          <p className="text-[#6B7280] text-xs mt-0.5">{agent.agentDetails.street || "No street info"}, {agent.agentDetails.lineNumber || ""}</p>
                        </div>
                      </div>
                      {agent.agentDetails.locationUrl && (
                        <a href={agent.agentDetails.locationUrl} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                          Open Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Business Profile & Remarks */}
              {agent.agentDetails && (
                <div className="space-y-6">
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                    <h3 className="text-xs font-black text-[#9CA3AF] uppercase tracking-wider mb-4">Business Profile</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-[#6B7280] font-medium">Status</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${agent.agentDetails.agentStatus === 'confirmed' || agent.agentDetails.agentStatus === 'partnered' ? 'bg-green-100 text-green-700' :
                            agent.agentDetails.agentStatus === 'revisit' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                          }`}>{(agent.agentDetails.agentStatus || "Pending").replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-[#6B7280] font-medium">MOU Status</span>
                        <span className="font-bold text-[#111827]">{agent.agentDetails.mouStatus || (agent.agentDetails.isMouCompleted ? "Completed" : "Not Completed")}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-[#6B7280] font-medium">Nature of Business</span>
                        <span className="font-bold text-[#111827]">{agent.agentDetails.natureOfBusiness || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Remarks Section */}
                  {agent.agentDetails.remarks && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                      <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Manager Remarks
                      </h3>
                      <p className="text-sm font-medium text-amber-900 leading-relaxed">
                        {agent.agentDetails.remarks}
                      </p>
                    </div>
                  )}

                  {/* Revisit History & Photo */}
                  {agent.agentDetails.statusHistory?.map((history: any, idx: number) => {
                    if (history.status === 'revisit' && hasPhoto) {
                      return (
                        <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(photoUrl, '_blank')}>
                            <img src={photoUrl} alt="Revisit Verification" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                              <ImageIcon className="w-3.5 h-3.5" />
                              Re-visit Logged
                            </h4>
                            <p className="text-xs text-indigo-700 font-medium flex items-center gap-1.5 mb-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(history.date).toLocaleDateString()} at {new Date(history.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Photo Uploaded</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
