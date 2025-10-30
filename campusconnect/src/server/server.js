// server/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend
    methods: ["GET", "POST"],
  },
});

let waitingUsers = [];
let activePairs = new Map();

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  socket.on("joinQueue", ({ school, username }) => {
    socket.school = school;
    socket.username = username;

    // Find partner (prefer different school)
    let partnerIndex = waitingUsers.findIndex(
      (u) => u.school !== school && u.id !== socket.id
    );

    if (partnerIndex === -1) {
      partnerIndex = waitingUsers.findIndex((u) => u.id !== socket.id);
    }

    if (partnerIndex !== -1) {
      const partner = waitingUsers.splice(partnerIndex, 1)[0];

      // Store pairing
      activePairs.set(socket.id, partner.id);
      activePairs.set(partner.id, socket.id);

      // Notify both
      socket.emit("matched", {
        school: partner.school,
        username: partner.username,
      });

      io.to(partner.id).emit("matched", {
        school,
        username,
      });

      console.log(`🎉 Matched ${username} (${socket.id}) with ${partner.username} (${partner.id})`);
    } else {
      // Add to queue (store only simple info)
      waitingUsers.push({
        id: socket.id,
        school,
        username,
      });
      console.log(`🕒 ${username} added to waiting list (${school})`);
    }
  });

  socket.on("sendMessage", ({ text, username }) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("receiveMessage", { text, username });
    }
  });

  socket.on("leaveChat", () => {
    console.log("🚪 Left:", socket.id);
    const partnerId = activePairs.get(socket.id);

    if (partnerId) {
      io.to(partnerId).emit("partnerLeft");
      activePairs.delete(socket.id);
      activePairs.delete(partnerId);
    }

    waitingUsers = waitingUsers.filter((u) => u.id !== socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);

    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("partnerLeft");
      activePairs.delete(socket.id);
      activePairs.delete(partnerId);
    }

    waitingUsers = waitingUsers.filter((u) => u.id !== socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
