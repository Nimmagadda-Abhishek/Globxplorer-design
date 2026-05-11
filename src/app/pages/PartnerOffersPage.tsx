import { Gift, Plane, Home, GraduationCap, DollarSign, Heart, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api";

export function PartnerOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.system.getOffers();
      setOffers(res.data?.offers || []);
    } catch (err) {
      console.error("Failed to fetch partner offers:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
           <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Partner Offers</h1>
          <p className="text-sm text-[#6B7280]">Manage exclusive offers from loans, flights, and accommodation partners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-[#9CA3AF] font-bold">No partner offers found.</div>
        )}

        {offers.map((offer, i) => (
          <div 
            key={i} 
            onClick={() => window.open('https://globxplorer.com', '_blank')}
            className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden group hover:border-[#4F46E5] transition-all cursor-pointer"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#EEF2FF] rounded-xl text-[#4F46E5]">
                  {offer.category === "Edu Loans" ? <DollarSign className="w-6 h-6" /> : offer.category === "Flights" ? <Plane className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                  offer.status === "Active" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                }`}>
                  {offer.status}
                </span>
              </div>
              <h4 className="text-lg font-black text-[#111827] mb-1">{offer.partner}</h4>
              <p className="text-xs font-bold text-[#6B7280] mb-6 tracking-wide uppercase">{offer.category}</p>
              <div className="bg-[#F9FAFB] p-4 rounded-xl mb-6">
                <p className="text-sm font-bold text-[#4F46E5]">{offer.offer}</p>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9CA3AF]">
                    <Clock className="w-3.5 h-3.5" />
                    {offer.expires}
                 </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); alert('Marked as Inactive'); }}
                      className="p-2 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); alert('Marked as Active'); }}
                      className="p-2 text-[#9CA3AF] hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
