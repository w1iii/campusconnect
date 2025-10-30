import { io } from "socket.io-client";

const socket = io("https://campusconnectbcd.onrender.com", {
  transports: ["websocket"],
  withCredentials: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
});

export default socket;
