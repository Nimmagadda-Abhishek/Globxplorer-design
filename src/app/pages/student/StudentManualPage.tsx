import {
  BookOpen,
  LayoutDashboard,
  FileText,
  CreditCard,
  MessageSquare,
  Video,
  CheckCircle2,
  Bell
} from "lucide-react";

export function StudentManualPage() {
  const sections = [
    {
      title: "Dashboard Overview",
      icon: LayoutDashboard,
      description: "Your central hub for tracking your study abroad journey. Here you can view your overall progress, upcoming tasks, and quick stats at a glance.",
      features: [
        "View current application stage",
        "Check missing document count",
        "See upcoming webinars and tasks",
        "Quick access to pending payments"
      ]
    },
    {
      title: "Document Management",
      icon: FileText,
      description: "Securely upload and manage all your required documents in one place.",
      features: [
        "Upload transcripts, SOPs, and LORs",
        "View document verification status",
        "Receive alerts for missing or rejected documents"
      ]
    },
    {
      title: "Application Tracking",
      icon: CheckCircle2,
      description: "Follow your university applications step-by-step.",
      features: [
        "Track timeline from submission to offer",
        "View university-specific requirements",
        "Receive updates when your status changes"
      ]
    },
    {
      title: "Payments & Fees",
      icon: CreditCard,
      description: "Manage your financial commitments transparently.",
      features: [
        "View pending payment requests",
        "Download payment receipts",
        "Track overall expenditure"
      ]
    },
    {
      title: "Communication & Support",
      icon: MessageSquare,
      description: "Stay in touch with your assigned counsellor and support team.",
      features: [
        "Direct chat with your expert counsellor",
        "Raise support tickets",
        "Access FAQ and AI assistant"
      ]
    },
    {
      title: "Webinars & Events",
      icon: Video,
      description: "Participate in exclusive events to prepare for your journey.",
      features: [
        "Browse upcoming university webinars",
        "Join live Q&A sessions",
        "Access recorded pre-departure orientations"
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Never miss an important update.",
      features: [
        "Real-time alerts for document approvals",
        "Reminders for upcoming deadlines",
        "System announcements and news"
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Student Portal Manual
          </h1>
          <p className="text-slate-500 mt-1 font-medium">A comprehensive guide to navigating your study abroad CRM features.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <section.icon className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">{section.title}</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">{section.description}</p>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Features</h4>
              <ul className="space-y-2">
                {section.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-2 text-sm font-medium text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-center relative overflow-hidden text-white shadow-2xl shadow-indigo-200">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-4">Need further assistance?</h2>
          <p className="text-indigo-100 font-medium mb-8">If you have any questions or are stuck on a particular step, your assigned counsellor is always available to help.</p>
          <a href="/student/chat" className="inline-flex px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors">
            Contact Counsellor
          </a>
        </div>
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-40"></div>
      </div>
    </div>
  );
}
