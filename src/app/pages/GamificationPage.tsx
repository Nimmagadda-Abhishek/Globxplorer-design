import { Trophy, Star, TrendingUp, Users, Medal, Zap, Target, Award, Gift, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api";

export function GamificationPage() {
  const [gamificationData, setGamificationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamification();
  }, []);

  const fetchGamification = async () => {
    setLoading(true);
    try {
      const res = await adminApi.system.getGamification();
      setGamificationData(res.data);
    } catch (err) {
      console.error("Failed to fetch gamification data:", err);
    } finally {
      setLoading(false);
    }
  };

  const leaderboard = gamificationData?.leaderboard || [];


  const podium = [
    { rank: 2, name: leaderboard[1]?.name || "-", xp: leaderboard[1]?.points || "-", h: "h-32" },
    { rank: 1, name: leaderboard[0]?.name || "-", xp: leaderboard[0]?.points || "-", h: "h-44" },
    { rank: 3, name: leaderboard[2]?.name || "-", xp: leaderboard[2]?.points || "-", h: "h-24" },
  ];

  return (
    <div className="space-y-8 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
           <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Gamification Panel</h1>
          <p className="text-sm text-[#6B7280]">Track XP points, streaks, and employee leaderboards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Leaderboard of the Week</h3>
              <p className="text-indigo-100 text-sm mb-8">{leaderboard[0]?.name || "-"} is currently leading with {leaderboard[0]?.points || "0"} points!</p>
              <div className="flex items-end justify-between gap-4">
                {podium.map((p) => (
                  <div key={p.rank} className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full border-2 border-white/30 flex items-center justify-center font-bold">{p.name ? p.name[0] : "?"}</div>
                    <div className={`w-full ${p.h} bg-white/10 rounded-t-2xl border-x border-t border-white/20 flex flex-col items-center justify-end p-4`}>
                      <span className="text-lg font-black">{p.xp}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Rank #{p.rank}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Trophy className="absolute -right-8 -bottom-8 w-64 h-64 text-white/5 rotate-12" />
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#F3F4F6]">
              <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">Top Performers</h3>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {leaderboard.map((user: any) => (
                <div key={user.rank} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' : user.rank === 2 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      {user.rank === 1 ? <Medal className="w-4 h-4" /> : user.rank}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{user.name}</p>
                      <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12 text-right">
                    <div>
                      <p className="text-sm font-black text-[#4F46E5]">{user.points}</p>
                      <p className="text-[10px] text-[#9CA3AF] font-bold uppercase">Points</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-black text-orange-500">{user.streak}</p>
                      <p className="text-[10px] text-[#9CA3AF] font-bold uppercase">Streak</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider mb-6">Current Rewards</h3>
            <div className="space-y-4">
              {[
                { label: "Amazon Gift Card", cost: "5000 XP", icon: Gift, color: "text-orange-500" },
                { label: "Paid Leave Day", cost: "12000 XP", icon: Award, color: "text-blue-500" },
                { label: "Performance Bonus", cost: "25000 XP", icon: Target, color: "text-green-500" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-50 rounded-xl bg-[#F9FAFB]">
                  <div className={`p-2 rounded-lg bg-white shadow-sm ${r.color}`}>
                    <r.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#111827]">{r.label}</p>
                    <p className="text-[10px] font-black text-[#4F46E5]">{r.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#EEF2FF] p-6 rounded-2xl border border-[#C7D2FE]">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-[#4F46E5] fill-[#4F46E5]" />
              <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">Your Stats</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                  <span className="text-[#6B7280]">Level {gamificationData?.userLevel || 0}</span>
                  <span className="text-[#4F46E5]">{gamificationData?.userXP || 0} / {gamificationData?.nextLevelXP || 100} XP</span>
                </div>
                <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${(gamificationData?.userXP / gamificationData?.nextLevelXP) * 100}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-center px-4">
                  <p className="text-lg font-black text-[#111827]">{gamificationData?.badgesCount || 0}</p>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Badges</p>
                </div>
                <div className="w-px h-8 bg-indigo-200" />
                <div className="text-center px-4">
                  <p className="text-lg font-black text-[#111827]">{gamificationData?.userRank || "-"}</p>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Rank</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

