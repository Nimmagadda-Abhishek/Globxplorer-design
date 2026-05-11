import { useState, useEffect } from "react";
import { ShoppingBag, CheckCircle2, XCircle, MessageSquare, Loader2, CreditCard } from "lucide-react";
import { alumniApi } from "../../../lib/api";
import { Link } from "react-router";

export function AlumniBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await alumniApi.services.getBookings().catch(() => null);
      if (res?.data) {
        setBookings(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Bookings</h1>
          <p className="text-slate-500 mt-1 font-medium">Track students who have booked your premium services.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Active Bookings</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No bookings found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="border border-slate-100 rounded-2xl p-5 hover:border-violet-100 hover:bg-violet-50/20 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center font-black text-lg">
                    {booking.user?.name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${booking.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {booking.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${booking.paymentStatus === 'Paid' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
                
                <h4 className="text-lg font-black text-slate-900">{booking.user?.name || 'Unknown Student'}</h4>
                <p className="text-sm font-bold text-violet-600">{booking.serviceName}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Booked on {new Date(booking.createdAt).toLocaleDateString()}</p>
                
                <div className="mt-4 p-3 bg-white rounded-xl border border-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                    <span className="text-sm font-black text-slate-900">₹{booking.cost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payout</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${booking.isFundTransferred ? 'text-green-600' : 'text-amber-600'}`}>
                      {booking.isFundTransferred ? 'Transferred' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Link 
                    to={`/alumni/communication?studentId=${booking.user?._id}&serviceId=${booking.serviceId}`} 
                    className="flex-1 bg-violet-600 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </Link>
                  {booking.paymentStatus === 'Paid' && !booking.isCompleted && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 px-2">
                      <CreditCard className="w-3 h-3" /> Paid
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
