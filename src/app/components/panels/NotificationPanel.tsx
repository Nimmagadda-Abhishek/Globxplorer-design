import { Users, CalendarCheck, FileText, CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";

const notifications = [
  {
    id: 1,
    type: "lead",
    icon: Users,
    title: "New lead assigned",
    message: "Sarah Johnson from USA has been assigned to you",
    time: "5 minutes ago",
    unread: true,
  },
  {
    id: 2,
    type: "followup",
    icon: CalendarCheck,
    title: "Follow-up reminder",
    message: "Follow-up with Michael Chen due in 1 hour",
    time: "30 minutes ago",
    unread: true,
  },
  {
    id: 3,
    type: "document",
    icon: FileText,
    title: "Document uploaded",
    message: "Emma Wilson uploaded passport copy",
    time: "2 hours ago",
    unread: false,
  },
  {
    id: 4,
    type: "status",
    icon: CheckCircle,
    title: "Status updated",
    message: "Alex Thompson's application status changed to Visa Process",
    time: "4 hours ago",
    unread: false,
  },
];

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-lg shadow-lg border border-[#E5E7EB] overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-semibold text-[#111827]">Notifications</h3>
        <button className="text-xs font-medium text-[#4F46E5] hover:text-[#4338CA]">
          Mark all as read
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 border-b border-[#E5E7EB] hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
              notification.unread ? "bg-[#F8FAFC]" : ""
            }`}
          >
            <div className="flex gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                notification.type === "lead" ? "bg-blue-50" :
                notification.type === "followup" ? "bg-orange-50" :
                notification.type === "document" ? "bg-purple-50" :
                "bg-green-50"
              }`}>
                <notification.icon className={`w-5 h-5 ${
                  notification.type === "lead" ? "text-blue-600" :
                  notification.type === "followup" ? "text-orange-600" :
                  notification.type === "document" ? "text-purple-600" :
                  "text-green-600"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111827] mb-0.5">{notification.title}</p>
                <p className="text-sm text-[#6B7280] mb-1">{notification.message}</p>
                <p className="text-xs text-[#9CA3AF]">{notification.time}</p>
              </div>
              {notification.unread && (
                <div className="flex-shrink-0 w-2 h-2 bg-[#4F46E5] rounded-full mt-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-4 py-3 border-t border-[#E5E7EB] text-center">
        <button className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]">
          View all notifications
        </button>
      </div>
    </div>
  );
}