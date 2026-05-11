import { useState, useEffect } from "react";
import { DollarSign, Tag, TrendingUp, TrendingDown, Save, Loader2, Info } from "lucide-react";
import { alumniManagerApi } from "../../../lib/api";

export function PricingControlPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Default values based on the prompt
  const [pricing, setPricing] = useState<any[]>([]);

  useEffect(() => {
    // Optionally fetch pricing from API
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const res = await alumniManagerApi.pricing.get().catch(() => null);
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setPricing(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const handlePriceChange = (id: number, newPrice: number) => {
    setPricing(pricing.map(p => p.id === id ? { ...p, currentPrice: newPrice } : p));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await alumniManagerApi.pricing.update(pricing);
      alert("Pricing catalog updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pricing Control</h1>
          <p className="text-slate-500 mt-1 font-medium">Regulate service costs and manage monetization parameters.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Catalog"}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900">Pricing Policy Notice</h4>
          <p className="text-xs font-medium text-amber-700 mt-1">
            Any changes to the service catalog will immediately reflect for all new student requests. Existing pending requests will retain their locked-in price.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Service Catalog</h3>
        </div>

        <div className="space-y-4">
          {pricing.map((item) => {
            const priceDiff = item.currentPrice - item.basePrice;
            return (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-slate-100 rounded-2xl hover:border-teal-100 hover:bg-teal-50/30 transition-all group">
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900">{item.service}</h4>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-1">Base recommended price: ₹{item.basePrice}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="number" 
                        value={item.currentPrice}
                        onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                        className="w-32 pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                      />
                    </div>
                    {priceDiff !== 0 && (
                      <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider ${priceDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {priceDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(priceDiff)} from base
                      </div>
                    )}
                  </div>
                  
                  <div className="w-14">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={item.active} onChange={() => {}} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
