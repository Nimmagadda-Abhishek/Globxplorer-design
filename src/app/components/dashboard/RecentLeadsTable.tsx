import { Link } from "react-router";

export function RecentLeadsTable({ leads = [] }: { leads?: any[] }) {
  const safeLeads = Array.isArray(leads) ? leads : [];
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
      <div className="p-4 sm:p-6 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#111827]">Recent Leads</h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">Latest incoming leads</p>
          </div>
          <Link
            to="/leads"
            className="text-xs sm:text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {safeLeads.map((lead, index) => (
              <tr key={lead.id || index} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {lead.name.split(" ").map((n: string) => n[0]).join("")}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-[#111827]">{lead.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#6B7280]">{lead.country}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#6B7280]">{lead.course}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#6B7280]">{lead.source}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#6B7280]">{lead.agent}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.statusColor}`}>
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-[#E5E7EB]">
        {safeLeads.map((lead, index) => (
          <div key={lead.id || index} className="p-4 hover:bg-[#F8FAFC] transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-[#4F46E5] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-white">
                  {lead.name.split(" ").map((n: string) => n[0]).join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827] mb-1">{lead.name}</p>
                <p className="text-xs text-[#6B7280]">{lead.country} • {lead.course}</p>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${lead.statusColor} flex-shrink-0`}>
                {lead.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>Source: {lead.source}</span>
              <span>Agent: {lead.agent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}