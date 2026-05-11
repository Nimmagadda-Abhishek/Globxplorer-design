import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
  if (socket) return socket;

  const serverUrl = import.meta.env.VITE_API_URL || "https://api.globxplore.in";
  socket = io(serverUrl);

  socket.on("connect", () => {
    console.log("Connected to notification server");
    socket?.emit("join_room", userId);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
