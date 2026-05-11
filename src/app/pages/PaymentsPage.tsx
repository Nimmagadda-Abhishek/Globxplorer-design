import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Search, Filter, MoreHorizontal, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { RecordPaymentModal } from "../components/modals/RecordPaymentModal";
import { PaymentRequestModal } from "../components/modals/PaymentRequestModal";
import { adminApi } from "../../lib/api";

export function PaymentsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        adminApi.payments.list(),
        adminApi.payments.getSummary()
      ]);

      const rawTransactions = Array.isArray(paymentsRes.data) ? paymentsRes.data : (paymentsRes.data?.payments || []);
      const mappedTransactions = rawTransactions.map((tx: any) => {
        let status = tx.status || "Pending";
        if (status === "Created") status = "Failed"; // Mark created as failed per user request
        
        return {
          id: tx.gxId || tx._id || "N/A",
          student: tx.studentName || tx.studentId?.name || tx.studentId || "Student",
          amount: tx.amount ? `₹${tx.amount.toLocaleString()}` : "₹0",
          status: status,
          date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "N/A",
          _id: tx._id
        };
      });

      setTransactions(mappedTransactions);

      // Normalize summary data
      const summaryData = Array.isArray(summaryRes.data) ? summaryRes.data : [];
      const stats = {
        totalRevenue: `₹${summaryData
          .filter(s => s._id === "Paid" || s._id === "Completed")
          .reduce((sum, s) => sum + (s.total || 0), 0)
          .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        todaysPayments: `₹${(summaryData.find(s => s._id === "Paid")?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pendingPayments: `₹${summaryData.find(s => s._id === "Pending")?.total?.toLocaleString() || "0"}`,
        failedCount: (summaryData.find(s => s._id === "Failed")?.count || 0) + 
                     (summaryData.find(s => s._id === "Created")?.count || 0),
        trends: {
          revenue: "+0%",
          today: "+0%",
          pending: "0%",
          failed: "0%"
        }
      };
      setSummary(stats);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Payment Panel</h1>
          <p className="text-sm text-[#6B7280]">Track revenue, student payments, and financial status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowRequestModal(true)}
            className="px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors"
          >
            Request Payment
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-[#4F46E5] rounded-xl text-sm font-bold text-white hover:bg-[#4338CA] transition-colors shadow-lg shadow-indigo-100"
          >
            Record Payment
          </button>
        </div>
      </div>

      {showRequestModal && (
        <PaymentRequestModal 
          onClose={() => setShowRequestModal(false)} 
          onSuccess={fetchPayments}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: summary?.totalRevenue || "$0", icon: DollarSign, color: "text-green-600", bg: "bg-green-50", trend: summary?.trends?.revenue || "+0%" },
          { label: "Today's Payments", value: summary?.todaysPayments || "$0", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50", trend: summary?.trends?.today || "+0%" },
          { label: "Pending Payments", value: summary?.pendingPayments || "$0", icon: Clock, color: "text-orange-600", bg: "bg-orange-50", trend: summary?.trends?.pending || "0%" },
          { label: "Failed Transactions", value: summary?.failedCount || "0", icon: XCircle, color: "text-red-600", bg: "bg-red-50", trend: summary?.trends?.failed || "0%" },
        ].map((stat, i) => (

          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${stat.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black text-[#111827]">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between gap-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by GX ID or Name..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
          <button className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#6B7280] hover:bg-gray-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
            </div>
          )}

          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-5 text-sm font-bold text-[#6B7280]">{tx.id}</td>
                  <td className="px-6 py-5 text-sm font-black text-[#111827]">{tx.student}</td>
                  <td className="px-6 py-5 text-sm font-black text-[#111827]">{tx.amount}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {tx.status === "Paid" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : tx.status === "Pending" ? <Clock className="w-4 h-4 text-orange-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-[10px] font-black uppercase ${
                        tx.status === "Paid" ? "text-green-600" : tx.status === "Pending" ? "text-orange-600" : "text-red-600"
                      }`}>{tx.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-[#6B7280]">{tx.date}</td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <RecordPaymentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchPayments} />
    </div>
  );
}
