export function LeadPipeline({ stages = [] }: { stages?: any[] }) {
  const safeStages = Array.isArray(stages) ? stages : [];
  const maxCount = Math.max(0, ...safeStages.map((s) => s.count || 0)) || 1;

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">Lead Pipeline</h2>
          <p className="text-sm text-[#6B7280]">Overview of leads by stage</p>
        </div>
        <button className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]">
          View Details
        </button>
      </div>

      <div className="flex items-end justify-between gap-3 h-48">
        {safeStages.map((stage, index) => (
          <div key={stage.name || index} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex flex-col justify-end h-full">
              <div
                className={`w-full ${stage.color} rounded-t-lg transition-all hover:opacity-80 cursor-pointer`}
                style={{ height: `${(stage.count / maxCount) * 100}%` }}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-white font-semibold text-sm">{stage.count}</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-[#111827] leading-tight">{stage.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
