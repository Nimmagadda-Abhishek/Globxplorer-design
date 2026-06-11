import { useState, useEffect } from "react";
import { Search, FileText, CheckCircle, Clock, AlertCircle, Download, Loader2, Upload, X, Building2, User, File } from "lucide-react";
import { DocumentPreviewModal } from "../components/modals/DocumentPreviewModal";
import { documentApi, adminApi } from "../../lib/api";

export function DocumentsPage() {
  const role = localStorage.getItem("userRole") || "ADMIN";
  const [activeTab, setActiveTab] = useState<"student" | "company">("student");

  // Student docs state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [previewDoc, setPreviewDoc] = useState<{ name: string; student: string } | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  });

  // Company docs state
  const [companyDocs, setCompanyDocs] = useState<any[]>([]);
  const [loadingCompanyDocs, setLoadingCompanyDocs] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Upload modal state
  const [file, setFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({ name: "", description: "", type: "General" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (activeTab === "student") {
      fetchDocuments();
    } else {
      fetchCompanyDocuments();
    }
  }, [activeTab]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentApi.list();
      const rawDocs = res.data || res;
      const mappedDocs = rawDocs.map((doc: any) => ({
        id: doc._id || doc.id,
        studentName: doc.student?.name || "Unknown",
        documentType: doc.name || doc.type || "Document",
        uploadedDate: doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : "-",
        status: doc.status || "Pending",
        statusColor: doc.status === 'Approved' ? "bg-green-100 text-green-700" : doc.status === 'Rejected' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700",
        icon: doc.status === 'Approved' ? CheckCircle : doc.status === 'Rejected' ? AlertCircle : Clock,
        iconColor: doc.status === 'Approved' ? "text-green-600" : doc.status === 'Rejected' ? "text-red-600" : "text-yellow-600",
      }));
      setDocuments(mappedDocs);
      setStats({
        total: mappedDocs.length,
        underReview: mappedDocs.filter((d: any) => d.status === 'Pending').length,
        approved: mappedDocs.filter((d: any) => d.status === 'Approved').length,
        rejected: mappedDocs.filter((d: any) => d.status === 'Rejected').length,
      });
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDocuments = async () => {
    setLoadingCompanyDocs(true);
    try {
      const res = await adminApi.companyDocuments.list();
      setCompanyDocs(Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error("Failed to fetch company documents:", err);
    } finally {
      setLoadingCompanyDocs(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Please select a file to upload.");
      return;
    }
    setUploading(true);
    setUploadError("");
    
    const formData = new FormData();
    formData.append("file", file);
    if (uploadData.name.trim()) formData.append("name", uploadData.name.trim());
    if (uploadData.description.trim()) formData.append("description", uploadData.description.trim());
    if (uploadData.type.trim()) formData.append("type", uploadData.type.trim());

    try {
      await adminApi.companyDocuments.upload(formData);
      setShowUploadModal(false);
      setFile(null);
      setUploadData({ name: "", description: "", type: "General" });
      fetchCompanyDocuments();
    } catch (err: any) {
      console.error("Failed to upload document", err);
      setUploadError(err.message || "Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleViewCompanyDoc = async (id: string) => {
    try {
      const res = await adminApi.companyDocuments.getById(id);
      const docData = res.data || res;
      if (docData.url) {
        window.open(docData.url, "_blank");
      } else if (docData.fileUrl) {
        window.open(docData.fileUrl, "_blank");
      } else {
        alert("Document URL not available.");
      }
    } catch (err) {
      console.error("Failed to view document", err);
      alert("Failed to retrieve document details.");
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || doc.status.toLowerCase().replace(" ", "-") === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">Document Center</h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">Manage and review all system documents</p>
        </div>
        
        <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("student")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "student" ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <User className="w-4 h-4" />
            Student Docs
          </button>
          {role === "ADMIN" && (
            <button
              onClick={() => setActiveTab("company")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "company" ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Company Docs
            </button>
          )}
        </div>
      </div>

      {activeTab === "student" ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
              <p className="text-sm text-[#6B7280] mb-1">Total Documents</p>
              <p className="text-2xl font-bold text-[#111827]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
              <p className="text-sm text-[#6B7280] mb-1">Under Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.underReview}</p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
              <p className="text-sm text-[#6B7280] mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
              <p className="text-sm text-[#6B7280] mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search by student name or document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="under-review">Under Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Uploaded Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {doc.studentName.split(" ").map((n: string) => n[0]).join("")}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-[#111827]">{doc.studentName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#6B7280]" />
                          <span className="text-sm text-[#111827]">{doc.documentType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#6B7280]">{doc.uploadedDate}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <doc.icon className={`w-4 h-4 ${doc.iconColor}`} />
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.statusColor}`}>
                            {doc.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewDoc({ name: doc.documentType, student: doc.studentName })}
                            className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleDownload(doc.documentType)}
                            className="p-1 hover:bg-[#F3F4F6] rounded"
                          >
                            <Download className="w-4 h-4 text-[#6B7280]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDocuments.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#6B7280]">
                        No student documents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <div className="text-sm text-[#6B7280]">
                Showing <span className="font-medium text-[#111827]">{filteredDocuments.length}</span> results
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Company Documents Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111827]">Company Policy & Operational Documents</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-semibold hover:bg-[#4338CA] transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>

          {/* Company Documents List */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden relative min-h-[300px]">
            {loadingCompanyDocs && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Document Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Uploaded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {companyDocs.map((doc: any) => (
                    <tr key={doc._id || doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <File className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#111827]">{doc.name || doc.originalName || "Unnamed Document"}</p>
                            {doc.description && <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">{doc.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-[#F1F5F9] text-[#475569]">
                          {doc.type || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[#4F46E5] text-[10px] font-bold">
                            {doc.uploadedBy?.name ? doc.uploadedBy.name.charAt(0) : "A"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#111827]">{doc.uploadedBy?.name || "Admin"}</span>
                            {doc.uploadedBy?.email && <span className="text-xs text-[#6B7280]">{doc.uploadedBy.email}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#6B7280]">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewCompanyDoc(doc._id || doc.id)}
                          className="px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] transition-all shadow-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {companyDocs.length === 0 && !loadingCompanyDocs && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#6B7280]">
                        No company documents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Document Preview Modal for Students */}
      <DocumentPreviewModal
        isOpen={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        documentName={previewDoc?.name || ""}
        studentName={previewDoc?.student || ""}
      />

      {/* Upload Company Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-[#111827]/60 backdrop-blur-sm transition-opacity" onClick={() => !uploading && setShowUploadModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#111827]">Upload Document</h2>
                  <p className="text-xs text-[#6B7280] mt-1">Add a new company-wide document.</p>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-[#F1F5F9] rounded-full transition-colors">
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-2">File *</label>
                  <div className="relative border-2 border-dashed border-[#CBD5E1] rounded-xl p-4 hover:bg-[#F8FAFC] transition-colors">
                    <input
                      required
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="w-8 h-8 text-[#94A3B8] mb-2" />
                      <p className="text-sm font-medium text-[#475569]">
                        {file ? file.name : "Click or drag file to this area to upload"}
                      </p>
                      {file && <p className="text-xs text-[#64748B] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-2">Document Name (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm text-[#0F172A]"
                    placeholder="e.g. Employee Handbook 2026"
                    value={uploadData.name}
                    onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-2">Document Type</label>
                  <select
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm text-[#0F172A]"
                    value={uploadData.type}
                    onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                  >
                    <option value="General">General</option>
                    <option value="Policy">Policy</option>
                    <option value="Legal">Legal</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Training">Training</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-2">Description (Optional)</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm text-[#0F172A] resize-none"
                    placeholder="Brief description of the document contents..."
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#475569] rounded-xl font-bold text-sm hover:bg-[#F8FAFC] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={uploading}
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#4F46E5] text-white rounded-xl font-bold text-sm hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                    ) : "Upload Document"}
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