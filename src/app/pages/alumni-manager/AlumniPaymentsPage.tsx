import { useState, useEffect } from "react";
import { CreditCard, Search, Loader2, ArrowUpRight, CheckCircle2, Download } from "lucide-react";
import { alumniManagerApi } from "../../../lib/api";

export function AlumniPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPayouts = async () => {
    try {
      setPayoutLoading(true);
      const res = await alumniManagerApi.payments.getPayoutRequests();
      if (res.success) {
        setPayouts(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch payouts", err);
    } finally {
      setPayoutLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // We only care about payouts (student to alumni payments) now
        await fetchPayouts();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTransferClick = (payout: any) => {
    setSelectedPayout(payout);
    setShowModal(true);
  };

  const confirmTransfer = async () => {
    if (!selectedPayout) return;
    try {
      const res = await alumniManagerApi.payments.transferFunds(selectedPayout._id);
      if (res.success) {
        alert(res.message || "Funds marked as transferred!");
        setShowModal(false);
        fetchPayouts();
      }
    } catch (err: any) {
      alert(err.message || "Failed to process transfer");
    }
  };

  const handleExport = async () => {
    alert("Exporting payments report to Excel...");
    // Ideally this would trigger alumniManagerApi.reports.export('revenue', 'excel') and initiate a download.
  };

  const filteredPayments = payments.filter(p =>
    (p.gxId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.razorpayOrderId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payments & Revenue</h1>
          <p className="text-slate-500 mt-1 font-medium">Track monetized services and overall revenue.</p>
        </div>
        <button onClick={handleExport} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm text-teal-600">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Student Payments</p>
          <div className="flex items-end gap-3 mt-2">
            <h3 className="text-3xl font-black text-slate-900">₹{payouts.reduce((sum, p) => sum + (p.cost || 0), 0)}</h3>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Payouts</p>
          <div className="flex items-end gap-3 mt-2">
            <h3 className="text-3xl font-black text-slate-900">₹{payouts.filter(p => !p.isFundTransferred).reduce((sum, p) => sum + (p.cost || 0), 0)}</h3>
            <span className="text-xs font-bold text-slate-400 mb-1">({payouts.filter(p => !p.isFundTransferred).length} requests)</span>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed Payouts</p>
          <div className="flex items-end gap-3 mt-2">
            <h3 className="text-3xl font-black text-teal-600">₹{payouts.filter(p => p.isFundTransferred).reduce((sum, p) => sum + (p.cost || 0), 0)}</h3>
            <span className="text-xs font-bold text-slate-400 mb-1">({payouts.filter(p => p.isFundTransferred).length} paid)</span>
          </div>
        </div>
      </div>

      {/* Payout Management Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Alumni Payout Requests</h3>
        </div>

        {payoutLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-teal-600 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest rounded-tl-2xl">Service / Student</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Alumni</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Service Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right rounded-tr-2xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-black text-slate-900">{p.serviceName}</p>
                      <p className="text-xs font-bold text-slate-400">Student: {p.user?.name || "N/A"}</p>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">{p.alumniId?.name || "N/A"}</td>
                    <td className="p-4 text-sm font-black text-slate-900">₹{p.cost}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${p.isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {p.isCompleted ? "Completed" : "In Progress"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {p.isFundTransferred ? (
                        <span className="text-xs font-black text-teal-600 uppercase flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Transferred
                        </span>
                      ) : (
                        <button
                          disabled={!p.isCompleted}
                          onClick={() => handleTransferClick(p)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${p.isCompleted ? 'bg-slate-900 text-white hover:bg-teal-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                          Transfer Funds
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payouts.length === 0 && <div className="text-center py-12 text-slate-500 font-medium">No payout requests found.</div>}
          </div>
        )}
      </div>

      {/* Transfer Confirmation Modal */}
      {showModal && selectedPayout && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Transfer Funds</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm Payment Details</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Service</span>
                  <span className="text-xs font-black text-slate-900">{selectedPayout.serviceName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Alumni</span>
                  <span className="text-xs font-black text-slate-900">{selectedPayout.alumniId?.name}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Amount to Pay</span>
                  <span className="text-lg font-black text-teal-600">₹{selectedPayout.cost}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bank Account Details</p>
                {selectedPayout.alumniId?.alumniDetails?.payoutBankDetails ? (
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 border border-slate-100 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Account Name</p>
                      <p className="text-sm font-black text-slate-900">{selectedPayout.alumniId.alumniDetails.payoutBankDetails.accountName}</p>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Account Number</p>
                      <p className="text-sm font-black text-slate-900 tracking-wider">{selectedPayout.alumniId.alumniDetails.payoutBankDetails.accountNumber}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 border border-slate-100 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Bank Name</p>
                        <p className="text-xs font-black text-slate-900">{selectedPayout.alumniId.alumniDetails.payoutBankDetails.bankName}</p>
                      </div>
                      <div className="p-3 border border-slate-100 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">IFSC Code</p>
                        <p className="text-xs font-black text-slate-900 uppercase">{selectedPayout.alumniId.alumniDetails.payoutBankDetails.ifscCode}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                    <p className="text-xs font-bold text-amber-700">No bank details found for this alumni.</p>
                    <p className="text-[10px] font-medium text-amber-600 mt-1">They need to update details in their portal.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmTransfer}
                  disabled={!selectedPayout.alumniId?.alumniDetails?.payoutBankDetails}
                  className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
