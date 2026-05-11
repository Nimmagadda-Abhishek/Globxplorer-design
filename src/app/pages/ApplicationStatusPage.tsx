import React, { useState, useEffect } from 'react';
import { agentApi } from '../../lib/api';
import { 
  FileText, CheckCircle2, Clock, Search, Filter, ChevronRight, GraduationCap, XCircle, FileCheck
} from 'lucide-react';

export function ApplicationStatusPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [pipelineHistory, setPipelineHistory] = useState<any[]>([]);
  const [loadingPipeline, setLoadingPipeline] = useState(false);

  useEffect(() => {
    const fetchStatusData = async () => {
      setLoading(true);
      try {
        const [summaryRes, studentsRes] = await Promise.all([
          agentApi.students.getStatusSummary().catch(() => ({ data: null })),
          agentApi.students.list().catch(() => ({ data: [] }))
        ]);
        if (summaryRes?.data) setSummary(summaryRes.data);
        if (studentsRes?.data) {
          const studentsArray = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data.students || []);
          setStudents(studentsArray);
        }
      } catch (err) {
        console.error("Error fetching application status data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatusData();
  }, []);

  const handleViewTimeline = async (student: any) => {
    if (selectedStudent?.id === student.id) {
      setSelectedStudent(null);
      return;
    }
    setSelectedStudent(student);
    setLoadingPipeline(true);
    setPipelineHistory([]);
    try {
      const res = await agentApi.students.getPipeline(student.id || student._id).catch(() => ({ data: null }));
      if (res?.data?.history) {
        setPipelineHistory(res.data.history);
      }
    } catch (err) {
      console.error("Error fetching pipeline", err);
    } finally {
      setLoadingPipeline(false);
    }
  };

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-6 max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Application Status</h1>
          <p className="text-sm text-[#6B7280]">Track the pipeline progress of all your referred students.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm text-center">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Total Leads</p>
          <h4 className="text-2xl font-black text-[#111827]">{summary?.lead || summary?.Lead || "0"}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm text-center">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Qualified</p>
          <h4 className="text-2xl font-black text-[#4F46E5]">{summary?.qualified || summary?.Qualified || "0"}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm text-center">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">App Started</p>
          <h4 className="text-2xl font-black text-indigo-600">{summary?.appStarted || summary?.["Application Started"] || "0"}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm text-center">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Offer Received</p>
          <h4 className="text-2xl font-black text-orange-500">{summary?.offer || summary?.["Offer Received"] || "0"}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm text-center">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Visa Filed</p>
          <h4 className="text-2xl font-black text-blue-500">{summary?.visaFiled || summary?.["Visa Filed"] || "0"}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm text-center">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Approved</p>
          <h4 className="text-2xl font-black text-green-500">{summary?.approved || summary?.Approved || "0"}</h4>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Applications List */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#F3F4F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
               <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#4B5563] text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filter Stage
               </button>
            </div>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {students.map((student: any, i: number) => (
              <div 
                key={i} 
                onClick={() => handleViewTimeline(student)}
                className={`p-5 hover:bg-[#F9FAFB] transition-colors cursor-pointer group ${selectedStudent?.id === student.id ? 'bg-[#EEF2FF]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold text-sm">
                      {student.fullName ? student.fullName.charAt(0) : (student.name ? student.name.charAt(0) : 'S')}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827] group-hover:text-[#4F46E5] transition-colors">{student.fullName || student.name}</h4>
                      <p className="text-xs text-[#6B7280]">{student.gxId || student.id} • {student.country || 'No Country specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-gray-100 text-[#4B5563] text-xs font-bold rounded-full border border-gray-200">
                      {student.stage || 'Lead Received'}
                    </span>
                    <ChevronRight className={`w-5 h-5 text-[#9CA3AF] transition-transform ${selectedStudent?.id === student.id ? 'rotate-90 text-[#4F46E5]' : ''}`} />
                  </div>
                </div>
              </div>
            ))}
            {loading && students.length === 0 && (
              <div className="p-12 text-center text-sm font-bold text-gray-500">
                Loading applications...
              </div>
            )}
            {!loading && students.length === 0 && (
              <div className="p-12 text-center text-sm font-bold text-gray-500">
                No applications found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline Widget */}
        {selectedStudent && (
          <div className="w-full lg:w-[400px] bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 sticky top-24">
            <h3 className="text-lg font-black text-[#111827] mb-2">{selectedStudent.fullName || selectedStudent.name}</h3>
            <p className="text-xs font-bold text-[#6B7280] mb-6 border-b border-[#E5E7EB] pb-4">Application Timeline</p>
            
            {loadingPipeline ? (
              <div className="py-12 text-center text-sm font-bold text-gray-500">Loading timeline...</div>
            ) : pipelineHistory.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E5E7EB] before:to-transparent">
                {pipelineHistory.map((entry: any, i: number) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-50 text-[#4F46E5] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-[#E5E7EB]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-[#E5E7EB] bg-white shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-[#111827] text-sm">{entry.stage}</div>
                        <time className="font-medium text-[#6B7280] text-xs">{entry.date}</time>
                      </div>
                      {entry.notes && <div className="text-xs text-[#4B5563] mt-2">{entry.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm font-bold text-gray-500">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                No timeline history available yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
