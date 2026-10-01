const mongoose = require("mongoose");
const CommunityMessage = require("../models/communityMessage");
const CommunityRoom = require("../models/communityRoom");
const User = require("../models/user");

const serializeMessage = (message) => ({
  id: String(message._id),
  roomId: String(message.roomId),
  userId: String(message.userId),
  username: message.username,
  text: message.text,
  createdAt: message.createdAt,
});

const getMessages = async (req, res) => {
  const roomId = String(req.query.roomId || "general");
  if (!mongoose.isValidObjectId(roomId)) {
    return res.status(404).json({ success: false, message: "Community room not found" });
  }
  try {
    const room = await CommunityRoom.exists({ _id: roomId, endedAt: null });
    if (!room) {
      return res.status(404).json({ success: false, message: "Community room not found" });
    }
    const messages = await CommunityMessage.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      messages: messages.reverse().map(serializeMessage),
    });
  } catch (error) {
    console.error("Load community messages error:", error);
    return res.status(500).json({ success: false, message: "Unable to load community messages" });
  }
};

const createMessage = async (req, res) => {
  const roomId = String(req.body?.roomId || "");
  const text = String(req.body?.text || "").trim();

  if (!mongoose.isValidObjectId(roomId)) {
    return res.status(404).json({ success: false, message: "Community room not found" });
  }
  if (!text || text.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Message must be between 1 and 1000 characters",
    });
  }

  try {
    const room = await CommunityRoom.exists({ _id: roomId, endedAt: null });
    if (!room) {
      return res.status(404).json({ success: false, message: "Community room not found" });
    }
    const user = await User.findById(req.user.id).select("name");
    if (!user) {
      return res.status(401).json({ success: false, message: "Your account could not be found" });
    }

    const message = await CommunityMessage.create({
      roomId,
      userId: user._id,
      username: user.name,
      text,
    });

    return res.status(201).json({ success: true, message: serializeMessage(message) });
  } catch (error) {
    console.error("Create community message error:", error);
    return res.status(500).json({ success: false, message: "Unable to send community message" });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await CommunityRoom.findOne({ _id: req.params.id, endedAt: null }).select("_id name createdAt").lean();
    if (!room) return res.status(404).json({ success: false, message: "Community room not found" });
    return res.json({ success: true, room: { id: room._id, name: room.name, createdAt: room.createdAt } });
  } catch (error) {
    return res.status(404).json({ success: false, message: "Community room not found" });
  }
};

const createRoom = async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name || name.length > 100) {
    return res.status(400).json({ success: false, message: "Room name must be between 1 and 100 characters" });
  }

  try {
    const room = await CommunityRoom.create({ name, createdBy: req.user.id });
    return res.status(201).json({ success: true, room: { id: room._id, name: room.name } });
  } catch (error) {
    console.error("Create community room error:", error);
    return res.status(500).json({ success: false, message: "Unable to create community room" });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await CommunityRoom.find({ endedAt: null })
      .select("_id name createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({
      success: true,
      rooms: rooms.map((room) => ({ id: room._id, name: room.name, createdAt: room.createdAt })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load community rooms" });
  }
};

const endRoom = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: "Community room not found" });
  }
  try {
    const room = await CommunityRoom.findOneAndDelete({ _id: req.params.id, endedAt: null }).lean();
    if (!room) return res.status(404).json({ success: false, message: "Community room not found" });
    await CommunityMessage.deleteMany({ roomId: room._id });
    req.app.get("io")?.to(String(room._id)).emit("room:ended");
    return res.json({ success: true, room: { id: room._id, name: room.name } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to end community room" });
  }
};

module.exports = { getMessages, createMessage, getRoom, createRoom, getRooms, endRoom };