import { useState, useEffect } from "react";
import { Briefcase, Loader2, FileText, User, MapPin } from "lucide-react";
import { alumniManagerApi } from "../../../lib/api";

export function AlumniManagerJobApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await alumniManagerApi.jobs.getApplications();
        const data = res.data || res.applications || (Array.isArray(res) ? res : []);
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Job Applications</h1>
        <p className="text-slate-500 mt-1 font-medium">Global view of all student applications to alumni job postings.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500">
            No job applications found on the platform.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((app) => (
              <div key={app._id || app.id} className="border border-slate-100 rounded-2xl p-6 flex flex-col xl:flex-row gap-6 hover:shadow-md transition-shadow">
                
                {/* Job & Alumni Info */}
                <div className="flex-1 min-w-[300px] border-b xl:border-b-0 xl:border-r border-slate-100 pb-4 xl:pb-0 xl:pr-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{app.job?.title || 'Unknown Job'}</h4>
                      <p className="text-sm font-bold text-slate-500">{app.job?.company || 'Company'}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 mt-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted By Alumni</p>
                      <p className="text-sm font-bold text-slate-700">{app.job?.alumni?.name || app.alumni?.name || 'Unknown Alumni'}</p>
                    </div>
                  </div>
                </div>

                {/* Applicant Info */}
                <div className="flex-1 min-w-[300px]">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Applicant Details</h5>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{app.student?.name || 'Applicant Name'}</p>
                      <p className="text-sm text-slate-500">{app.student?.email || 'No email provided'}</p>
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 text-sm font-bold mt-2 flex items-center gap-1 hover:underline">
                          <FileText className="w-4 h-4" /> View Resume
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-start xl:items-end justify-center shrink-0 min-w-[150px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Application Status</p>
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${
                    app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    app.status === 'Reviewed' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {app.status || 'Pending'}
                  </span>
                  {app.createdAt && (
                    <p className="text-xs text-slate-400 mt-3">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
