import { useState, useEffect } from "react";
import { CreditCard, DollarSign, Building2, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { alumniApi } from "../../../lib/api";

export function AlumniStudentPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, payRes, profRes] = await Promise.all([
          alumniApi.payments.getSummary().catch(() => null),
          alumniApi.payments.getAll().catch(() => null),
          alumniApi.profile.get().catch(() => null)
        ]);

        if (sumRes?.data) setSummary(sumRes.data);
        if (payRes?.data) setPayments(payRes.data);
        if (profRes?.profile) setProfile(profRes.profile);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateBank = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      accountName: formData.get('accountName'),
      accountNumber: formData.get('accountNumber'),
      bankName: formData.get('bankName'),
      ifscCode: formData.get('ifscCode'),
    };

    try {
      setLoading(true);
      const res = await alumniApi.payments.updateBankDetails(data);
      if (res.profile) {
        alert("Bank details updated successfully!");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update bank details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-inner">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-blue-900">Secure Payout Guarantee</h2>
            <p className="text-sm font-medium text-blue-700 mt-1 max-w-2xl">
              All student payments are securely held in our escrow system. We record every transaction meticulously, 
              and funds are initiated for transfer to your bank account only when the student marks the service 
              as <strong>Completed</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payments & Earnings</h1>
          <p className="text-slate-500 mt-1 font-medium">Track your commissions and manage payout details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Earned", value: `₹${summary?.totalEarned || 0}`, icon: DollarSign, color: "text-violet-600", bg: "bg-violet-100" },
          { label: "Pending Payout", value: `₹${summary?.pendingPayout || 0}`, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "This Month", value: `₹${summary?.thisMonth || 0}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
          { label: "Referrals", value: `₹${summary?.referralEarnings || 0}`, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-100" }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Payment History</h3>
          </div>
          
          <div className="space-y-4">
            {payments.map((p, i) => (
              <div key={i} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl hover:bg-slate-50">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{p.service}</h4>
                  <p className="text-xs text-slate-500 font-medium">{p.date}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-black text-slate-900">₹{p.amount}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${p.status === 'Cleared' ? 'text-green-600' : 'text-amber-600'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Payout Details</h3>
          </div>
          
          <form onSubmit={handleUpdateBank} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Account Name</label>
              <input 
                name="accountName"
                type="text" 
                defaultValue={profile?.alumniDetails?.payoutBankDetails?.accountName || ""} 
                className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Account Number</label>
              <input 
                name="accountNumber"
                type="text" 
                defaultValue={profile?.alumniDetails?.payoutBankDetails?.accountNumber || ""} 
                className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Bank</label>
                <input 
                  name="bankName"
                  type="text" 
                  defaultValue={profile?.alumniDetails?.payoutBankDetails?.bankName || ""} 
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">IFSC</label>
                <input 
                  name="ifscCode"
                  type="text" 
                  defaultValue={profile?.alumniDetails?.payoutBankDetails?.ifscCode || ""} 
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" 
                />
              </div>
            </div>
            <button type="submit" className="w-full mt-4 bg-violet-600 text-white font-black py-3 rounded-xl hover:bg-violet-700 transition-colors">
              Update Bank Details
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
