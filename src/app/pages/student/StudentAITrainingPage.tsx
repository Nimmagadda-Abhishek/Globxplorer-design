import { 
  Bot, 
  Mic, 
  FileText, 
  BookOpen, 
  ShieldAlert, 
  Globe, 
  Lock, 
  PlayCircle, 
  Sparkles,
  ArrowRight
} from "lucide-react";

export function StudentAITrainingPage() {
  const tools = [
    {
      title: "AI Mock Interview",
      desc: "Simulate university screening interviews with real-time feedback on your answers and body language.",
      icon: Mic,
      premium: false,
      color: "bg-blue-500",
      cta: "Start Session"
    },
    {
      title: "SOP Writing Assistant",
      desc: "Get AI-powered suggestions to improve the structure and impact of your Statement of Purpose.",
      icon: FileText,
      premium: true,
      color: "bg-indigo-600",
      cta: "Draft Now"
    },
    {
      title: "IELTS Practice Center",
      desc: "Adaptive tests for Reading, Writing, Speaking, and Listening. Track your band score progress.",
      icon: BookOpen,
      premium: false,
      color: "bg-green-600",
      cta: "Take Test"
    },
    {
      title: "Visa Prep Simulator",
      desc: "Master the visa interview with country-specific mock questions and expert-curated responses.",
      icon: ShieldAlert,
      premium: true,
      color: "bg-rose-600",
      cta: "Launch Prep"
    },
    {
      title: "Country Insight Guide",
      desc: "Deep dive into lifestyle, cost of living, and work-permit rules for your chosen destination.",
      icon: Globe,
      premium: false,
      color: "bg-amber-500",
      cta: "Explore"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 rounded-[2.5rem] p-8 text-white overflow-hidden relative shadow-2xl shadow-slate-200">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-indigo-500 rounded-xl">
                <Bot className="w-6 h-6" />
             </div>
             <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">AI Academy</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-tight">Master Your Journey with AI</h1>
          <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed">
            Personalized training tools designed to increase your success rate at every stage of the application process.
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
           <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Training Stats</p>
           <div className="text-center">
              <p className="text-3xl font-black text-indigo-400">N/A</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Prep Score</p>
           </div>
           <button className="w-full px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-500 transition-colors">
             Resume Last Lesson
           </button>
        </div>
        {/* Background Gradients */}
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool, idx) => (
          <div 
            key={idx}
            className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {tool.premium && (
              <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                <Lock className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Premium</span>
              </div>
            )}

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${tool.color} group-hover:scale-110 transition-transform`}>
              <tool.icon className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-3">{tool.title}</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
              {tool.desc}
            </p>

            <div className="flex items-center justify-between">
               {tool.premium ? (
                 <button className="flex items-center gap-2 text-amber-600 font-black text-xs hover:underline uppercase tracking-widest">
                   Unlock with Pro <Sparkles className="w-3.5 h-3.5" />
                 </button>
               ) : (
                 <button className="flex items-center gap-2 text-indigo-600 font-black text-xs group-hover:gap-3 transition-all uppercase tracking-widest">
                   {tool.cta} <ArrowRight className="w-4 h-4" />
                 </button>
               )}
               <div className="flex items-center gap-1">
                  {[1,2,3].map(i => <div key={i} className={`w-1 h-1 rounded-full ${i <= 2 ? 'bg-slate-300' : 'bg-slate-100'}`}></div>)}
               </div>
            </div>

            {/* Subtle Gradient Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/[0.02] group-hover:to-indigo-500/[0.05] transition-all pointer-events-none"></div>
          </div>
        ))}
        
        {/* Placeholder for "Coming Soon" */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
              <PlayCircle className="w-6 h-6" />
           </div>
           <h3 className="text-lg font-black text-slate-400 italic">More coming soon...</h3>
           <p className="text-xs font-medium text-slate-400 mt-2">New training modules are added weekly to help you excel.</p>
        </div>
      </div>
    </div>
  );
}
