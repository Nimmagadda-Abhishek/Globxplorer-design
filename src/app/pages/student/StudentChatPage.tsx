import { 
  MessageSquare, 
  AlertTriangle, 
  MessageCircle, 
  Phone, 
  Send, 
  UserCircle,
  Clock,
  ShieldCheck,
  Loader2,
  Search,
  ChevronRight,
  Wifi, 
  WifiOff, 
  CheckCheck
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { studentPortalApi } from "../../../lib/api";
import { useAlumniChat } from "../../hooks/useAlumniChat";

export function StudentChatPage() {
  const location = useLocation();
  const navState = (location.state as any) || {};
  const [activeView, setActiveView] = useState<'support' | 'alumni'>(navState.activeView || 'support');
  
  // Support chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [studentId, setStudentId] = useState<string>("");
  
  // Alumni chat state
  const [threads, setThreads] = useState<any[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [threadMessage, setThreadMessage] = useState("");
  const [threadSearchQuery, setThreadSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload._id || '';
    } catch { return ''; }
  })();

  // Fetch support messages via profile API
  useEffect(() => {
    if (activeView !== 'support') return;
    const fetchSupport = async () => {
      try {
        const res = await studentPortalApi.profile.get().catch(() => null);
        if (res?.data) {
          setStudentId(res.data._id || res.data.id);
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load support chat", err);
      }
    };
    fetchSupport();
    
    // Simple polling for new messages could go here if needed
    const interval = setInterval(fetchSupport, 10000);
    return () => clearInterval(interval);
  }, [activeView]);

  // Fetch alumni chat threads
  useEffect(() => {
    if (activeView !== 'alumni') return;
    const fetchThreads = async () => {
      try {
        setLoadingThreads(true);
        const res = await studentPortalApi.alumni.chat.getAllThreads().catch(() => null);
        if (res?.data) {
          setThreads(res.data);
          // If navigated from service card, pre-select that thread
          if (navState.serviceId) {
            const match = res.data.find((t: any) => t.service?._id === navState.serviceId);
            setActiveThread(match || res.data[0] || null);
          } else if (res.data.length > 0) {
            setActiveThread(res.data[0]);
          }
        }
      } finally {
        setLoadingThreads(false);
      }
    };
    fetchThreads();
  }, [activeView]);

  // Fetch messages for active alumni thread via REST
  const [historyMessages, setHistoryMessages] = useState<any[]>([]);
  useEffect(() => {
    if (!activeThread?.service?._id) return;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await studentPortalApi.alumni.chat.getMessages(activeThread.service._id, currentUserId).catch(() => null);
        setHistoryMessages(res?.data || []);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeThread]);

  const {
    messages: socketMessages,
    isTyping,
    connected,
    sendMessage,
    sendTyping
  } = useAlumniChat({
    serviceId: activeThread?.service?._id || "",
    otherUserId: activeThread?.otherUser?._id || "",
    currentUserId,
    initialMessages: historyMessages,
  });

  const displayMessages = socketMessages;

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, messages, isTyping]);

  const handleSendSupport = async () => {
    const targetId = studentId || currentUserId;
    if (!newMessage.trim() || sending) return;
    if (!targetId) {
      alert("Error: Student ID not found.");
      return;
    }
    const msgText = newMessage.trim();
    setNewMessage("");
    setSending(true);
    
    try {
      await studentPortalApi.chat.sendMessage(targetId, msgText);
      setMessages(prev => [...prev, { 

        sender: 'student', 
        text: msgText,
        content: msgText,
        timestamp: new Date().toISOString() 
      }]);
    } catch (err) {
      console.error("Failed to send support message", err);
    } finally {
      setSending(false);
    }
  };

  const handleSendAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadMessage.trim() || !activeThread?.service?._id) return;
    const msgText = threadMessage.trim();
    setThreadMessage("");
    sendMessage(msgText);
  };

  const handleAlumniInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThreadMessage(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  const formatTime = (iso: string | Date) => {
    try { 
      const date = typeof iso === 'string' ? new Date(iso) : iso;
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); 
    } catch { return ""; }
  };

  const filteredThreads = threads.filter((t) =>
    (t.otherUser?.name || "").toLowerCase().includes(threadSearchQuery.toLowerCase()) ||
    (t.service?.serviceType || "").toLowerCase().includes(threadSearchQuery.toLowerCase())
  );

  const supportOptions = [
    { id: 'counsellor', title: "Chat with Counsellor", desc: "Instant guidance on your application and documents.", icon: MessageSquare, color: "bg-indigo-600", active: true, agent: "Counsellor" },
    { id: 'concern', title: "Raise a Concern", desc: "Not happy with the service? Let us know directly.", icon: AlertTriangle, color: "bg-rose-600", active: false, info: "Unresolved issues are escalated after 24h." },
    { id: 'whatsapp', title: "WhatsApp Admin", desc: "Connect with our head office for urgent queries.", icon: MessageCircle, color: "bg-[#25D366]", active: false }
  ];

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tab Toggle */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex-1">Chat Support</h1>
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setActiveView('support')}
            className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${activeView === 'support' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Support
          </button>
          <button
            onClick={() => setActiveView('alumni')}
            className={`px-5 py-2 rounded-lg text-sm font-black transition-all ${activeView === 'alumni' ? 'bg-white shadow text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Chat with Alumni
          </button>
        </div>
      </div>

      {activeView === 'support' ? (
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
          {/* Support Sidebar */}
          <div className="w-full md:w-72 space-y-4 overflow-y-auto flex-shrink-0">
            {supportOptions.map((opt) => (
              <div key={opt.id} className={`p-5 rounded-3xl border transition-all cursor-pointer ${opt.active ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-50' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${opt.color}`}>
                    <opt.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-900">{opt.title}</h3>
                    <p className="text-[10px] font-medium text-slate-400 mt-1">{opt.desc}</p>
                    {opt.agent && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white ring-1 ring-green-100 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{opt.agent} is online</span>
                      </div>
                    )}
                    {opt.info && (
                      <div className="mt-3 flex items-start gap-1.5 p-2 bg-rose-50 rounded-lg">
                        <Clock className="w-3 h-3 text-rose-500 mt-0.5" />
                        <span className="text-[9px] font-bold text-rose-700">{opt.info}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative">
              <h4 className="text-sm font-black mb-2">Emergency Help?</h4>
              <p className="text-[10px] font-medium text-slate-400 mb-4">Call our 24/7 helpline for immediate assistance.</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors">
                <Phone className="w-3.5 h-3.5" /> Support
              </button>
            </div>
          </div>

          {/* Support Chat Area */}
          <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col overflow-hidden shadow-sm min-h-0">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <UserCircle className="w-10 h-10" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Support Team</h3>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Support Expert</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageSquare className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="font-bold text-sm">Start the conversation</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.sender === 'me' || msg.sender === 'student';
                return (
                  <div key={i} className={`flex items-start gap-4 ${isMine ? 'flex-row-reverse max-w-[80%] ml-auto' : 'max-w-[80%]'}`}>
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-black ${isMine ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                      {isMine ? 'ME' : 'ST'}
                    </div>
                    <div className={isMine ? 'text-right' : 'text-left'}>
                      <div className={`p-4 rounded-2xl shadow-lg ${isMine ? 'bg-indigo-600 rounded-tr-none shadow-indigo-100' : 'bg-white border border-slate-100 rounded-tl-none shadow-slate-100'}`}>
                        <p className={`text-sm font-medium ${isMine ? 'text-white' : 'text-slate-700'}`}>{msg.text || msg.content}</p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-slate-50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendSupport()}
                  className="w-full pl-6 pr-28 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
                />
                <button
                  onClick={handleSendSupport}
                  disabled={sending || !newMessage.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Alumni Chat View */
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex min-h-0">
          {/* Thread List */}
          <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/50 flex-shrink-0">
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alumni..."
                  value={threadSearchQuery}
                  onChange={(e) => setThreadSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {loadingThreads ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-violet-600 animate-spin" /></div>
              ) : filteredThreads.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">No conversations yet</p>
                  <p className="text-xs text-slate-400 mt-1">Book a service to start chatting</p>
                </div>
              ) : (
                filteredThreads.map((thread, i) => {
                  const isActive = activeThread?.service?._id === thread.service?._id;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveThread(thread)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left ${isActive ? 'bg-violet-600 shadow-lg shadow-violet-600/20 text-white' : 'hover:bg-white hover:shadow-sm text-slate-900'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black flex-shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-600'}`}>
                        {thread.otherUser?.name?.charAt(0) || "A"}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className={`text-sm font-black truncate`}>{thread.otherUser?.name}</h4>
                        <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-violet-200' : 'text-slate-500'}`}>{thread.service?.serviceType}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-violet-200' : 'text-slate-300'}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeThread ? (
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {/* Chat Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100">
                      {activeThread.otherUser?.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-none">{activeThread.otherUser?.name}</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1.5 flex items-center gap-2">
                        {activeThread.service?.serviceType}
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        ID: {activeThread.otherUser?.gxId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {connected ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <Wifi className="w-3 h-3" /> Live
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <WifiOff className="w-3 h-3" /> Connecting...
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                  {loadingMessages && displayMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="font-bold text-sm">Loading conversation...</p>
                    </div>
                  ) : displayMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 opacity-50 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">No messages yet</p>
                        <p className="text-xs font-medium mt-1">Start a conversation with {activeThread.otherUser?.name}</p>
                      </div>
                    </div>
                  ) : (
                    displayMessages.map((msg, i) => {
                      const isMine = msg.sender?._id === currentUserId || msg.sender === currentUserId;
                      return (
                        <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          {!isMine && (
                            <div className="w-8 h-8 bg-slate-200 rounded-lg flex-shrink-0 mr-3 mt-1 flex items-center justify-center text-xs font-black text-slate-500">
                              {activeThread.otherUser?.name?.charAt(0)}
                            </div>
                          )}
                          <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                            <div className={`px-5 py-3.5 rounded-[2rem] text-sm font-medium shadow-sm leading-relaxed ${
                              isMine 
                                ? "bg-indigo-600 text-white rounded-tr-none" 
                                : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                            }`}>
                              {msg.message}
                            </div>
                            <div className={`flex items-center gap-1.5 mt-2 ${isMine ? "justify-end" : "justify-start"}`}>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {formatTime(msg.createdAt)}
                              </span>
                              {isMine && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 rounded-[1.5rem] rounded-tl-none shadow-sm px-4 py-3">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-5 border-t border-slate-100 bg-white">
                  <form onSubmit={handleSendAlumni} className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={threadMessage}
                        onChange={handleAlumniInputChange}
                        placeholder="Type your message here..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!threadMessage.trim() || !connected}
                      className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-200 flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  {!connected && (
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-3 text-center">
                      Reconnecting to live server...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-600 text-lg">No conversation selected</p>
                  <p className="text-sm mt-1 text-slate-400">Select a thread or book an alumni service to begin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

