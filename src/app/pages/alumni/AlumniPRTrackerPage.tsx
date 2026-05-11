import { useState, useEffect } from "react";
import { Target, CheckCircle2, MapPin, Loader2, Award, ArrowRight } from "lucide-react";
import { alumniApi } from "../../../lib/api";

export function AlumniPRTrackerPage() {
  const [loading, setLoading] = useState(true);
  const [prStatus, setPrStatus] = useState<any>(null);
  const [timelines, setTimelines] = useState<any>(null);
  const [showUpdate, setShowUpdate] = useState(false);

  const [updateData, setUpdateData] = useState({
    country: "Canada",
    stage: "Expression of Interest",
    progress: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, timelineRes] = await Promise.all([
        alumniApi.prTracker.getStatus().catch(() => null),
        alumniApi.prTracker.getTimelines().catch(() => null)
      ]);

      if (statusRes?.status) {
        setPrStatus(statusRes.status);
        setUpdateData({
          country: statusRes.status.country || "Canada",
          stage: statusRes.status.stage || "Expression of Interest",
          progress: statusRes.status.progress || 0
        });
      }

      if (timelineRes?.timelines) setTimelines(timelineRes.timelines);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await alumniApi.prTracker.updateStatus(updateData);
      setShowUpdate(false);
      fetchData();
    } catch (error) {
      console.error("Failed to update PR status", error);
    }
  };

  const stages = ['Expression of Interest', 'ITA Received', 'Biometrics Submitted', 'Medical Passed', 'PR Granted'];
  const currentStageIndex = stages.indexOf(prStatus?.stage || 'Expression of Interest');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">PR Progress Tracker</h1>
          <p className="text-slate-500 mt-1 font-medium">Track your Permanent Residency journey and insights.</p>
        </div>
        <button onClick={() => setShowUpdate(!showUpdate)} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-colors">
          Update Status
        </button>
      </div>

      {showUpdate && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">Update PR Stage</h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Target Country</label>
              <select 
                value={updateData.country}
                onChange={(e) => setUpdateData({ ...updateData, country: e.target.value })}
                className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option>Canada</option>
                <option>Australia</option>
                <option>UK</option>
                <option>USA</option>
                <option>Germany</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Current Stage</label>
              <select 
                value={updateData.stage}
                onChange={(e) => {
                  const newStage = e.target.value;
                  const index = stages.indexOf(newStage);
                  const progress = Math.round((index / (stages.length - 1)) * 100);
                  setUpdateData({ ...updateData, stage: newStage, progress });
                }}
                className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                {stages.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Progress ({updateData.progress}%)</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={updateData.progress}
                onChange={(e) => setUpdateData({ ...updateData, progress: parseInt(e.target.value) })}
                className="w-full mt-2 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors">Save Update</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Current Phase</h3>
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {prStatus?.country}</p>
                </div>
              </div>
              <span className="bg-violet-100 text-violet-700 px-4 py-2 rounded-xl text-sm font-black">
                {prStatus?.stage}
              </span>
            </div>

            <div className="relative mt-12 mb-8 px-4">
              <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 overflow-hidden rounded-full">
                <div className="w-full h-full bg-slate-100"></div>
                <div 
                  className="absolute top-0 left-0 h-full bg-violet-600 transition-all duration-1000" 
                  style={{ width: `${prStatus?.progress || 0}%` }}
                ></div>
              </div>
              
              <div className="relative flex justify-between">
                {stages.map((stage, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors ${
                      i < currentStageIndex ? 'bg-violet-600 text-white' : 
                      i === currentStageIndex ? 'bg-white border-violet-600 text-violet-600' : 'bg-slate-200 text-transparent'
                    }`}>
                      {i <= currentStageIndex && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 text-center w-20 ${i <= currentStageIndex ? 'text-violet-900' : 'text-slate-400'}`}>
                      {stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Award className="w-32 h-32" /></div>
            <div className="relative z-10">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-violet-300" /> Next Steps</h3>
              <p className="text-sm text-violet-100 leading-relaxed mb-4">{timelines?.stageDescription}</p>
              
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 mt-8">
                <p className="text-xs font-bold text-violet-200 uppercase tracking-widest mb-1">Estimated Timeline</p>
                <p className="text-2xl font-black">{timelines?.averageTime}</p>
              </div>
            </div>
            <button className="w-full mt-6 bg-white text-violet-700 py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-violet-50 transition-colors relative z-10">
              Read Guide <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
