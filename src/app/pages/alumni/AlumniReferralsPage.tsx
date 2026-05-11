import { useState, useEffect } from "react";
import { Link as LinkIcon, Copy, CheckCircle2, DollarSign, Users, Gift, Loader2, Award } from "lucide-react";
import { alumniApi } from "../../../lib/api";

export function AlumniReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [link, setLink] = useState("https://globxplorer.com/ref/GXAL123456");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, refRes, linkRes] = await Promise.all([
          alumniApi.referrals.getSummary().catch(() => null),
          alumniApi.referrals.getAll().catch(() => null),
          alumniApi.referrals.getLink().catch(() => null)
        ]);

        if (sumRes?.data) setSummary(sumRes.data);

        if (refRes?.data) setReferrals(refRes.data);

        if (linkRes?.data?.link) setLink(linkRes.data.link);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Referrals</h1>
          <p className="text-slate-500 mt-1 font-medium">Invite students and earn commissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-sm text-white">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2"><Gift className="w-5 h-5" /> Your Referral Link</h3>
            <p className="text-sm text-violet-200 mb-6">Share this link with students. You earn when they enroll.</p>
            
            <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-sm">
              <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm font-medium truncate">
                {link}
              </div>
              <button 
                onClick={handleCopy}
                className="bg-white text-violet-700 px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-violet-50 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Referrals</p>
                <h3 className="text-3xl font-black text-slate-900">{summary?.referralCount || 0}</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Earned</p>
                <h3 className="text-3xl font-black text-slate-900">₹{summary?.commissionEarned || 0}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-violet-600" /> Referral History
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-violet-600 animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                {referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                        {ref.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{ref.name}</h4>
                        <p className="text-xs font-medium text-slate-500">{ref.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-green-600">{ref.commission}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${ref.status === 'Enrolled' ? 'text-green-600' : 'text-amber-600'}`}>
                        {ref.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm h-fit">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Unlocked Benefits</h3>
          <p className="text-sm text-slate-500 mb-6">You earn perks as you refer more students.</p>
          
          <ul className="space-y-4">
            {summary?.benefitsUnlocked?.map((benefit: string, i: number) => (
              <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
