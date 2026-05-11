import { Search, MapPin, Globe, Briefcase, UserCheck, AlertCircle, Phone, ArrowUpRight, Filter, ChevronRight } from "lucide-react";
import { useState } from "react";
import { amApi } from "../../lib/api";

export function SearchBusinessPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res: any = await amApi.agents.search(query);
      if (res.exists) {
        setResults([res]);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm bg-gradient-to-br from-white to-indigo-50/20">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Business Duplicate Check</h1>
          <p className="text-sm text-[#6B7280] font-medium mt-1 mb-8">Search the global GX database to prevent duplicate agent enrollments and territory conflicts.</p>
          
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input 
              type="text"
              placeholder="Enter Business Name, GX ID or Phone..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5E7EB] rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4F46E5] transition-all shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 bg-[#111827] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
            >
              Verify
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
           <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
           <p className="text-sm font-black text-[#111827] uppercase tracking-widest">Searching GX Registry...</p>
        </div>
      ) : hasSearched ? (
        <div className="space-y-6">
          <h3 className="text-sm font-black text-[#111827] uppercase tracking-widest flex items-center gap-2">
             <Filter className="w-4 h-4 text-[#4F46E5]" />
             Search Results ({results.length})
          </h3>

          {results.length > 0 ? (
            results.map((res, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-orange-200 shadow-lg shadow-orange-50/50 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                       <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xl font-black text-[#111827] tracking-tight">{res.businessName}</h4>
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-full">Already Visited</span>
                       </div>
                       <div className="flex flex-wrap gap-4 text-xs font-bold text-[#6B7280]">
                          <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {res.gxId}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {res.location}</span>
                          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Established Partner</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#111827] hover:bg-gray-50 transition-all">View Details</button>
                    <button className="flex-1 md:flex-none px-6 py-3 bg-[#111827] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                       Contact AM
                       <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                 </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-emerald-200 text-center space-y-4 shadow-lg shadow-emerald-50/50 animate-in zoom-in-95">
               <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                  <UserCheck className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-black text-[#111827]">Business is Available!</h3>
               <p className="text-sm text-[#6B7280] font-medium max-w-sm mx-auto">This business is not registered in the GX database. You can proceed with enrollment.</p>
               <button className="px-8 py-4 bg-[#4F46E5] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-100">Enroll Business Now</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { title: "Territory Check", desc: "Instantly know if another manager is already working with this agent.", icon: Globe },
             { title: "Status Verification", desc: "Check current MOU and Partnership status across all branches.", icon: ShieldCheck },
             { title: "Direct Contact", desc: "Get in touch with the existing manager if area conflicts occur.", icon: Phone },
           ].map((card, i) => (
             <div key={i} className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-[#4F46E5] mb-4">
                   <card.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-[#111827] mb-2">{card.title}</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed font-medium">{card.desc}</p>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);
