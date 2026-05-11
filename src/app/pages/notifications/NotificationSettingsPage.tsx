import { useEffect, useState } from "react";
import { notificationApi } from "../../../lib/api";
import { Bell, Mail, Smartphone, MessageCircle, Moon, Globe } from "lucide-react";
import { toast } from "sonner";

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      const res: any = await notificationApi.getPreferences();
      setPrefs(res.data?.preferences || {});
    } catch (err) {
      console.error("Failed to fetch preferences", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePref = async (key: string) => {
    try {
      const updated = { ...prefs, [key]: !prefs[key] };
      setPrefs(updated);
      await notificationApi.updatePreferences({ [key]: updated[key] });
      toast.success("Preferences updated");
    } catch (err) {
      toast.error("Failed to update preferences");
      setPrefs(prefs); // Revert
    }
  };

  if (loading) return <div className="p-8 animate-pulse">Loading settings...</div>;

  const settings = [
    { key: "allowApp", label: "In-App Notifications", description: "Receive alerts inside the CRM bell icon", icon: Bell },
    { key: "allowEmail", label: "Email Notifications", description: "Get summaries and critical alerts via email", icon: Mail },
    { key: "allowWhatsApp", label: "WhatsApp Alerts", description: "Real-time updates on your registered mobile number", icon: MessageCircle },
    { key: "allowMarketing", label: "Marketing & News", description: "Stay informed about new universities and offers", icon: Globe },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notification Settings</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Control how and when you want to be notified</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-8">
          {settings.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <div className="flex gap-4 min-w-0">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 tracking-tight">{s.label}</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{s.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => togglePref(s.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs[s.key] ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    prefs[s.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}

          <hr className="border-gray-50" />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 tracking-tight">Quiet Hours</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Silence non-critical alerts during these hours</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pl-14">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Start Time</label>
                <input 
                  type="time" 
                  value={prefs.quietHoursStart} 
                  onChange={(e) => setPrefs({...prefs, quietHoursStart: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">End Time</label>
                 <input 
                  type="time" 
                  value={prefs.quietHoursEnd} 
                  onChange={(e) => setPrefs({...prefs, quietHoursEnd: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex justify-end">
          <button 
            onClick={() => {
               notificationApi.updatePreferences({
                 quietHoursStart: prefs.quietHoursStart,
                 quietHoursEnd: prefs.quietHoursEnd
               });
               toast.success("Quiet hours saved");
            }}
            className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
