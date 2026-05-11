import { X, Download, CheckCircle, XCircle } from "lucide-react";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  studentName: string;
}

export function DocumentPreviewModal({ isOpen, onClose, documentName, studentName }: DocumentPreviewModalProps) {
  if (!isOpen) return null;

  const handleApprove = () => {
    console.log("Document approved");
    onClose();
  };

  const handleReject = () => {
    console.log("Document rejected");
    onClose();
  };

  const handleDownload = () => {
    console.log("Downloading document");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-[#E5E7EB] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">{documentName}</h2>
            <p className="text-sm text-[#6B7280]">{studentName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-[#6B7280]" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-12 text-center min-h-[500px] flex items-center justify-center">
            <div>
              <div className="w-24 h-24 bg-[#F3F4F6] rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-[#111827] mb-2">{documentName}</p>
              <p className="text-sm text-[#6B7280] mb-6">Document Preview</p>
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download to View
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-[#E5E7EB] p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F8FAFC] transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors inline-flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
