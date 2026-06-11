import { CheckCircle2, Clock, MapPin, GraduationCap, Plane, Award, Landmark, FileCheck, Loader2, Calendar, FileText, MessageSquare, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { studentPortalApi } from "../../../lib/api";

const getNextSteps = (stage: string) => {
  switch(stage) {
    case 'New':
      return [
        { task: "Complete Profile", desc: "Fill out your remaining profile details.", icon: FileText },
        { task: "Schedule Counseling", desc: "Book your first session with a counsellor.", icon: Calendar }
      ];
    case 'Counseling':
      return [
        { task: "Attend Session", desc: "Join the scheduled counseling session.", icon: MessageSquare },
        { task: "Provide Documents", desc: "Upload initial academic documents.", icon: FileCheck }
      ];
    case 'Shortlisting':
      return [
        { task: "Review Options", desc: "Check the universities shortlisted by your counsellor.", icon: Search },
        { task: "Finalize Choices", desc: "Select the universities to apply to.", icon: CheckCircle2 }
      ];
    case 'Application':
      return [
        { task: "Submit Documents", desc: "Upload SOP, LORs, and other application documents.", icon: FileText },
        { task: "Pay Application Fees", desc: "Complete payment for university applications.", icon: Landmark }
      ];
    case 'Offer Letter':
      return [
        { task: "Review Offer", desc: "Check the terms of your admission offer.", icon: Search },
        { task: "Accept Offer", desc: "Sign and submit your acceptance.", icon: Award },
      ];
    case 'Visa Process':
      return [
        { task: "Prepare Visa Docs", desc: "Gather financial and identity documents for visa.", icon: FileCheck },
        { task: "Schedule Interview", desc: "Book your visa interview slot.", icon: Calendar }
      ];
    case 'Enrolled':
      return [
        { task: "Book Flights", desc: "Arrange your travel to the destination.", icon: Plane },
        { task: "Find Accommodation", desc: "Secure housing near your university.", icon: MapPin }
      ];
    default:
      return [
        { task: "Awaiting Update", desc: "Please wait for your counsellor to assign the next tasks.", icon: Clock }
      ];
  }
};

export function StudentApplicationPage() {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await studentPortalApi.pipeline.get().catch(() => null);
        
        if (res?.success && res.data) {
          const { currentStage, timeline } = res.data;
          
          const iconMap: Record<string, any> = {
            "New": Clock,
            "Counseling": MessageSquare,
            "Shortlisting": Search,
            "Application": FileText,
            "Offer Letter": Award,
            "Visa Process": Plane,
            "Enrolled": CheckCircle2
          };

          const mappedStages = (timeline || []).map((step: any, idx: number) => ({
            id: step.label.toLowerCase().replace(/\s+/g, '-'),
            label: step.label,
            date: step.date,
            status: step.status,
            icon: iconMap[step.label] || FileCheck
          }));
          
          setStatusData({ 
            stages: mappedStages, 
            currentStage: { 
              title: currentStage || "Application Tracking", 
              subtitle: "Current Status", 
              description: `Your application is currently at the ${currentStage || 'initial'} stage. Our team is working on the next steps.`, 
              actionText: "View Documents" 
            }, 
            nextSteps: getNextSteps(currentStage) 
          });
        } else {
          setStatusData(null);
        }
      } catch (err) {
        console.error("Failed to fetch pipeline status", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const baseStages: any[] = [];

  const stages = statusData?.stages || baseStages;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Track Your Journey</h1>
        <p className="text-slate-500 mt-1 font-medium">Real-time status of your overseas education application.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="relative">
          {/* Vertical Line for Mobile */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 lg:hidden"></div>
          
          {/* Horizontal Line for Desktop */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 hidden lg:block"></div>

          <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 relative z-10">
            {stages.map((stage: any, idx: number) => {
              const Icon = typeof stage.icon === 'string' ? MapPin : stage.icon || MapPin;
              return (
              <div key={stage.id || idx} className="flex lg:flex-col items-center gap-4 lg:gap-0 lg:text-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-sm ${
                  stage.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 
                  stage.status === 'current' ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse shadow-indigo-200' : 'bg-white border-slate-100 text-slate-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="lg:mt-6">
                  <h3 className={`text-sm font-black ${stage.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>
                    {stage.label}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {stage.date}
                  </p>
                </div>

                {stage.status === 'completed' && (
                  <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 -mt-10">
                     <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
            )})}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">Current Stage Details</h3>
          <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                   <GraduationCap className="w-6 h-6" />
                </div>
                 <div>
                     <h4 className="text-lg font-black text-slate-900 leading-tight">{statusData?.currentStage?.title || "N/A"}</h4>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{statusData?.currentStage?.subtitle || ""}</p>
                 </div>
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {statusData?.currentStage?.description || "Tracking your application progress..."}
              </p>
              <button className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-colors">
                {statusData?.currentStage?.actionText || "View Details"}
              </button>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
           <h3 className="text-xl font-black text-slate-900 mb-6">Next Steps</h3>
           <div className="space-y-4">
             {(statusData?.nextSteps || []).map((step: any, i: number) => {
               const StepIcon = typeof step.icon === 'string' ? FileCheck : step.icon || FileCheck;
               return (
               <div key={i} className="flex items-start gap-4 p-4 border border-slate-50 rounded-2xl hover:border-indigo-100 transition-colors">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <StepIcon className="w-5 h-5" />
                 </div>
                 <div>
                    <h5 className="text-sm font-black text-slate-900">{step.task}</h5>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{step.desc}</p>
                 </div>
               </div>
             )})}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
