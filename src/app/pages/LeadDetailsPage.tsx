import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Mail, Phone, MapPin, Target, BookOpen, Clock, User, MessageCircle } from "lucide-react";
import { leadApi } from "../../lib/api";

export function LeadDetailsPage() {
  const { id } = useParams();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeadDetails = async () => {
      try {
        if (!id) return;
        const res: any = await leadApi.getLeadById(id);
        const data = res.data || res;
        setLead(data);
      } catch (err) {
        console.error("Failed to load lead details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeadDetails();
  }, [id]);

  if (loading) return <div className="p-6">Loading lead details...</div>;
  if (!lead) return <div className="p-6">Lead not found.</div>;

  const statusColorMap: Record<string, string> = {
    New: "bg-blue-100 text-blue-700",
    Contacted: "bg-yellow-100 text-yellow-700",
    Qualified: "bg-green-100 text-green-700",
    Lost: "bg-red-100 text-red-700",
  };
  const badgeColor = statusColorMap[lead.status] || "bg-slate-100 text-slate-700";

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <Link to="/leads" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-32"></div>
        <div className="px-6 sm:px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-xl p-1 shadow-md">
              <div className="w-full h-full bg-[#F3F4F6] rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {lead.name ? lead.name.split(" ").map((n: string) => n[0]).join("") : "?"}
                </span>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}>
              <Target className="w-4 h-4 mr-1.5" />
              {lead.status || "New"}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#111827] mb-1">{lead.name}</h1>
            <p className="text-[#6B7280] font-medium mb-6">ID: {lead._id || id}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 border border-[#E5E7EB] rounded-xl p-4 bg-[#F8FAFC]">
                <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-2">Contact Info</h3>

                <div className="flex items-center gap-3 text-[#111827]">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                    <Mail className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Email</p>
                    <p className="text-sm font-medium">{lead.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#111827]">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                    <Phone className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Phone</p>
                    <p className="text-sm font-medium">{lead.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#111827]">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                    <MapPin className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Country</p>
                    <p className="text-sm font-medium">{lead.interestCountry || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border border-[#E5E7EB] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-[#111827] border-b border-[#E5E7EB] pb-2 mb-2">Lead Trajectory</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5"><BookOpen className="w-3 h-3 inline mr-1" />Interest</p>
                    <p className="text-sm font-medium text-[#111827]">{lead.interestedLevel || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5"><Target className="w-3 h-3 inline mr-1" />Course</p>
                    <p className="text-sm font-medium text-[#111827]">{lead.course || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5"><User className="w-3 h-3 inline mr-1" />Source</p>
                    <p className="text-sm font-medium text-[#111827]">{lead.sourceAgent?.name || lead.source || "Direct"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5"><User className="w-3 h-3 inline mr-1" />Assigned To</p>
                    <p className="text-sm font-medium text-indigo-600">{lead.assignedTo?.name || lead.assignedAgent?.name || lead.agent || "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5"><Clock className="w-3 h-3 inline mr-1" />Follow Up Date</p>
                    <p className="text-sm font-medium text-[#111827]">
                      {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : "Not Scheduled"}
                    </p>
                  </div>
                </div>

                {lead.notes && (
                  <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#6B7280] mb-1.5 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" /> Notes
                    </p>
                    <p className="text-sm text-[#111827] bg-[#F8FAFC] p-3 rounded-lg border border-[#E5E7EB]">
                      {lead.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
