import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Eye, Download, Info, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { studentPortalApi } from "../../../lib/api";

export function StudentDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [docData, setDocData] = useState<{ uploaded: any[], missing: string[] }>({ uploaded: [], missing: [] });
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await studentPortalApi.documents.getAll().catch(() => null);
      if (res?.success && res.data) {
        setDocData(res.data);
      } else {
        setDocData({ uploaded: [], missing: [] });
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await studentPortalApi.profile.get().catch(() => null);
        if (profileRes?.data?._id) {
          setStudentId(profileRes.data._id);
        }
        await fetchDocuments();
      } catch (err) {
        console.error("Initialization error", err);
      }
    };
    init();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCategory) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("type", selectedCategory);
      formData.append("visibility", "Public");

      if (studentId) {
        await studentPortalApi.documents.uploadDocument(studentId, formData);
      } else {
        // Fallback to the old method if studentId is not available for some reason
        formData.append("category", selectedCategory);
        await studentPortalApi.documents.upload(formData);
      }

      await fetchDocuments();
      alert("Document uploaded successfully");
      setSelectedCategory(null);
    } catch (error) {
      console.error("Upload error", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerUpload = (category: string) => {
    setSelectedCategory(category);
    fileInputRef.current?.click();
  };

  const getStatusDisplay = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'Verified';
      case 'pending': return 'Reviewing';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const formatCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      'passport': 'Passport (front + relevant pages)',
      'photo': 'Passport-size photo',
      'national_id': 'National ID (Aadhaar or equivalent)',
      'birth_certificate': 'Birth certificate (if needed)',
      'marksheet_10th': '10th marks memo / certificate',
      'marksheet_12th': '12th marks memo / certificate',
      'diploma_transcripts': 'Diploma transcripts (if applicable)',
      'bachelors_transcripts': "Bachelor’s transcripts",
      'bachelors_degree': "Bachelor’s degree certificate",
      'masters_transcripts': "Master’s transcripts / degree (if applicable)",
      'backlog_summary': 'Backlog / arrears summary (if applicable)',
      'ielts_toefl_pte': 'IELTS / TOEFL / PTE',
      'gre_gmat_sat': 'GRE / GMAT / SAT (if required)',
      'duolingo': 'Duolingo English Test (if accepted)',
      'sop': 'Statement of Purpose (SOP)',
      'bank_statement': 'Bank Statement',
      'visa_docs': 'Visa Documents',
      'loan_docs': 'Loan Documents',
      'other': 'Other Document'
    };
    return labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
  };

  const DOCUMENT_SECTIONS = [
    {
      title: "Identity Documents",
      categories: ['passport', 'photo', 'national_id', 'birth_certificate']
    },
    {
      title: "Academic Documents",
      categories: ['marksheet_10th', 'marksheet_12th', 'diploma_transcripts', 'bachelors_transcripts', 'bachelors_degree', 'masters_transcripts', 'backlog_summary']
    },
    {
      title: "Test Scores",
      categories: ['ielts_toefl_pte', 'gre_gmat_sat', 'duolingo']
    },
    {
      title: "Other Documents",
      categories: ['sop', 'bank_statement', 'visa_docs', 'loan_docs', 'other']
    }
  ];

  const recentUploads = (docData.uploaded || []).slice(0, 5).map(d => ({
    name: d.name || "Document.pdf",
    size: d.size || "N/A",
    date: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : "Just now",
    status: getStatusDisplay(d.verificationStatus),
    url: d.url
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Document Center</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and upload your required application documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Storage Used</p>
            <p className="text-sm font-black text-slate-900">N/A</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Upload className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document Categories */}
        <div className="lg:col-span-2 space-y-10">
          {DOCUMENT_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">{section.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.categories.map((catId) => {
                  const uploadedDoc = docData.uploaded.find(d => d.category === catId);
                  const isMissing = docData.missing.includes(catId);

                  // Skip if neither uploaded nor explicitly marked as missing (unless it's a core category)
                  if (!uploadedDoc && !isMissing && section.title === "Other Documents" && catId !== 'other') return null;

                  const label = formatCategoryLabel(catId);
                  const status = uploadedDoc ? getStatusDisplay(uploadedDoc.verificationStatus) : 'Missing';
                  const uploaded = !!uploadedDoc;

                  return (
                    <div
                      key={catId}
                      className={`p-6 bg-white border rounded-[2rem] shadow-sm hover:shadow-md transition-all group cursor-pointer ${status === 'Locked' ? 'opacity-60 grayscale cursor-not-allowed' : 'border-slate-100'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-2xl ${status === 'Verified' ? 'bg-green-50 text-green-600' :
                            status === 'Reviewing' ? 'bg-blue-50 text-blue-600' :
                              status === 'Locked' ? 'bg-slate-50 text-slate-400' : 'bg-amber-50 text-amber-600'
                          }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        {status === 'Verified' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : status === 'Locked' ? (
                          <AlertCircle className="w-5 h-5 text-slate-300" />
                        ) : null}
                      </div>
                      <div className="mt-4">
                        <h3 className="text-sm font-black text-slate-900 leading-tight">{label}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {uploaded ? '1 file' : '0 files'}
                          </p>
                          <p className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${status === 'Verified' ? 'bg-green-100 text-green-700' :
                              status === 'Reviewing' ? 'bg-blue-100 text-blue-700' :
                                status === 'Locked' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                            }`}>
                            {status}
                          </p>
                        </div>
                      </div>
                      {status !== 'Verified' && (
                        <button
                          onClick={() => triggerUpload(catId)}
                          className="w-full mt-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          {uploaded ? 'Replace File' : 'Upload Now'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900">Security Restriction</h4>
              <p className="text-xs font-medium text-amber-700 mt-1 leading-relaxed">
                For security reasons, you cannot edit your primary identification (Passport, Name, Email). If there is an error, please contact your counsellor immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar: Upload Area & Recent */}
        <div className="space-y-8">
          <div
            className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer group"
            onClick={() => triggerUpload('other')}
          >
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 transition-colors">
              {uploading ? <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /> : <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />}
            </div>
            <h3 className="text-lg font-black text-slate-900">{uploading ? 'Uploading...' : 'Upload Other File'}</h3>
            <p className="text-xs font-medium text-slate-500 mt-2">Maximum file size 10MB. Supports PDF, JPG, PNG.</p>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button disabled={uploading} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-indigo-600 transition-colors disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Select Files'}
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6">Recent Uploads</h3>
            <div className="space-y-4">
              {recentUploads.length > 0 ? recentUploads.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{file.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{file.size} • {file.date}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.url && <a href={file.url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-indigo-600"><Eye className="w-4 h-4" /></a>}
                    {file.url && <a href={file.url} download className="p-1.5 text-slate-400 hover:text-indigo-600"><Download className="w-4 h-4" /></a>}
                  </div>
                </div>
              )) : (
                <p className="text-sm font-medium text-slate-500 text-center py-4">No recent uploads</p>
              )}
            </div>
            <button className="w-full mt-6 py-3 text-xs font-black text-indigo-600 hover:underline">View All Files</button>
          </div>
        </div>
      </div>
    </div>
  );
}
