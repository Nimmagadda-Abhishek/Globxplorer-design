import { useEffect, useState } from "react";
import { notificationApi } from "../../../lib/api";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Trash2, Filter, Info, AlertTriangle, CreditCard, MessageSquare, Shield } from "lucide-react";

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter === "unread") params.unread = "true";
      else if (filter !== "all") params.type = filter;

      const res: any = await notificationApi.getNotifications(params);
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => 
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'escalation': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'reminder': return <Bell className="w-5 h-5 text-amber-500" />;
      case 'chat': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'system': return <Shield className="w-5 h-5 text-indigo-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Stay updated with your latest alerts and tasks</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          Mark all as read
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {["all", "unread", "payment", "reminder", "status", "escalation"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              filter === f 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
          ))
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-lg font-black text-gray-900">No notifications found</h3>
            <p className="text-sm text-gray-500 mt-2">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`group bg-white border ${!n.read ? 'border-indigo-100 shadow-sm' : 'border-gray-100'} rounded-2xl p-5 transition-all hover:border-indigo-200`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  !n.read ? 'bg-indigo-50' : 'bg-gray-50'
                }`}>
                  {getTypeIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`text-sm tracking-tight ${!n.read ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                        {n.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                    {n.priority === 'critical' && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                        Critical
                      </span>
                    )}
                    {n.actionUrl && (
                      <a 
                        href={n.actionUrl}
                        className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                      >
                        Take Action
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
