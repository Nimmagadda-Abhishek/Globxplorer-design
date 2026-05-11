import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBgColor,
  iconColor,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${iconBgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <span className={`text-xs sm:text-sm font-medium ${
          changeType === "positive" ? "text-green-600" :
          changeType === "negative" ? "text-red-600" :
          "text-[#6B7280]"
        }`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">{value}</p>
        <p className="text-xs sm:text-sm text-[#6B7280] line-clamp-1">{title}</p>
      </div>
    </div>
  );
}