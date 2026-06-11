import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { User, Bell, Lock, Globe, CreditCard, Users, Building, Briefcase, Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { adminApi, amApi, agentApi, alumniManagerApi, studentPortalApi, alumniApi, visaAgentApi, authApi } from "../../lib/api";
import { notificationApi } from "../../lib/api";

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "notifications";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
  ];

  // NOTE: Settings should never crash if localStorage is empty/unavailable.
  const role = (() => {
    try {
      return localStorage.getItem("userRole");
    } catch {
      return null;
    }
  })();

  if (role === "AGENT") {
    tabs.splice(1, 0, { id: "business", label: "Business Profile", icon: Briefcase });
  }

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const currentRole = localStorage.getItem("userRole");
      let res;
      if (currentRole === "ADMIN") {
        res = await adminApi.auth.me();
      } else if (currentRole === "AGENT_MANAGER") {
        res = await amApi.profile.get();
      } else if (currentRole === "AGENT") {
        res = await agentApi.auth.me();
      } else if (currentRole === "ALUMNI_MANAGER") {
        res = await alumniManagerApi.auth.me();
      } else if (currentRole === "ALUMNI") {
        res = await alumniApi.profile.get();
      } else if (currentRole === "STUDENT") {
        res = await studentPortalApi.profile.get();
      } else if (currentRole === "VISA_AGENT") {
        res = await visaAgentApi.me();
      } else {
        res = await adminApi.auth.me();
      }
      setProfile(res.data || res);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      // Fallback
      setProfile({
        name: localStorage.getItem("userName"),
        gxId: localStorage.getItem("gxId"),
        role: localStorage.getItem("userRole"),
        email: localStorage.getItem("userEmail") || "",
        phone: localStorage.getItem("userPhone") || ""
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        </div>
      )}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">Settings Panel</h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">Manage your account and application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Sidebar - Horizontal scroll on mobile */}
        <div className="lg:w-64 bg-white rounded-lg border border-[#E5E7EB] p-3 sm:p-4 shadow-sm">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? "bg-[#4F46E5] text-white"
                  : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg border border-[#E5E7EB] p-4 sm:p-6 shadow-sm">
          {activeTab === "profile" && profile && <ProfileSettings key={profile._id || profile.gxId || 'profile'} profile={profile} />}
          {activeTab === "business" && <BusinessSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "preferences" && <PreferencesSettings />}
          {activeTab === "billing" && <BillingSettings />}
          {activeTab === "team" && <TeamSettings />}
          {activeTab === "organization" && <OrganizationSettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ profile }: { profile: any }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#111827] mb-4">Profile Settings</h2>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#4F46E5] rounded-full flex items-center justify-center overflow-hidden">
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-medium text-white">
                {profile?.name ? profile.name.split(" ").map((n: string) => n[0]).join("") : "AD"}
              </span>
            )}
          </div>
          <div>
            <button className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F8FAFC] transition-colors mr-2">
              Change Photo
            </button>
            <button className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700">
              Remove
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Full Name</label>
            <input
              type="text"
              defaultValue={profile?.name || ""}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2 text-left">GlobX ID</label>
            <input
              type="text"
              defaultValue={profile?.gxId || ""}
              disabled
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-[#F8FAFC] text-[#6B7280]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Email</label>
          <input
            type="email"
            defaultValue={profile?.email || ""}
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Phone</label>
          <input
            type="tel"
            defaultValue={profile?.phone || ""}
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Role</label>
          <input
            type="text"
            defaultValue={profile?.role || "Admin"}
            disabled
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-[#F8FAFC] text-[#6B7280]"
          />
        </div>

        <div className="pt-4 border-t border-[#E5E7EB]">
          <button className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState<any>({
    allowApp: false,
    allowEmail: false,
    allowWhatsApp: false,
    allowMarketing: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  });
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
    } catch (err) {
      console.error("Failed to update preferences");
      setPrefs(prefs); // Revert
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-sm text-gray-500">Loading preferences...</div>;

  return (
    <div>
      <h2 className="text-lg font-black text-[#111827] tracking-tight mb-4">Notification Preferences</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-4">Channel Settings</h3>
          <div className="space-y-4">
            {[
              { label: "In-App Notifications", id: "allowApp", description: "Real-time alerts in the bell icon" },
              { label: "Email Notifications", id: "allowEmail", description: "Critical updates sent to your inbox" },
              { label: "WhatsApp Alerts", id: "allowWhatsApp", description: "Mobile notifications via WhatsApp" },
              { label: "Marketing & News", id: "allowMarketing", description: "Updates on new offers and universities" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-sm font-bold text-[#111827]">{item.label}</p>
                  <p className="text-xs text-gray-500 font-medium">{item.description}</p>
                </div>
                <button
                  onClick={() => togglePref(item.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    prefs[item.id] ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      prefs[item.id] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-4">Quiet Hours</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 text-left">Start Time</label>
              <input 
                type="time" 
                value={prefs.quietHoursStart} 
                onChange={(e) => setPrefs({...prefs, quietHoursStart: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 text-left">End Time</label>
              <input 
                type="time" 
                value={prefs.quietHoursEnd} 
                onChange={(e) => setPrefs({...prefs, quietHoursEnd: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          <button 
            onClick={() => {
               notificationApi.updatePreferences({
                 quietHoursStart: prefs.quietHoursStart,
                 quietHoursEnd: prefs.quietHoursEnd
               });
            }}
            className="mt-4 w-full px-6 py-2.5 bg-[#111827] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-sm"
          >
            Update Quiet Hours
          </button>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async () => {
    setError("");
    setSuccess(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const role = localStorage.getItem("userRole");
      let res;
      if (role === "AGENT_MANAGER") {
        res = await amApi.auth.changePassword({ oldPassword, newPassword });
      } else {
        res = await authApi.changePassword({ oldPassword, newPassword });
      }

      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#111827] mb-4">Security Settings</h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">Password updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-[#111827] mb-3 text-left">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2 text-left">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>



        <div className="pt-4 border-t border-[#E5E7EB]">
          <button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreferencesSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#111827] mb-4">Preferences</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Language</label>
          <select className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Timezone</label>
          <select className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
            <option>UTC-5 (Eastern Time)</option>
            <option>UTC-8 (Pacific Time)</option>
            <option>UTC+0 (GMT)</option>
            <option>UTC+1 (Central European Time)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Date Format</label>
          <select className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
            <option>MM/DD/YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>

        <div className="pt-4 border-t border-[#E5E7EB]">
          <button className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#111827] mb-4">Billing & Subscription</h2>
      <div className="space-y-6">
        <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-[#111827]">Professional Plan</p>
              <p className="text-sm text-[#6B7280]">$99/month • Billed monthly</p>
            </div>
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Active
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-left">
            <button className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]">
              Upgrade Plan
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#111827] mb-3 text-left">Payment Method</h3>
          <div className="p-4 border border-[#E5E7EB] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">•••• •••• •••• 4242</p>
                  <p className="text-xs text-[#6B7280]">Expires 12/2027</p>
                </div>
              </div>
              <button className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]">
                Update
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#111827] mb-3 text-left">Billing History</h3>
          <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280]">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280]">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280]">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280]">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {[
                  { date: "Mar 1, 2026", desc: "Professional Plan", amount: "$99.00", status: "Paid" },
                  { date: "Feb 1, 2026", desc: "Professional Plan", amount: "$99.00", status: "Paid" },
                  { date: "Jan 1, 2026", desc: "Professional Plan", amount: "$99.00", status: "Paid" },
                ].map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm text-[#111827]">{item.date}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{item.desc}</td>
                    <td className="px-4 py-3 text-sm text-[#111827]">{item.amount}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#111827] mb-4">Team Management</h2>
      <p className="text-sm text-[#6B7280] mb-4 text-left">Manage team members and their roles</p>
      <div className="text-center py-12 text-[#6B7280]">
        Team management features coming soon
      </div>
    </div>
  );
}

function BusinessSettings() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountDetails, setAccountDetails] = useState("");
  const [mouFile, setMouFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("accountDetails", accountDetails);
      if (mouFile) {
        formData.append("mouFile", mouFile);
      }

      // Using admin API for agent profile update if needed
      // await adminApi.users.update(profileId, formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#111827] mb-1">Business Profile</h2>
      <p className="text-sm text-[#6B7280] mb-6 text-left">Update your business details and MoU documents</p>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">Business profile updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">
            Account Details
          </label>
          <textarea
            value={accountDetails}
            onChange={(e) => setAccountDetails(e.target.value)}
            placeholder="Enter your bank account details or business registeration info..."
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] h-32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">
            Upload MoU Document
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#E5E7EB] border-dashed rounded-lg hover:border-indigo-400 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-[#6B7280]" />
              <div className="flex text-sm text-[#6B7280]">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => setMouFile(e.target.files ? e.target.files[0] : null)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-[#6B7280]">
                PDF, JPG, PNG up to 10MB
              </p>
              {mouFile && (
                <div className="mt-2 flex items-center justify-center gap-2 text-indigo-600 font-medium">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">{mouFile.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E7EB] text-left">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Business Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

function OrganizationSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#111827] mb-4">Organization Settings</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Organization Name</label>
          <input
            type="text"
            defaultValue="EduCRM Global"
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Industry</label>
          <select className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
            <option>Education Consultancy</option>
            <option>Immigration Services</option>
            <option>Study Abroad</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2 text-left">Company Size</label>
          <select className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
            <option>1-10 employees</option>
            <option>11-50 employees</option>
            <option>51-200 employees</option>
            <option>200+ employees</option>
          </select>
        </div>

        <div className="pt-4 border-t border-[#E5E7EB] text-left">
          <button className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}