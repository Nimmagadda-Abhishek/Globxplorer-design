import { Clock, AlertCircle } from "lucide-react";

export function FollowUpReminders({ followUps = [] }: { followUps?: any[] }) {
  const safeFollowUps = Array.isArray(followUps) ? followUps : [];
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
      <div className="p-6 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">Follow-up Reminders</h2>
            <p className="text-sm text-[#6B7280]">Upcoming tasks</p>
          </div>
          <Clock className="w-5 h-5 text-[#6B7280]" />
        </div>
      </div>

      <div className="divide-y divide-[#E5E7EB]">
        {safeFollowUps.map((followUp, index) => (
          <div
            key={followUp.id || index}
            className={`p-4 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
              followUp.overdue ? "bg-red-50" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {followUp.overdue ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-[#6B7280] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111827] mb-0.5">{followUp.name}</p>
                <p className="text-xs text-[#6B7280] mb-1">{followUp.type}</p>
                <p className={`text-xs font-medium ${
                  followUp.overdue ? "text-red-600" : "text-[#4F46E5]"
                }`}>
                  {followUp.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#E5E7EB]">
        <button className="w-full text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] py-2">
          View All Follow-ups
        </button>
      </div>
    </div>
  );
}
