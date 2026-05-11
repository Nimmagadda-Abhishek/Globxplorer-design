import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, MessageCircle, MoreVertical, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { studentApi } from "../../lib/api";

export function StudentDetailsPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStageMenu, setShowStageMenu] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const role = localStorage.getItem("userRole");
  const isCounsellor = role === "COUNSELLOR";

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const res: any = await studentApi.getStudent(id);
        const data = res.data || res;
        setStudent(data);
        setFormData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load student details");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleSave = async () => {
    try {
      if (!id) return;
      setLoading(true);
      await studentApi.updateStudent(id, formData);
      setStudent(formData);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update student", err);
      alert("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = async (newStage: string) => {
    try {
      if (!id) return;
      const res: any = await studentApi.updateStudentStage(id, { stage: newStage });
      const updatedStudent = res.data || res;
      setStudent(updatedStudent);
      setFormData(updatedStudent);
      setShowStageMenu(false);
    } catch (err) {
      console.error("Failed to update stage", err);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "academic", label: "Academic Details" },
    { id: "documents", label: "Documents" },
    { id: "communication", label: "Communication" },
    { id: "application", label: "Application Status" },
  ];

  if (loading) return <div className="p-6">Loading student details...</div>;
  if (error || !student) return <div className="p-6 text-red-600">{error || "Student not found"}</div>;

  return (
    <div className="p-4 sm:p-6">
      <Link
        to="/leads"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] mb-4 sm:mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </Link>

      {/* Student Header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#4F46E5] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl font-medium text-white">
              {student.name ? student.name.split(" ").map((n: string) => n[0]).join("") : "S"}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-3 mb-1">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xl sm:text-2xl font-bold text-[#111827] bg-white border border-[#E5E7EB] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">{student.name}</h1>
              )}
              
              <div className="relative">
                <button 
                  onClick={() => setShowStageMenu(!showStageMenu)}
                  className="p-1 hover:bg-[#F3F4F6] rounded transition-colors"
                >
                  <span className="sr-only">Update Stage</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold cursor-pointer">
                    {student.pipelineStage || student.stage || "New"}
                    <MoreVertical className="w-3 h-3" />
                  </div>
                </button>
                {showStageMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowStageMenu(false)}
                    ></div>
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-xl z-50">
                      <div className="p-1">
                        {["New", "Counseling", "Shortlisting", "Application", "Offer Letter", "Visa Process", "Enrolled"].map((stage) => (
                          <button
                            key={stage}
                            onClick={() => handleStageUpdate(stage)}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#4F46E5] rounded transition-colors"
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#6B7280]">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white border border-[#E5E7EB] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                  />
                ) : (
                  student.email || "N/A"
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white border border-[#E5E7EB] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                  />
                ) : (
                  student.phone || "N/A"
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ""}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="bg-white border border-[#E5E7EB] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                  />
                ) : (
                  student.country || "N/A"
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Applied: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
        <div className="border-b border-[#E5E7EB]">
          <nav className="flex items-center justify-between px-6">
            <div className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-[#4F46E5] text-[#4F46E5]"
                      : "border-transparent text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {isCounsellor && (activeTab === "overview" || activeTab === "academic") && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-[#F3F4F6] rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-1.5 text-xs font-medium bg-[#4F46E5] text-white rounded-md hover:bg-[#4338CA] transition-colors"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 text-xs font-medium bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-colors"
                  >
                    Edit Details
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && <OverviewTab student={student} isEditing={isEditing} formData={formData} setFormData={setFormData} />}
          {activeTab === "academic" && <AcademicTab student={student} isEditing={isEditing} formData={formData} setFormData={setFormData} />}
          {activeTab === "documents" && <DocumentsTab student={student} studentId={id || ""} />}
          {activeTab === "communication" && <CommunicationTab student={student} />}
          {activeTab === "application" && <ApplicationTab student={student} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ student, isEditing, formData, setFormData }: { student: any; isEditing: boolean; formData: any; setFormData: any }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-left">
          <h3 className="text-sm font-medium text-[#111827] mb-3">Lead Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Lead Source</p>
              {isEditing ? (
                <input
                  type="text"
                  name="source"
                  value={formData.source || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.source || "N/A"}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Interested Program</p>
              {isEditing ? (
                <input
                  type="text"
                  name="interestedProgram"
                  value={formData.interestedProgram || formData.interest || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.interestedProgram || student.interest || "N/A"}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Preferred Country</p>
              {isEditing ? (
                <input
                  type="text"
                  name="interestedCountry"
                  value={formData.interestedCountry || formData.country || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.interestedCountry || student.country || "N/A"}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Loan Status</p>
              {isEditing ? (
                <select
                  name="loanStatus"
                  value={formData.loanStatus || "No"}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="In Progress">In Progress</option>
                </select>
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.loanStatus || "N/A"}</p>
              )}
            </div>
          </div>
        </div>

        <div className="text-left">
          <h3 className="text-sm font-medium text-[#111827] mb-3">Assigned Team</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
              <div className="w-10 h-10 bg-[#4F46E5] rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {student.assignedAgent?.name ? student.assignedAgent.name[0] : "A"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">{student.assignedAgent?.name || "Assigned Agent"}</p>
                <p className="text-xs text-[#6B7280]">Primary Agent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-[#111827] mb-3">Notes</h3>
        {student.notes && student.notes.length > 0 ? (
          <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-3">
            {student.notes.map((note: string, idx: number) => (
              <div key={idx} className="pb-3 border-b border-[#E5E7EB] last:border-0 last:pb-0 text-left">
                <p className="text-sm text-[#111827]">{note}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F8FAFC] rounded-lg p-4 text-sm text-[#6B7280] text-center italic">
            No notes have been added for this student yet.
          </div>
        )}
        <button className="mt-3 text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]">
          Add Note
        </button>
      </div>
    </div>
  );
}

function AcademicTab({ student, isEditing, formData, setFormData }: { student: any; isEditing: boolean; formData: any; setFormData: any }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-[#111827] mb-3">Current Education</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Education Background</p>
              {isEditing ? (
                <input
                  type="text"
                  name="educationBackground"
                  value={formData.educationBackground || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.educationBackground || "N/A"}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Percentage / CGPA</p>
              {isEditing ? (
                <input
                  type="text"
                  name="percentage"
                  value={formData.percentage || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.percentage || "N/A"}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Passing Year</p>
              {isEditing ? (
                <input
                  type="text"
                  name="passingYear"
                  value={formData.passingYear || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.passingYear || "N/A"}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Intake Preference</p>
              {isEditing ? (
                <input
                  type="text"
                  name="intake"
                  value={formData.intake || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.intake || "N/A"}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[#111827] mb-3">Language & Tests</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#6B7280] mb-1">IELTS Status / Score</p>
              {isEditing ? (
                <input
                  type="text"
                  name="ieltsStatus"
                  value={formData.ieltsStatus || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.ieltsStatus || "Not Provided"}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Passport Status</p>
              {isEditing ? (
                <input
                  type="text"
                  name="passportStatus"
                  value={formData.passportStatus || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.passportStatus || "N/A"}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Passport Number</p>
              {isEditing ? (
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.passportNumber || "N/A"}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Budget Range</p>
              {isEditing ? (
                <input
                  type="text"
                  name="budgetRange"
                  value={formData.budgetRange || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
              ) : (
                <p className="text-sm font-medium text-[#111827]">{student.budgetRange || "N/A"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-[#111827] mb-3">Standardized Tests</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280] mb-1">GRE</p>
            {isEditing ? (
              <input
                type="text"
                name="greScore"
                value={formData.greScore || ""}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            ) : (
              <p className="text-lg font-bold text-[#111827]">{student.greScore || "Not Provided"}</p>
            )}
          </div>
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280] mb-1">GMAT</p>
            {isEditing ? (
              <input
                type="text"
                name="gmatScore"
                value={formData.gmatScore || ""}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            ) : (
              <p className="text-lg font-bold text-[#111827]">{student.gmatScore || "Not Provided"}</p>
            )}
          </div>
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280] mb-1">Other Tests</p>
            <p className="text-lg font-bold text-[#111827]">N/A</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ student, studentId }: { student: any; studentId: string }) {
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const initialDocs = [
    { name: "Passport", type: "PASSPORT" },
    { name: "10th Marksheet", type: "ACADEMIC" },
    { name: "12th Marksheet", type: "ACADEMIC" },
    { name: "Degree Certificate", type: "ACADEMIC" },
    { name: "Transcripts", type: "ACADEMIC" },
    { name: "Resume/CV", type: "OTHER" },
    { name: "Statement of Purpose", type: "OTHER" },
    { name: "Letter of Recommendation 1", type: "OTHER" },
    { name: "Letter of Recommendation 2", type: "OTHER" },
  ];

  const handleUpload = async (docName: string, docType: string, file: File) => {
    try {
      setLoading(true);
      setUploadingDoc(docName);
      
      const formData = new FormData();
      formData.append("name", docName);
      formData.append("type", docType);
      formData.append("visibility", "Student"); // Default visibility
      formData.append("file", file);

      await studentApi.uploadDocument(studentId, formData);
      window.location.reload(); // Quick refresh to show new state
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload document");
    } finally {
      setLoading(false);
      setUploadingDoc(null);
    }
  };

  const getDocStatus = (name: string) => {
    const existing = student.documents?.find((d: any) => d.name === name);
    return existing ? { status: "uploaded", date: existing.createdAt } : { status: "pending", date: null };
  };

  return (
    <div className="text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialDocs.map((doc, index) => {
          const { status, date } = getDocStatus(doc.name);
          const isUploading = uploadingDoc === doc.name;

          return (
            <div
              key={index}
              className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB] hover:border-[#4F46E5] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  status === "uploaded" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                }`}>
                  {status === "uploaded" ? "Verified" : "Missing"}
                </span>
              </div>
              <p className="text-sm font-bold text-[#111827] mb-1">{doc.name}</p>
              <p className="text-[10px] text-[#6B7280] mb-3">
                {status === "uploaded" ? `Added on ${new Date(date).toLocaleDateString()}` : "Standard admission requirement"}
              </p>
              
              <div className="relative">
                <input
                  type="file"
                  id={`upload-${index}`}
                  className="hidden"
                  onChange={(e) => e.target.files && handleUpload(doc.name, doc.type, e.target.files[0])}
                />
                <label
                  htmlFor={`upload-${index}`}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    status === "uploaded"
                      ? "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]"
                      : "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-sm"
                  }`}
                >
                  {isUploading ? (
                    "Processing..."
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      {status === "uploaded" ? "Replace" : "Upload File"}
                    </>
                  )}
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommunicationTab({ student }: { student: any }) {
  const messages = student.messages || [];

  return (
    <div className="space-y-4">
      <div className="h-96 overflow-y-auto bg-[#F8FAFC] rounded-lg p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((msg: any, idx: number) => (
            <div
              key={idx}
              className={`flex ${msg.senderRole === "COUNSELLOR" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[70%] ${msg.senderRole === "COUNSELLOR" ? "flex-row-reverse" : ""}`}>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {msg.senderName ? msg.senderName.split(" ").map((n: string) => n[0]).join("") : "U"}
                    </span>
                  </div>
                </div>
                <div className={`flex flex-col ${msg.senderRole === "COUNSELLOR" ? "items-end" : ""}`}>
                  <div className={`rounded-lg p-3 ${
                    msg.senderRole === "COUNSELLOR"
                      ? "bg-[#4F46E5] text-white"
                      : "bg-white border border-[#E5E7EB] text-[#111827]"
                  }`}>
                    <p className="text-sm">{msg.content || msg.message}</p>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-[#6B7280] italic">
            No messages yet. Start a conversation!
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
        />
        <button className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors">
          Send
        </button>
      </div>
    </div>
  );
}

function ApplicationTab({ student }: { student: any }) {
  const timeline = student.stageHistory?.map((entry: any) => ({
    status: entry.stage,
    date: new Date(entry.timestamp).toLocaleDateString(),
    completed: true,
    comment: entry.comment
  })) || [{ status: student.pipelineStage || "Lead Created", date: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "Today", completed: true }];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-[#111827] mb-4">Application Timeline</h3>
        <div className="relative">
          {timeline.map((item, index) => (
            <div key={index} className="flex gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.completed
                    ? "bg-[#4F46E5] text-white"
                    : "bg-gray-200 text-gray-400"
                }`}>
                  {item.completed ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  )}
                </div>
                {index < timeline.length - 1 && (
                  <div className={`w-0.5 h-full mt-1 ${
                    item.completed ? "bg-[#4F46E5]" : "bg-gray-200"
                  }`}></div>
                )}
              </div>
              <div className="flex-1 pb-2 text-left">
                <p className="text-sm font-medium text-[#111827] mb-1">{item.status}</p>
                <p className="text-xs text-[#6B7280]">{item.date}</p>
                {item.comment && <p className="text-xs text-indigo-600 mt-1">{item.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-[#111827] mb-3">University Applications</h3>
        <div className="text-sm text-[#6B7280] bg-[#F8FAFC] rounded-lg p-4 text-center">
          No applications submitted yet
        </div>
      </div>
    </div>
  );
}