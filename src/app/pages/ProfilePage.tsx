 import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit2,
  Award,
  TrendingUp,
  CheckCircle2,
  Briefcase,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { amApi, userApi } from "../../lib/api";

export function ProfilePage() {
  const userName = localStorage.getItem("userName") || "Agent Manager";
  const gxId = localStorage.getItem("gxId") || "GXAM123456";
  const role = localStorage.getItem("userRole") || "AGENT_MANAGER";

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [editForm, setEditForm] = useState({
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [perfRes, profRes] = await Promise.all([
        role === "AGENT_MANAGER"
          ? amApi.analytics.getPerformance()
          : Promise.resolve({ data: null }),
        userApi.getProfile(),
      ]);

      setPerformance(perfRes.data);

      const profData = profRes.data || profRes;

      setProfile(profData);

      setEditForm({
        phone: profData.phone || "",
        address: profData.address || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile and performance data", err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const res = await userApi.updateProfile(editForm);

      setProfile(res.data || res);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile?.name || userName;

  const roleLabel = role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char: string) => char.toUpperCase());

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-5 sm:space-y-6 lg:space-y-8 pb-10">

      {/* =========================================================
          PROFILE HEADER
      ========================================================= */}
      <section className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">

        {/* Cover */}
        <div className="h-24 sm:h-32 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        {/* Header Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-6">

            {/* Identity */}
            <div className="flex-1 min-w-0">

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">

                <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight truncate">
                  {displayName}
                </h1>

                <span className="w-fit px-3 py-1.5 bg-indigo-50 text-[#4F46E5] text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                  {roleLabel}
                </span>

              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mt-2 text-sm text-[#6B7280]">

                <span className="font-bold text-[#111827]">
                  {gxId}
                </span>

                <span className="hidden sm:block w-1 h-1 bg-[#D1D5DB] rounded-full" />

                <span className="truncate">
                  {profile?.address || "Location not provided"}
                </span>

              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">

              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);

                      setEditForm({
                        phone: profile?.phone || "",
                        address: profile?.address || "",
                      });
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-[#E5E7EB] rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-widest text-[#111827] hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#4F46E5] text-white rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-100 disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Profile"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-white border border-[#E5E7EB] rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-widest text-[#111827] hover:bg-gray-50 transition-all shadow-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}

            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">

        {/* =======================================================
            LEFT COLUMN
        ======================================================= */}
        <div className="lg:col-span-1 space-y-5 sm:space-y-6 lg:space-y-8">

          {/* PERSONAL DETAILS */}
          <section className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-sm">

            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4 mb-5 sm:mb-6">
              <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest">
                Personal Details
              </h3>
            </div>

            <div className="space-y-5">

              {/* Email */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-[#6B7280]">
                  <Mail className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                    Email Address
                  </p>

                  <p className="text-sm font-bold text-[#111827] break-all mt-1">
                    {profile?.email || "manager@globxplore.com"}
                  </p>
                </div>
              </div>


              {/* Phone */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-[#6B7280]">
                  <Phone className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                    Phone Number
                  </p>

                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          phone: e.target.value,
                        })
                      }
                      className="mt-1 w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-lg text-sm font-bold text-[#111827] outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-sm font-bold text-[#111827] mt-1">
                      {profile?.phone || "+91 98765 43210"}
                    </p>
                  )}
                </div>
              </div>


              {/* Location */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-[#6B7280]">
                  <MapPin className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                    Location
                  </p>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: e.target.value,
                        })
                      }
                      className="mt-1 w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-lg text-sm font-bold text-[#111827] outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                      placeholder="Enter location"
                    />
                  ) : (
                    <p className="text-sm font-bold text-[#111827] mt-1 break-words">
                      {role === "AGENT" &&
                      profile?.agentDetails?.businessAreaName
                        ? profile.agentDetails.businessAreaName
                        : profile?.address || "Bangalore, India"}
                    </p>
                  )}
                </div>
              </div>


              {/* Joined */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-[#6B7280]">
                  <Calendar className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                    Joined On
                  </p>

                  <p className="text-sm font-bold text-[#111827] mt-1">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "12 Jan, 2024"}
                  </p>
                </div>
              </div>

            </div>
          </section>


          {/* AGENT BUSINESS DETAILS */}
          {role === "AGENT" && profile?.agentDetails && (
            <section className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-sm">

              <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest border-b border-[#F3F4F6] pb-4 mb-5 sm:mb-6">
                Business Details
              </h3>

              <div className="space-y-5">

                <InfoRow
                  icon={<Briefcase className="w-5 h-5" />}
                  label="Business Name"
                  value={profile.agentDetails.businessName}
                />

                <InfoRow
                  icon={<MapPin className="w-5 h-5" />}
                  label="Business Area"
                  value={profile.agentDetails.businessAreaName}
                />

                <InfoRow
                  icon={<Shield className="w-5 h-5" />}
                  label="Account Status"
                  value={profile.agentDetails.agentStatus}
                  uppercase
                />

                <InfoRow
                  icon={<FileText className="w-5 h-5" />}
                  label="MOU Status"
                  value={profile.agentDetails.mouStatus}
                />

              </div>
            </section>
          )}


          {/* MANAGER ACHIEVEMENT */}
          {role === "AGENT_MANAGER" ? (
            <section className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-indigo-100">

              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-md">
                <Award className="w-6 h-6 text-white" />
              </div>

              <h4 className="text-xl font-black mb-2 tracking-tight">
                Elite Manager
              </h4>

              <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6">
                You are in the top 5% of agent managers this quarter.
                Keep up the great work!
              </p>

              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                View Achievements
              </button>

            </section>
          ) : (
            role === "AGENT" &&
            profile?.agentDetails?.tierDetails && (
              <section className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-sm p-5 sm:p-6 lg:p-8">

                <h2 className="text-xl font-black text-[#111827] mb-2 flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-500" />

                  {profile.agentDetails.tierDetails.badge} Tier
                </h2>

                <p className="text-sm text-[#4B5563] font-bold mb-1">
                  {profile.agentDetails.tierDetails.name}
                </p>

                <p className="text-xs text-[#6B7280] mb-6">
                  {profile.agentDetails.tierDetails.bonus ||
                    profile.agentDetails.tierDetails.description}
                </p>

                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-bold text-[#4B5563]">
                      Progress to Next Tier
                    </span>

                    <span className="text-xs font-black text-[#111827] whitespace-nowrap">
                      {profile.agentDetails.tierDetails.currentCount} /{" "}
                      {profile.agentDetails.tierDetails.nextTierAt || "MAX"}
                    </span>
                  </div>

                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                      style={{
                        width: `${
                          profile.agentDetails.tierDetails.nextTierAt
                            ? Math.min(
                                100,
                                (profile.agentDetails.tierDetails.currentCount /
                                  profile.agentDetails.tierDetails.nextTierAt) *
                                  100
                              )
                            : 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

              </section>
            )
          )}

        </div>


        {/* =======================================================
            RIGHT COLUMN
        ======================================================= */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 lg:space-y-8">

          {/* STATS */}
          {stats.length > 0 && (
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>

                  <p className="text-[9px] sm:text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>

                  <h4 className="text-xl sm:text-2xl font-black text-[#111827]">
                    {stat.value}
                  </h4>
                </div>
              ))}

            </div>
          )}


          {/* MANAGER PERFORMANCE */}
          {role === "AGENT_MANAGER" ? (
            <>
              <section className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-sm">

                <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Performance Growth
                </h3>

                <div className="space-y-7 sm:space-y-8">

                  <ProgressBar
                    label="Agent Recruitment Goal"
                    value={performance?.recruitmentCount || 0}
                    max={performance?.recruitmentGoal || 20}
                    display={`${performance?.recruitmentCount || 0} / ${
                      performance?.recruitmentGoal || 20
                    }`}
                    color="bg-indigo-600"
                  />

                  <ProgressBar
                    label="Student Conversion Rate"
                    value={performance?.conversionRate || 0}
                    max={100}
                    display={`${performance?.conversionRate || 0}%`}
                    color="bg-purple-600"
                  />

                  <ProgressBar
                    label="Follow-up Compliance"
                    value={performance?.complianceRate || 0}
                    max={100}
                    display={`${performance?.complianceRate || 0}%`}
                    color="bg-emerald-500"
                  />

                </div>
              </section>


              {/* ACCOMPLISHMENTS */}
              <section className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-sm">

                <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-5 sm:mb-6">
                  Recent Accomplishments
                </h3>

                <div className="space-y-3">

                  {[
                    "Successfully onboarded 'Global Education Hub' in North Area.",
                    "Achieved 100% follow-up completion for March 2024.",
                    "Facilitated 15+ student admissions in Canada universities.",
                    "Conducted area training for 5 new agents.",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 sm:p-4 bg-[#F9FAFB] rounded-xl sm:rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />

                      <p className="text-sm font-bold text-[#4B5563] leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}

                </div>
              </section>
            </>
          ) : (

            /* =====================================================
               AGENT COMMISSION STRUCTURE
            ===================================================== */
            <section className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-sm">

              <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Commission Tier Structure
              </h3>

              {/* Categories */}
              <div className="space-y-5">

                <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">
                  Category Wise Targets
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                  <TierCard
                    title="Starter (Bronze)"
                    subtitle="< 5 Students"
                    className="bg-orange-50 border-orange-100 text-orange-700"
                  />

                  <TierCard
                    title="Growth (Silver)"
                    subtitle="5 to 15 Students"
                    className="bg-slate-100 border-slate-200 text-slate-700"
                  />

                  <TierCard
                    title="Pro (Gold)"
                    subtitle="16 to 30 Students"
                    className="bg-amber-50 border-amber-200 text-amber-700"
                  />

                  <TierCard
                    title="Elite (Platinum)"
                    subtitle="31 to 100 Students"
                    className="bg-indigo-50 border-indigo-200 text-indigo-700"
                  />

                </div>


                {/* Bonuses */}
                <div className="pt-5 border-t border-[#F3F4F6] space-y-4">

                  <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">
                    Commission Bonuses
                  </h4>

                  <CommissionRow
                    title="Starter - Bronze"
                    subtitle="Basic"
                    value="Regular Commission"
                  />

                  <CommissionRow
                    title="Growth - Silver"
                    subtitle="Advanced"
                    value="+ ₹5K per student"
                    highlight
                  />

                  <CommissionRow
                    title="Pro - Gold"
                    subtitle="Professional"
                    value="+ ₹7K per student"
                    highlight
                  />

                  <CommissionRow
                    title="Elite - Platinum"
                    subtitle="Ultimate"
                    value="+ ₹10K per ALL students"
                    primary
                  />

                </div>

              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}


/* ===============================================================
   REUSABLE COMPONENTS
================================================================ */

function InfoRow({
  icon,
  label,
  value,
  uppercase = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
  uppercase?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">

      <div className="w-10 h-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-[#6B7280]">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
          {label}
        </p>

        <p
          className={`text-sm font-bold text-[#111827] mt-1 break-words ${
            uppercase ? "uppercase" : ""
          }`}
        >
          {value || "Not provided"}
        </p>
      </div>

    </div>
  );
}


function ProgressBar({
  label,
  value,
  max,
  display,
  color,
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  color: string;
}) {
  const percentage =
    max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div>

      <div className="flex items-center justify-between gap-4 mb-2">

        <span className="text-xs sm:text-sm font-bold text-[#4B5563]">
          {label}
        </span>

        <span className="text-xs font-black text-[#111827] whitespace-nowrap">
          {display}
        </span>

      </div>

      <div className="h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden">

        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>
    </div>
  );
}


function TierCard({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle: string;
  className: string;
}) {
  return (
    <div
      className={`p-4 rounded-xl sm:rounded-2xl border ${className}`}
    >
      <h4 className="text-sm font-black">
        {title}
      </h4>

      <p className="text-xs mt-1 font-medium opacity-80">
        {subtitle}
      </p>
    </div>
  );
}


function CommissionRow({
  title,
  subtitle,
  value,
  highlight = false,
  primary = false,
}: {
  title: string;
  subtitle: string;
  value: string;
  highlight?: boolean;
  primary?: boolean;
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl sm:rounded-2xl border ${
        primary
          ? "border-indigo-100 bg-indigo-50"
          : highlight
            ? "border-[#E5E7EB] bg-[#F9FAFB]"
            : "border-[#E5E7EB] bg-white"
      }`}
    >

      <div className="min-w-0">
        <h4 className="text-sm font-black text-[#111827]">
          {title}
        </h4>

        <p className="text-xs text-[#6B7280] mt-0.5">
          {subtitle}
        </p>
      </div>

      <span
        className={`text-sm font-bold sm:text-right ${
          primary || highlight
            ? "text-[#4F46E5]"
            : "text-[#4B5563]"
        }`}
      >
        {value}
      </span>

    </div>
  );
}
