import { useState, useEffect } from "react";
import { Tag, Globe, Calendar, ArrowRight, Gift } from "lucide-react";
import { supportApi } from "../../lib/api";

export function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res: any = await supportApi.getOffers();
        const data = Array.isArray(res) ? res : (res.data || res.offers || []);
        setOffers(data);
      } catch (err) {
        console.error("Failed to fetch offers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (loading) return <div className="p-6">Loading offers...</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">Exclusive Offers</h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">Boost your conversions with our latest promotions and student deals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length > 0 ? (
          offers.map((offer) => (
            <div key={offer._id || offer.id} className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Gift className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${offer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {offer.isActive ? 'Active' : 'Expired'}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-[#111827] mb-2 group-hover:text-indigo-600 transition-colors">
                  {offer.title}
                </h3>
                <p className="text-sm text-[#6B7280] line-clamp-2 mb-4">
                  {offer.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-[#F3F4F6]">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#4B5563]">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <span>Target: {offer.countryTarget || 'All Countries'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#4B5563]">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>Valid until: {offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString() : 'Limited Time'}</span>
                  </div>
                </div>

                <button className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-semibold hover:bg-[#4338CA] transition-colors">
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-[#E5E7EB]">
            <Tag className="w-12 h-12 text-[#E5E7EB] mx-auto mb-3" />
            <p className="text-[#6B7280] font-medium">No active offers at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
