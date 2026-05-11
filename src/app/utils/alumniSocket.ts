import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initAlumniSocket = (token: string) => {
  if (socket) return socket;

  const serverUrl = (import.meta.env.VITE_API_URL || "https://api.globxplore.in").replace('/api/v1', '');

  // Use the specific namespace /alumni-chat
  socket = io(`${serverUrl}/alumni-chat`, {
    auth: {
      token: token
    },
    transports: ['websocket']
  });

  socket.on("connect", () => {
    console.log("Connected to Alumni Chat Socket");
  });

  socket.on("connect_error", (err) => {
    console.error("Alumni Chat Socket Connection Error:", err.message);
  });

  return socket;
};

export const getAlumniSocket = () => socket;

export const disconnectAlumniSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
