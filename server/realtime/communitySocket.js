const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const CommunityRoom = require("../models/communityRoom");
const CommunityMessage = require("../models/communityMessage");

function registerCommunitySocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name tokenVersion role");
      if (!user || (decoded.tokenVersion ?? 0) !== (user.tokenVersion || 0)) {
        return next(new Error("Invalid or expired session"));
      }

      socket.user = { id: String(user._id), name: user.name, role: user.role };
      return next();
    } catch (error) {
      return next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", (socket) => {
    let activeRoomId = null;
    let isTyping = false;

    const emitPresence = async (roomId) => {
      const sockets = await io.in(roomId).fetchSockets();
      io.to(roomId).emit("room:presence", { count: sockets.length });
    };

    const stopTyping = () => {
      if (!activeRoomId || !isTyping) return;
      isTyping = false;
      socket.to(activeRoomId).emit("typing:stop", {
        userId: socket.user.id,
        username: socket.user.name,
      });
    };

    socket.on("room:join", async (roomId, callback = () => {}) => {
      if (!mongoose.isValidObjectId(roomId)) return callback({ ok: false, message: "Room not found" });
      const room = await CommunityRoom.findOne({ _id: roomId, endedAt: null }).select("_id name").lean();
      if (!room) return callback({ ok: false, message: "Room not found" });

      if (activeRoomId) {
        stopTyping();
        await socket.leave(activeRoomId);
        await emitPresence(activeRoomId);
      }

      activeRoomId = String(room._id);
      await socket.join(activeRoomId);
      await emitPresence(activeRoomId);
      callback({ ok: true, room: { id: activeRoomId, name: room.name } });
    });

    socket.on("typing:start", () => {
      if (!activeRoomId || isTyping) return;
      isTyping = true;
      socket.to(activeRoomId).emit("typing:start", {
        userId: socket.user.id,
        username: socket.user.name,
      });
    });

    socket.on("typing:stop", stopTyping);

    socket.on("message:send", async ({ text }, callback = () => {}) => {
      const cleanText = String(text || "").trim();
      if (!activeRoomId) return callback({ ok: false, message: "Join a room first" });
      if (!cleanText || cleanText.length > 1000) {
        return callback({ ok: false, message: "Message must be between 1 and 1000 characters" });
      }

      try {
        const room = await CommunityRoom.exists({ _id: activeRoomId, endedAt: null });
        if (!room) return callback({ ok: false, message: "This room has ended" });
        const message = await CommunityMessage.create({
          roomId: activeRoomId,
          userId: socket.user.id,
          username: socket.user.name,
          text: cleanText,
        });
        const payload = {
          id: message._id,
          roomId: message.roomId,
          userId: message.userId,
          username: message.username,
          text: message.text,
          createdAt: message.createdAt,
        };
        stopTyping();
        io.to(activeRoomId).emit("message:new", payload);
        callback({ ok: true });
      } catch (error) {
        callback({ ok: false, message: "Unable to send community message" });
      }
    });

    socket.on("room:leave", async (callback = () => {}) => {
      if (!activeRoomId) return callback({ ok: true });
      const roomId = activeRoomId;
      stopTyping();
      await socket.leave(roomId);
      activeRoomId = null;
      await emitPresence(roomId);
      callback({ ok: true });
    });

    socket.on("disconnect", async () => {
      stopTyping();
      if (activeRoomId) await emitPresence(activeRoomId);
    });
  });
}

module.exports = registerCommunitySocket;