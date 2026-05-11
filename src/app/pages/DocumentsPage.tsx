import { useState, useEffect } from "react";
import { Search, Filter, FileText, CheckCircle, Clock, AlertCircle, Download, Loader2 } from "lucide-react";
import { DocumentPreviewModal } from "../components/modals/DocumentPreviewModal";
import { documentApi } from "../../lib/api";

export function DocumentsPage() {
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

  useEffect(() => {
    fetchDocuments();
  }, []);

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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || doc.status.toLowerCase().replace(" ", "-") === filterStatus;
    return matchesSearch && matchesFilter;
  });


  const handleDownload = (docName: string) => {
    console.log("Downloading:", docName);
    // Simulate download
    alert(`Downloading ${docName}...`);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">Document Center</h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">Manage and review all student documents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-6 shadow-sm">
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
                          {doc.studentName.split(" ").map((n) => n[0]).join("")}
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
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="text-sm text-[#6B7280]">
            Showing <span className="font-medium text-[#111827]">{filteredDocuments.length}</span> of{" "}
            <span className="font-medium text-[#111827]">342</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      <DocumentPreviewModal
        isOpen={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        documentName={previewDoc?.name || ""}
        studentName={previewDoc?.student || ""}
      />
    </div>
  );
}