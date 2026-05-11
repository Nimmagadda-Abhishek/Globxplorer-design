import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { initSocket, getSocket } from "../../utils/socket";
import { notificationApi } from "../../../lib/api";
import { Link } from "react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const userId = localStorage.getItem("userId");

    // Initial fetch
    fetchUnreadCount();
    fetchNotifications();

    // Setup Socket if userId is available
    if (userId) {
      const socket = initSocket(userId);
      
      socket.on("new_notification", (notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 5));
        setUnreadCount((prev) => prev + 1);
      });

      socket.on("unread_count_updated", ({ unreadCount }) => {
        setUnreadCount(unreadCount);
      });

      return () => {
        socket.off("new_notification");
        socket.off("unread_count_updated");
      };
    }
  }, [localStorage.getItem("userId")]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res: any = await notificationApi.getUnreadCount();
      // Adjusting to handle both { data: { count } } and { count }
      const count = res.data?.count ?? res.count ?? 0;
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res: any = await notificationApi.getNotifications({ limit: 5 });
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => 
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  return (
    <DropdownMenu.Root onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-xl transition-colors relative outline-none">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 mt-2 z-[100] overflow-hidden"
          align="end"
        >
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-sm text-gray-900">Notifications</h3>
            <Link 
              to={
                role === "STUDENT" ? "/student/notifications" :
                role === "ALUMNI" ? "/alumni/notifications" :
                role === "ALUMNI_MANAGER" ? "/alumni-manager/notifications" :
                role === "VISA_AGENT" ? "/visa-agent/notifications" :
                "/notifications"
              } 
              className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
            >
              View All
            </Link>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-xs text-gray-500 font-medium">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative group ${!n.read ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className={`text-xs ${!n.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-2 block font-medium">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
             <Link 
              to="/settings/notifications" 
              className="text-[10px] font-bold text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-widest"
             >
              Notification Settings
             </Link>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
