import { useEffect, useState } from "react";
import { notificationApi } from "../../lib/api";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Trash2, Filter, Info, AlertTriangle, CreditCard, MessageSquare, Shield, Clock, Search, ExternalLink } from "lucide-react";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const deleteNotification = async (id: string) => {
    try {
      // Assuming a delete endpoint exists or soft delete
      // await notificationApi.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
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

  const filteredBySearch = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight flex items-center gap-3">
             <Bell className="w-7 h-7 text-indigo-600" />
             Notification Center
          </h1>
          <p className="text-sm text-[#6B7280] font-medium mt-1">Manage your alerts, reminders and system updates</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={markAllAsRead}
             className="px-5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#111827] hover:bg-gray-50 transition-all shadow-sm"
           >
             Mark all as read
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR FILTERS */}
        <div className="w-full md:w-64 space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-2">
              {[
                { id: "all", label: "All Notifications" },
                { id: "unread", label: "Unread" },
                { id: "payment", label: "Payments" },
                { id: "reminder", label: "Reminders" },
                { id: "escalation", label: "Escalations" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                    filter === tab.id 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                    : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
           </div>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="flex-1 space-y-4">
           <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input 
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
              />
           </div>

           <div className="space-y-3">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-50 rounded-3xl animate-pulse" />
                ))
              ) : filteredBySearch.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-gray-100">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-[#D1D5DB]">
                      <Bell className="w-10 h-10" />
                   </div>
                   <h3 className="text-lg font-black text-[#111827]">No notifications found</h3>
                   <p className="text-sm text-[#6B7280]">You're all caught up! Check back later for updates.</p>
                </div>
              ) : (
                filteredBySearch.map((n) => (
                  <div 
                    key={n._id} 
                    className={`p-6 rounded-3xl border transition-all group relative ${
                      n.read 
                      ? "bg-white border-[#E5E7EB] opacity-80" 
                      : "bg-white border-[#4F46E5]/20 shadow-md shadow-indigo-50/50"
                    }`}
                  >
                    {!n.read && <div className="absolute top-6 left-0 w-1.5 h-16 bg-indigo-600 rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />}
                    
                    <div className="flex gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        !n.read ? 'bg-indigo-50 shadow-inner' : 'bg-gray-50'
                      }`}>
                        {getTypeIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{n.type}</span>
                          <span className="text-[10px] font-bold text-[#9CA3AF] flex items-center gap-1.5">
                             <Clock className="w-3 h-3" />
                             {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <h4 className={`text-base font-black tracking-tight mb-1 ${n.read ? "text-[#374151]" : "text-[#111827]"}`}>
                          {n.title}
                        </h4>
                        <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
                          {n.message}
                        </p>

                        <div className="mt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           {!n.read && (
                             <button 
                               onClick={() => markAsRead(n._id)}
                               className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline flex items-center gap-1.5"
                             >
                               <Check className="w-3 h-3" /> Mark as read
                             </button>
                           )}
                           {n.actionUrl && (
                             <a 
                               href={n.actionUrl}
                               className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline flex items-center gap-1.5"
                             >
                               <ExternalLink className="w-3 h-3" /> Take Action
                             </a>
                           )}
                           <button 
                             onClick={() => deleteNotification(n._id)}
                             className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline flex items-center gap-1.5"
                           >
                             <Trash2 className="w-3 h-3" /> Delete
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
