import { Globe, Video, Megaphone, Users, Image as ImageIcon, MessageSquare, Plus, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateContentModal } from "../components/modals/CreateContentModal";
import { adminApi } from "../../lib/api";

export function MarketingPage() {
  const [marketingData, setMarketingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMarketing();
  }, []);

  const fetchMarketing = async () => {
    setLoading(true);
    try {
      const res = await adminApi.system.getMarketing();
      setMarketingData(res.data);
    } catch (err) {
      console.error("Failed to fetch marketing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const marketingItems = [
    { title: "Landing Pages", desc: "Manage country-specific pages", count: `${marketingData?.landingPagesCount || 0} Pages`, icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Webinar Funnels", desc: "Upcoming and past webinars", count: `${marketingData?.webinarsCount || 0} Active`, icon: Video, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Parent Ads", desc: "Targeted advertising creative", count: `${marketingData?.adsCount || 0} Active`, icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Testimonials", desc: "Student video & text reviews", count: `${marketingData?.testimonialsCount || 0} Total`, icon: MessageSquare, color: "text-green-600", bg: "bg-green-50" },
    { title: "Gallery", desc: "Student photos & events", count: `${marketingData?.galleryCount || 0} Photos`, icon: ImageIcon, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Authority Content", desc: "Blogs, guides, and SOPs", count: `${marketingData?.articlesCount || 0} Articles`, icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
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
          <h1 className="text-2xl font-black text-[#111827]">Content / Marketing</h1>
          <p className="text-sm text-[#6B7280]">Manage landing pages, webinars, and marketing assets.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-[#4F46E5] rounded-xl text-sm font-bold text-white hover:bg-[#4338CA] transition-shadow shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Content
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketingItems.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <item.icon className="w-6 h-6" />
              </div>
              <ExternalLink 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('https://GlobXplore.com', '_blank');
                }}
                className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#4F46E5] transition-colors cursor-pointer" 
              />
            </div>
            <h4 className="text-lg font-black text-[#111827] mb-1">{item.title}</h4>
            <p className="text-xs text-[#6B7280] mb-4">{item.desc}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
               <span className="text-[10px] font-black text-[#4F46E5] uppercase tracking-widest">{item.count}</span>
               <button 
                 onClick={() => setShowAddModal(true)}
                 className="text-xs font-bold text-[#111827] underline"
               >
                 Manage
               </button>
            </div>
          </div>
        ))}
      </div>
      <CreateContentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchMarketing} />
    </div>
  );
}


