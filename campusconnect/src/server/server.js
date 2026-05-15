// server/server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

// ✅ Optional test route — helps confirm server is live on Render
app.get("/", (req, res) => {
  res.send("CampusConnect server is running ✅");
});

const server = createServer(app);

// ✅ Restrict to your frontend URLs

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // local dev
      "https://campusconnect-bcd.onrender.com", // ✅ your Render backend domain
      "https://campusconnectbcd.onrender.com",  // ✅ (optional) if frontend is separate
    ],
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

      // Notify both users
      socket.emit("matched", {
        school: partner.school,
        username: partner.username,
      });

      io.to(partner.id).emit("matched", {
        school,
        username,
      });

      console.log(
        `🎉 Matched ${username} (${socket.id}) with ${partner.username} (${partner.id})`
      );
    } else {
      // Add to waiting queue
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

// ✅ Render uses dynamic port
const PORT = process.env.PORT || 10000; // ✅ use Render-assigned port
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
