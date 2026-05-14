import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://campusconnect-bcd.onrender.com";

export const socket = io(SOCKET_URL, { transports: ["websocket"] });
