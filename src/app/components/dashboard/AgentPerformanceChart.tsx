import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function AgentPerformanceChart({ data = [] }: { data?: any[] }) {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">Agent Performance</h2>
          <p className="text-sm text-[#6B7280]">Leads and conversions by agent this month</p>
        </div>
        <select className="px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={safeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            iconType="circle"
          />
          <Bar dataKey="leads" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Total Leads" key="leads" />
          <Bar dataKey="converted" fill="#10B981" radius={[6, 6, 0, 0]} name="Converted" key="converted" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}