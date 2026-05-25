import { Gift, Plane, Home, GraduationCap, DollarSign, Heart, CheckCircle2, XCircle, Clock, Loader2, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi, configApi } from "../../lib/api";

export function PartnerOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    countryTarget: "",
    isActive: true,
    expiresAt: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const role = localStorage.getItem("userRole");
  const canCreate = role === "ADMIN";

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

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMsg("Title and Description are required.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive
      };
      if (formData.countryTarget.trim()) {
        payload.countryTarget = formData.countryTarget.trim();
      }
      if (formData.expiresAt) {
        payload.expiresAt = new Date(formData.expiresAt).toISOString();
      }

      await configApi.createOffer(payload);

      setSuccessMsg("Offer successfully posted!");
      setFormData({
        title: "",
        description: "",
        countryTarget: "",
        isActive: true,
        expiresAt: ""
      });
      fetchOffers();
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccessMsg("");
      }, 1200);
    } catch (err: any) {
      console.error("Failed to create offer:", err);
      setErrorMsg(err.message || "Failed to post partner offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Partner Offers</h1>
          <p className="text-sm text-[#6B7280]">Manage exclusive offers from loans, flights, and accommodation partners.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setErrorMsg("");
              setSuccessMsg("");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#4338CA] transition-all hover:shadow-lg hover:shadow-indigo-100 active:scale-95 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4.5 h-4.5" />
            Post Partner Offer
          </button>
        )}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-[#9CA3AF] font-bold">No partner offers found.</div>
        )}

        {offers.map((offer, i) => (
          <div
            key={i}
            onClick={() => window.open('https://GlobXplore.com', '_blank')}
            className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden group hover:border-[#4F46E5] transition-all cursor-pointer"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#EEF2FF] rounded-xl text-[#4F46E5]">
                  {offer.category === "Edu Loans" ? <DollarSign className="w-6 h-6" /> : offer.category === "Flights" ? <Plane className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${offer.status === "Active" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                  }`}>
                  {offer.status}
                </span>
              </div>
              <h4 className="text-lg font-black text-[#111827] mb-1">{offer.partner || offer.title}</h4>
              <p className="text-xs font-bold text-[#6B7280] mb-6 tracking-wide uppercase">{offer.category || offer.countryTarget || "Global"}</p>
              <div className="bg-[#F9FAFB] p-4 rounded-xl mb-6">
                <p className="text-sm font-bold text-[#4F46E5]">{offer.offer || offer.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#9CA3AF]">
                  <Clock className="w-3.5 h-3.5" />
                  {offer.expires || (offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString() : "No expiry")}
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

      {/* Elegant Dialog Box (Modal) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-[#111827]/40 backdrop-blur-md transition-opacity"
              onClick={() => !isSubmitting && setShowCreateModal(false)}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-[#E5E7EB] animate-in fade-in zoom-in-95 duration-200">

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-[#111827] mb-1">Post Partner Offer</h2>
                  <p className="text-xs text-[#6B7280]">Fill out the details below to distribute a new exclusive partner benefit.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#6B7280] hover:text-[#111827] transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Endpoint Tech Specs Badge */}


              {/* Success / Error Messages */}
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-semibold text-red-600">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-xs font-semibold text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  {successMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleCreateOffer} className="space-y-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#374151] mb-2">
                    Offer Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all font-medium text-sm text-[#111827]"
                    placeholder="e.g. Canada Fall Intake 2026 Special Bonus"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#374151] mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none font-medium text-sm text-[#111827]"
                    placeholder="Provide details about the partner benefit, requirements, commissions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#374151] mb-2">
                      Country Target
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all font-medium text-sm text-[#111827]"
                      placeholder="e.g. Canada (default: Global)"
                      value={formData.countryTarget}
                      onChange={(e) => setFormData({ ...formData, countryTarget: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#374151] mb-2">
                      Expiry Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all font-medium text-sm text-[#111827]"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    />
                  </div>
                </div>

                {/* Is Active Toggle Selector */}
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider text-[#374151]">
                      Offer Status
                    </span>
                    <span className="text-[10px] text-[#6B7280] font-semibold mt-0.5">
                      Indicates whether this offer starts immediately active.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.isActive ? 'bg-[#4F46E5]' : 'bg-[#E5E7EB]'
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-5 py-3.5 border border-[#E5E7EB] text-[#4B5563] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#F9FAFB] active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="flex-1 px-5 py-3.5 bg-[#4F46E5] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#4338CA] active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Offer"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

