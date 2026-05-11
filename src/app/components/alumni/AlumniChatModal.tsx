import { useEffect, useRef, useState } from 'react';
import { X, Send, Loader2, Wifi, WifiOff, CheckCheck, MessageSquare } from 'lucide-react';
import { alumniApi } from '../../../lib/api';
import { useAlumniChat, ChatMessage } from '../../hooks/useAlumniChat';

interface AlumniChatModalProps {
  serviceId: string;
  serviceName: string;
  otherUserId: string;     // Alumni's user ID
  otherUserName: string;   // Alumni's display name
  currentUserId: string;   // Logged-in user's ID
  onClose: () => void;
}

export function AlumniChatModal({
  serviceId,
  serviceName,
  otherUserId,
  otherUserName,
  currentUserId,
  onClose,
}: AlumniChatModalProps) {
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history via REST on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await alumniApi.communications.getChat(serviceId);
        if (res?.success && res.data) {
          setInitialMessages(res.data);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [serviceId]);

  const { messages, isTyping, connected, sendMessage, sendTyping, markRead } = useAlumniChat({
    serviceId,
    otherUserId,
    currentUserId,
    initialMessages,
  });

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Mark as read when chat opens
  useEffect(() => {
    if (connected) markRead();
  }, [connected]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <div
        className="pointer-events-auto w-[380px] h-[560px] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-8 fade-in duration-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-lg">
            {otherUserName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm truncate">{otherUserName}</p>
            <p className="text-indigo-200 text-xs font-medium truncate">{serviceName}</p>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <Wifi className="w-4 h-4 text-green-300" title="Connected" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-300" title="Reconnecting..." />
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {historyLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-slate-400">
                Start a conversation with {otherUserName}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender._id === currentUserId || (msg.sender as any) === currentUserId;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <p className="font-medium leading-relaxed">{msg.message}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100">
          <div className="mb-2 px-2 py-1.5 bg-amber-50 rounded-lg flex items-start gap-2 border border-amber-100">
             <span className="text-xs leading-none">⚠️</span>
             <p className="text-[10px] font-bold text-amber-700 leading-tight">
                Don't pay outside the platform! We are not responsible for off-platform payments.
             </p>
          </div>
          <div className="flex items-end gap-2 bg-slate-50 rounded-2xl px-3 py-2">
            <textarea
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent resize-none outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 max-h-24 py-1.5"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {!connected && (
            <p className="text-center text-[10px] font-medium text-amber-500 mt-1.5">
              Connecting to real-time chat...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
