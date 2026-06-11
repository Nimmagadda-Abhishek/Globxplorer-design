import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Filter, Download, Search, Loader2, Trash2 } from "lucide-react";
import { AddStudentModal } from "../components/modals/AddStudentModal";
import { AgentAddLeadModal } from "../components/modals/AgentAddLeadModal";
import { studentApi, adminApi, userApi, agentApi } from "../../lib/api";

export function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    enrolledThisMonth: 0,
    visaApproved: 0,
    activeApps: 0
  });

  const role = localStorage.getItem("userRole") || "ADMIN";
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    fetchStudents();
    if (isAdmin) fetchStats();
  }, [role]);


  const fetchStats = async () => {
    try {
      const res = await adminApi.dashboard.getSummary();
      setStats({
        total: res.data?.activeStudents || 0,
        enrolledThisMonth: res.data?.enrolledThisMonth || 0,
        visaApproved: res.data?.visaApproved || 0,
        activeApps: res.data?.applicationsSubmitted || 0,
      });
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let res: any;
      if (isAdmin) {
        res = await adminApi.students.list({ search: searchTerm });
      } else if (role === "AGENT" || role === "AGENT_MANAGER") {
        res = await agentApi.students.list({ search: searchTerm });
      } else {
        res = await studentApi.getStudents();
      }
      
      const rawStudents = res.data?.students || res.students || res.data || [];
      const mappedStudents = rawStudents.map((apiStudent: any, index: number) => ({
        id: apiStudent._id || apiStudent.id || index + 2000,
        name: apiStudent.name || "Unknown",
        phone: apiStudent.phone || "-",
        country: apiStudent.country || apiStudent.preferredCountry || apiStudent.interestedCountry || "-",
        program: apiStudent.program || apiStudent.interestedProgram || "-",
        course: apiStudent.course || "-",
        university: apiStudent.university || apiStudent.interestedUniversity || "-",
        agent: apiStudent.agent || "-",
        status: apiStudent.pipelineStage || apiStudent.stage || apiStudent.status || "Lead",
        statusColor: "bg-emerald-100 text-emerald-700",
        enrollmentDate: apiStudent.enrollmentDate ? new Date(apiStudent.enrollmentDate).toISOString().split('T')[0] : "-"
      }));
      setStudents(mappedStudents);
      if (!isAdmin) {
        if (res.data?.stats) {
          setStats({
            total: res.data.total || mappedStudents.length,
            enrolledThisMonth: res.data.stats.enrolledThisMonth || res.data.stats.totalStudentsEnrolledThisMonth || 0,
            visaApproved: res.data.stats.visaApproved || 0,
            activeApps: res.data.stats.activeApplications || 0
          });
        } else {
          setStats(prev => ({ ...prev, total: mappedStudents.length }));
        }
      }
    } catch (err) {
      console.error("Failed to load students from API", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student? This action is permanent.")) {
      try {
        await studentApi.deleteStudent(id);
        fetchStudents();
      } catch (err) {
        console.error("Failed to delete student:", err);
        alert("Failed to delete student. Please try again.");
      }
    }
  };


  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">Students</h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">Manage converted students and enrollments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Total Students</p>
          <p className="text-2xl font-bold text-[#111827]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Enrolled This Month</p>
          <p className="text-2xl font-bold text-[#111827]">{stats.enrolledThisMonth}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Visa Approved</p>
          <p className="text-2xl font-bold text-[#111827]">{stats.visaApproved}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Active Applications</p>
          <p className="text-2xl font-bold text-[#111827]">{stats.activeApps}</p>
        </div>
      </div>


      {/* Actions Bar */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search students by name, university..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F8FAFC] transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F8FAFC] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {role === "AGENT" || role === "AGENT_MANAGER" ? "Add Lead" : "Add Student"}
          </button>
        </div>
      </div>

      {/* Students Table */}
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
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Enrollment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {student.name.split(" ").map((n: string) => n[0]).join("")}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-[#111827]">{student.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{student.phone}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{student.country}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{student.course}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{student.university}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{student.agent}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${student.statusColor}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#6B7280]">{student.enrollmentDate}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    <Link
                      to={`/students/${student.id}`}
                      className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]"
                    >
                      View
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="text-sm text-[#6B7280]">
            Showing <span className="font-medium text-[#111827]">1</span> to{" "}
            <span className="font-medium text-[#111827]">{students.length}</span> of{" "}
            <span className="font-medium text-[#111827]">{students.length}</span> results
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
              3
            </button>
            <button className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8FAFC] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
      {role === "AGENT" || role === "AGENT_MANAGER" ? (
        <AgentAddLeadModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          onSuccess={fetchStudents}
        />
      ) : (
        <AddStudentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}