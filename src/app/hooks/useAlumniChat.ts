import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export interface ChatMessage {
  _id: string;
  sender: { _id: string; name: string; gxId?: string };
  receiver: { _id: string; name: string; gxId?: string };
  serviceId: string;
  message: string;
  createdAt: string;
}

interface UseAlumniChatOptions {
  serviceId: string;
  otherUserId: string;
  currentUserId: string;
  initialMessages?: ChatMessage[];
}

export function useAlumniChat({
  serviceId,
  otherUserId,
  currentUserId,
  initialMessages = [],
}: UseAlumniChatOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !serviceId || !otherUserId) return;

    const socket = io(`${SOCKET_URL}/alumni-chat`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Join the shared room for this service conversation
      socket.emit('alumni:join_chat', { serviceId, otherUserId });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('alumni:new_message', (msg: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicates (e.g. sender sees it from the room echo)
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('alumni:typing', ({ senderId, isTyping: typing }: { senderId: string; isTyping: boolean }) => {
      if (senderId !== currentUserId) setIsTyping(typing);
    });

    socket.on('alumni:read', () => {
      // Could update read receipt UI here
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serviceId, otherUserId, currentUserId]);

  // Update messages if initialMessages load async
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const sendMessage = useCallback(
    (message: string, receiverId?: string) => {
      if (!socketRef.current || !message.trim()) return;
      socketRef.current.emit('alumni:send', {
        serviceId,
        message: message.trim(),
        receiverId: receiverId || otherUserId,
      });
      // Stop typing indicator
      socketRef.current.emit('alumni:typing', { serviceId, otherUserId, isTyping: false });
    },
    [serviceId, otherUserId]
  );

  const sendTyping = useCallback(
    (typing: boolean) => {
      if (!socketRef.current) return;
      socketRef.current.emit('alumni:typing', { serviceId, otherUserId, isTyping: typing });

      if (typing) {
        // Auto-stop typing after 3 seconds of inactivity
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          socketRef.current?.emit('alumni:typing', { serviceId, otherUserId, isTyping: false });
        }, 3000);
      }
    },
    [serviceId, otherUserId]
  );

  const markRead = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('alumni:read', { serviceId, otherUserId });
  }, [serviceId, otherUserId]);

  return { messages, isTyping, connected, sendMessage, sendTyping, markRead };
}
