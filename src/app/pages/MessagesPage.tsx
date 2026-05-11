import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, User, Phone, Globe, Loader2, Send, Paperclip } from "lucide-react";
import { counsellorApi, adminApi } from "../../lib/api";

export function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      scrollToBottom();
    }
  }, [selectedStudent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch list of students
      const res = await counsellorApi.getMyStudents();
      const studentList = res.data || [];
      setStudents(studentList);
      
      if (studentList.length > 0 && !selectedStudent) {
        // Fetch full details for the first student (to get messages)
        const firstRes = await adminApi.students.get(studentList[0]._id);
        setSelectedStudent(firstRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student: any) => {
    try {
      const res = await adminApi.students.get(student._id);
      setSelectedStudent(res.data);
    } catch (err) {
      console.error("Failed to fetch student details:", err);
      setSelectedStudent(student); // Fallback to list data
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedStudent || sending) return;
    
    setSending(true);
    try {
      await (counsellorApi as any).sendMessage(selectedStudent._id, { message: messageInput });
      setMessageInput("");
      // Refresh student data to show new message
      const res = await adminApi.students.get(selectedStudent._id);
      setSelectedStudent(res.data);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleWhatsAppChat = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const finalPhone = cleanPhone.startsWith("+") ? cleanPhone.substring(1) : cleanPhone;
    window.open(`https://wa.me/${finalPhone}`, "_blank");
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.gxId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111827] mb-1">Internal Messaging</h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">Real-time chat with your assigned students</p>
        </div>
        {selectedStudent?.phone && (
          <button
            onClick={() => handleWhatsAppChat(selectedStudent.phone)}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#128C7E] transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Switch to WhatsApp
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <div className="flex h-full">
          {/* Students List */}
          <div className={`${selectedStudent && window.innerWidth < 768 ? 'hidden' : 'flex'} w-full md:w-80 border-r border-[#E5E7EB] flex-col bg-white z-10`}>
            <div className="p-4 border-b border-[#E5E7EB]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="w-6 h-6 text-[#4F46E5] animate-spin" />
                </div>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <button
                    key={student._id}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full p-4 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-all text-left ${
                      selectedStudent?._id === student._id ? "bg-[#EEF2FF] border-l-4 border-l-[#4F46E5]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#4F46E5] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white uppercase">
                          {student.name?.substring(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#111827] truncate">{student.name}</p>
                        <p className="text-[10px] font-black text-[#9CA3AF] tracking-widest uppercase">{student.gxId}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <User className="w-8 h-8 text-[#E5E7EB] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">No students found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-[#F9FAFB]">
            {selectedStudent ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedStudent(null)}
                      className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <User className="w-5 h-5 text-[#6B7280]" />
                    </button>
                    <div className="w-10 h-10 bg-[#4F46E5] rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white uppercase">{selectedStudent.name?.substring(0, 2)}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">{selectedStudent.name}</h3>
                      <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Active Chat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-tighter">GXID</p>
                      <p className="text-xs font-bold text-[#4F46E5]">{selectedStudent.gxId}</p>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                  {selectedStudent.messages && selectedStudent.messages.length > 0 ? (
                    selectedStudent.messages.map((msg: any, index: number) => {
                      const isMe = msg.senderRole === 'COUNSELLOR' || msg.senderRole === 'ADMIN';
                      return (
                        <div 
                          key={index} 
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`px-4 py-3 rounded-2xl text-sm ${
                              isMe 
                                ? 'bg-[#4F46E5] text-white rounded-tr-none shadow-md shadow-indigo-100' 
                                : 'bg-white text-[#374151] rounded-tl-none border border-[#E5E7EB] shadow-sm'
                            }`}>
                              <p className="leading-relaxed">{msg.content}</p>
                            </div>
                            <span className="text-[10px] font-bold text-[#9CA3AF] mt-1 px-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-[#E5E7EB]">
                        <MessageCircle className="w-8 h-8 text-[#CBD5E1]" />
                      </div>
                      <p className="text-sm font-bold text-[#6B7280]">No messages yet</p>
                      <p className="text-xs text-[#9CA3AF]">Start the conversation below</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-[#E5E7EB]">
                  <div className="flex items-end gap-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#4F46E5] transition-all">
                    <button className="p-2.5 hover:bg-gray-200 rounded-xl text-[#9CA3AF] transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      rows={1}
                      className="flex-1 bg-transparent border-none outline-none text-sm py-2.5 resize-none max-h-32 custom-scrollbar"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending}
                      className="p-2.5 bg-[#4F46E5] text-white rounded-xl hover:bg-[#4338CA] transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 shadow-lg shadow-indigo-100"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
                <div className="w-24 h-24 bg-white rounded-[2rem] border border-[#E5E7EB] flex items-center justify-center mb-6 shadow-sm">
                  <MessageCircle className="w-12 h-12 text-[#CBD5E1]" />
                </div>
                <h3 className="text-xl font-black text-[#111827]">Internal Chat</h3>
                <p className="text-sm text-[#6B7280] max-w-xs mt-2">Select a student from the list to begin messaging within the CRM.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}