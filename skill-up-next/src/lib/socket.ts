"use client";
import { io, Socket } from "socket.io-client";

// NEXT_PUBLIC_API_URL = http://localhost:4000/api
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
// Socket kết nối tới gốc server (bỏ hậu tố /api)
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

// File tĩnh phục vụ tại /api/uploads/... → url trả về dạng /uploads/... ghép với API_URL
export const fileUrl = (url: string): string => {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  return `${API_URL}${url}`;
};

let socket: Socket | null = null;

// Singleton: dùng chung 1 kết nối socket cho cả app
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true, // gửi cookie httpOnly `token` để handshake auth
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
