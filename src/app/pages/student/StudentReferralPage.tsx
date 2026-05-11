import { 
  Gift, 
  Share2, 
  QrCode, 
  Copy, 
  Users, 
  TrendingUp, 
  Wallet, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Send,
  Smartphone
} from "lucide-react";

export function StudentReferralPage() {
  const stats = [
    { label: "Total Referrals", value: "0", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Earned Rewards", value: "₹0", icon: Wallet, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Rewards", value: "₹0", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Conversion Rate", value: "0%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const recentReferrals: any[] = [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Refer & Earn</h1>
          <p className="text-slate-500 mt-1 font-medium">Invite your friends and earn rewards for every successful admission.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
           <Gift className="w-4 h-4" />
           <span className="text-xs font-black uppercase tracking-widest">Rewards Program Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
             <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                 <div>
                    <h2 className="text-3xl font-black mb-4">Share the Success</h2>
                    <p className="text-slate-400 font-medium leading-relaxed mb-8">
                      Your friends get a 10% discount on processing fees, and you earn up to ₹5000 per referral. It's a win-win!
                    </p>
                    <div className="space-y-4">
                       <div className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Your Unique Link</p>
                          <div className="flex items-center justify-between gap-4">
                             <span className="text-xs font-bold text-slate-200 truncate">globxplorer.com/ref/{localStorage.getItem("gxId") || "YOUR-ID"}</span>
                             <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
                          </div>
                       </div>
                       <div className="flex gap-3">
                          <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                             <Share2 className="w-4 h-4" /> Share Link
                          </button>
                          <button className="px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                             <Send className="w-4 h-4" /> WhatsApp
                          </button>
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem]">
                    <div className="w-48 h-48 bg-white p-4 rounded-3xl mb-4 shadow-xl">
                       <QrCode className="w-full h-full text-slate-900" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your QR Code</p>
                    <button className="mt-4 flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest hover:underline">
                       <Smartphone className="w-4 h-4" /> Download QR
                    </button>
                 </div>
              </div>
              
              <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
           </div>

           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">Recent Referrals</h3>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-slate-50">
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward</th>
                       </tr>
                    </thead>
                    <tbody>
                       {recentReferrals.map((row, i) => (
                         <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 font-black text-sm text-slate-900">{row.name}</td>
                            <td className="py-4 text-xs font-bold text-slate-500">{row.date}</td>
                            <td className="py-4">
                               <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                 row.status === 'Successful' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                               }`}>
                                 {row.status}
                               </span>
                            </td>
                            <td className="py-4 text-right font-black text-sm text-indigo-600">{row.reward}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">How it works</h3>
              <div className="space-y-8">
                 {[
                   { step: "01", title: "Share Link", desc: "Send your unique link or QR code to your friends." },
                   { step: "02", title: "Friend Applies", desc: "They use your referral to start their application." },
                   { step: "03", title: "Application Approved", desc: "Once their visa is approved, you get rewarded." },
                   { step: "04", title: "Earn Rewards", desc: "Withdraw your rewards directly to your wallet." }
                 ].map((s, i) => (
                   <div key={i} className="flex gap-4">
                      <span className="text-2xl font-black text-slate-100">{s.step}</span>
                      <div>
                         <h4 className="text-sm font-black text-slate-900">{s.title}</h4>
                         <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 text-white">
              <Wallet className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-black mb-2">Redeem Rewards</h3>
              <p className="text-sm font-medium text-indigo-100 mb-6">You have ₹0 available for withdrawal.</p>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-[2rem] font-black text-sm hover:bg-indigo-50 transition-colors shadow-xl">
                 Withdraw to Bank
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
