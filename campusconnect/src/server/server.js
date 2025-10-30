// server.js
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins
  },
});

let waitingUsers = [];
let activePairs = new Map();

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("joinQueue", (data) => {
    socket.school = data.school;
    socket.username = data.username;

    // ✅ Try to find a partner from a different school first
    let partnerIndex = waitingUsers.findIndex(
      (u) => u.school !== data.school && u.id !== socket.id
    );

    // 🟢 If none found, allow same-school match
    if (partnerIndex === -1) {
      partnerIndex = waitingUsers.findIndex((u) => u.id !== socket.id);
    }

    if (partnerIndex !== -1) {
      // Found a match
      const partner = waitingUsers.splice(partnerIndex, 1)[0];
      activePairs.set(socket.id, partner.id);
      activePairs.set(partner.id, socket.id);

      socket.emit("matched", {
        school: partner.school,
        username: partner.username,
      });

      partner.socket.emit("matched", {
        school: socket.school,
        username: socket.username,
      });
    } else {
      // No match found, add to queue
      waitingUsers.push({
        id: socket.id,
        school: socket.school,
        username: socket.username,
        socket,
      });
    }
  });

  socket.on("sendMessage", (data) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("receiveMessage", {
        text: data.text,
        username: data.username,
      });
    }
  });

  // 🆕 Handle when user clicks “Next” (Find new partner)
  socket.on("next", () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("partnerLeft");
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
    }

    waitingUsers.push({
      id: socket.id,
      school: socket.school,
      username: socket.username,
      socket,
    });

    socket.emit("searching");
  });

  // 🆕 Handle when user clicks “Leave” on the frontend
  socket.on("leaveChat", () => {
    console.log("🚪 User left the chat:", socket.id);

    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("partnerLeft");
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
    }

    // Also remove from waiting queue if they were waiting
    waitingUsers = waitingUsers.filter((u) => u.id !== socket.id);
  });

  // Handle disconnection (refresh, close tab, network loss)
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("partnerLeft");
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
    }

    waitingUsers = waitingUsers.filter((u) => u.id !== socket.id);
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
