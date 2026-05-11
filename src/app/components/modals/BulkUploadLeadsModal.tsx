import { useState, useEffect } from "react";
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2, Users } from "lucide-react";
import { adminApi } from "../../../lib/api";

interface BulkUploadLeadsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUploadLeadsModal({ onClose, onSuccess }: BulkUploadLeadsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [telecallerId, setTelecallerId] = useState("");
  const [telecallers, setTelecallers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    fetchTelecallers();
  }, []);

  const fetchTelecallers = async () => {
    try {
      const res: any = await adminApi.telecallers.list();
      setTelecallers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch telecallers", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension !== 'xlsx' && extension !== 'csv') {
        setError("Please upload only .xlsx or .csv files");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res: any = await adminApi.leads.bulkUpload(file, telecallerId || undefined);
      if (res.success) {
        setResult(res.data);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      } else {
        setError(res.message || "Failed to upload leads");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-[#E5E7EB]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Bulk Upload Leads</h2>
              <p className="text-xs text-[#6B7280]">Import leads from Excel or CSV</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-gray-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              File Requirements
            </h3>
            <ul className="text-xs text-blue-700 space-y-1 ml-6 list-disc">
              <li>Supported formats: .xlsx, .csv</li>
              <li>Required columns: Name, Phone</li>
              <li>Optional columns: Email, Source</li>
              <li>System identifies headers like "Student Name", "Mobile Number", etc.</li>
            </ul>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider">Select File</label>
            <div className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${file ? 'border-green-300 bg-green-50' : 'border-[#E5E7EB] hover:border-[#4F46E5] hover:bg-indigo-50/50'}`}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx,.csv"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {file ? (
                <>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-green-800">{file.name}</p>
                    <p className="text-xs text-green-600">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#4F46E5]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#111827]">Click to upload or drag and drop</p>
                    <p className="text-xs text-[#6B7280]">Excel or CSV file up to 10MB</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Telecaller Assignment */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assign to Telecaller (Optional)
            </label>
            <select
              value={telecallerId}
              onChange={(e) => setTelecallerId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
            >
              <option value="">Do not assign yet</option>
              {telecallers.map((tc) => (
                <option key={tc._id} value={tc._id}>
                  {tc.name} ({tc.email})
                </option>
              ))}
            </select>
          </div>

          {/* Result / Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Upload Successful!
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-green-700">
                <div>Total Leads: <span className="font-bold">{result.total}</span></div>
                <div>Success: <span className="font-bold">{result.success}</span></div>
                <div>Duplicates: <span className="font-bold">{result.duplicates}</span></div>
                <div>Failures: <span className="font-bold">{result.failures}</span></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#4B5563] hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file || !!result}
              className="flex-[2] px-4 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-bold hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Start Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
