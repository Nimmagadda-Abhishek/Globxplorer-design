import { useState, useEffect, useRef } from "react";
import { Search, MessageSquare, Send, Loader2, User, Clock, CheckCheck, Wifi, WifiOff, ChevronRight } from "lucide-react";
import { alumniApi } from "../../../lib/api";
import { useAlumniChat } from "../../hooks/useAlumniChat";
import { useSearchParams } from "react-router";

export function AlumniCommunicationPage() {
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const studentIdParam = searchParams.get("studentId");
  const serviceIdParam = searchParams.get("serviceId");

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload._id || '';
    } catch { return ''; }
  })();

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        const res = await alumniApi.chat.getAllThreads().catch(() => null);
        if (res?.data) {
          const validThreads = res.data.filter((t: any) => t.otherUser?._id);
          setThreads(validThreads);
          
          // If we have query params, try to find and set that thread as active
          if (studentIdParam && serviceIdParam) {
            const matched = validThreads.find((t: any) => 
              t.otherUser._id === studentIdParam && 
              t.service?._id === serviceIdParam
            );
            if (matched) {
              setActiveThread(matched);
            } else if (validThreads.length > 0) {
              setActiveThread(validThreads[0]);
            }
          } else if (validThreads.length > 0) {
            setActiveThread(validThreads[0]);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, [studentIdParam, serviceIdParam]);

  const [historyMessages, setHistoryMessages] = useState<any[]>([]);
  useEffect(() => {
    if (!activeThread?.service?._id) return;
    const studentId = activeThread.otherUser?._id;
    if (!studentId) {
      setHistoryMessages([]);
      return;
    }
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await alumniApi.chat.getMessages(activeThread.service._id, studentId).catch(() => null);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThread?.service?._id) return;

    const msgText = newMessage.trim();
    setNewMessage("");
    sendMessage(msgText, activeThread.otherUser?._id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  const filteredThreads = threads.filter((t) =>
    (t.otherUser?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.service?.serviceType || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Communication</h1>
          <p className="text-slate-500 mt-1 font-medium">Chat with students about your services.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex">
        <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50 flex-shrink-0">
          <div className="p-5 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">
                No conversations yet
              </div>
            ) : (
              filteredThreads.map((thread, i) => {
                const isActive = activeThread?.service?._id === thread.service?._id && activeThread?.otherUser?.gxId === thread.otherUser?.gxId;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveThread(thread)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left ${isActive ? "bg-violet-600 shadow-lg shadow-violet-600/20" : "hover:bg-white hover:shadow-sm"}`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${isActive ? "bg-white/20 text-white" : "bg-violet-100 text-violet-600"}`}>
                      {thread.otherUser?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-black truncate ${isActive ? "text-white" : "text-slate-900"}`}>
                          {thread.otherUser?.name || "Unknown"}
                        </h4>
                        <span className={`text-[10px] font-bold ${isActive ? "text-violet-200" : "text-slate-400"}`}>
                          {thread.timestamp ? formatTime(thread.timestamp) : ""}
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 font-medium ${isActive ? "text-violet-200" : "text-slate-500"}`}>
                        {thread.service?.serviceType || "Service"}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-violet-200" : "text-slate-300"}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          {activeThread ? (
            <>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 font-black text-xl">
                    {activeThread.otherUser?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-none">
                      {activeThread.otherUser?.name}
                    </h3>
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

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {loadingMessages && displayMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="font-bold text-sm">Loading conversation...</p>
                  </div>
                ) : displayMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 opacity-50">
                    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-sm">No messages yet. Say hi!</p>
                  </div>
                ) : (
                  displayMessages.map((msg, i) => {
                    const isMine = msg.sender?._id === currentUserId || msg.sender === currentUserId || msg.isMine;
                    return (
                      <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        {!isMine && (
                          <div className="w-8 h-8 bg-slate-200 rounded-lg flex-shrink-0 mr-3 mt-1 flex items-center justify-center text-xs font-black text-slate-500">
                            {activeThread.otherUser?.name?.charAt(0)}
                          </div>
                        )}
                        <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                          <div
                            className={`px-5 py-3.5 rounded-[2rem] text-sm font-medium shadow-sm leading-relaxed ${
                              isMine
                                ? "bg-violet-600 text-white rounded-tr-none"
                                : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                            }`}
                          >
                            {msg.message}
                          </div>
                          <div className={`flex items-center gap-1.5 mt-2 ${isMine ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {formatTime(msg.createdAt)}
                            </span>
                            {isMine && <CheckCheck className="w-3 h-3 text-violet-400" />}
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

              <div className="p-5 border-t border-slate-100 bg-white">
                <form onSubmit={handleSend} className="flex gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e as any);
                        }
                      }}
                      placeholder="Type your message here..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all resize-none max-h-32"
                      rows={1}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !connected}
                    className="w-14 h-14 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-violet-200 flex-shrink-0"
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="font-black text-slate-600 text-lg">No conversation selected</p>
                <p className="text-sm mt-1">Pick a thread from the left to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
