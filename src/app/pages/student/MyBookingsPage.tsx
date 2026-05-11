import { useState, useEffect } from "react";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Loader2, 
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { studentPortalApi } from "../../../lib/api";
import { AlumniChatModal } from "../../components/alumni/AlumniChatModal";

export function MyBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [chatTarget, setChatTarget] = useState<any>(null);

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload._id || '';
    } catch { return ''; }
  })();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await studentPortalApi.alumni.getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleMarkCompleted = async (bookingId: string) => {
    if (!confirm("Are you sure you want to mark this service as completed? This will authorize the fund transfer to the alumni.")) return;
    
    try {
      const res = await studentPortalApi.alumni.completeService(bookingId);
      if (res.success) {
        alert("Service marked as completed!");
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.message || "Failed to complete service");
    }
  };

  const openChat = (booking: any) => {
    setChatTarget({
      serviceId: booking.serviceId?._id || booking.serviceId,
      serviceName: booking.serviceName,
      otherUserId: booking.alumniId?._id || booking.alumniId,
      otherUserName: booking.alumniId?.name || 'Alumni',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Service Bookings</h1>
        <p className="text-slate-500 mt-1 font-medium">Track your active services and mark them as completed when done.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row gap-8 relative overflow-hidden">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{booking.serviceName}</h3>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Alumni: {booking.alumniId?.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">₹{booking.cost}</p>
                    <div className={`flex items-center gap-1 justify-end mt-1 ${booking.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>
                      <DollarSign className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase">{booking.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl text-sm font-medium text-slate-600 leading-relaxed">
                  {booking.description}
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                  {booking.isCompleted && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Completed</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-64 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                <button 
                  onClick={() => openChat(booking)}
                  className="w-full px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-black hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat with Alumni
                </button>
                
                {booking.paymentStatus === 'Paid' && !booking.isCompleted && (
                  <button 
                    onClick={() => handleMarkCompleted(booking._id)}
                    className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Completed
                  </button>
                )}

                {booking.isCompleted && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5" />
                    <p className="text-[10px] font-bold text-green-700 leading-tight uppercase">
                      Service Verified. Funds are being processed for the alumni.
                    </p>
                  </div>
                )}
                
                {booking.paymentStatus === 'Pending' && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-700 leading-tight uppercase">
                      Payment is required to start this service.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Briefcase className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900">No bookings yet</h3>
          <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
            You haven't booked any alumni services yet. Browse services to get started!
          </p>
          <button 
            onClick={() => window.location.href = "/student/alumni"}
            className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-sm hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-100"
          >
            Browse Services
          </button>
        </div>
      )}

      {chatTarget && (
        <AlumniChatModal
          serviceId={chatTarget.serviceId}
          serviceName={chatTarget.serviceName}
          otherUserId={chatTarget.otherUserId}
          otherUserName={chatTarget.otherUserName}
          currentUserId={currentUserId}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
}
