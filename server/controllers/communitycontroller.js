const CommunityMessage = require("../models/communityMessage");
const User = require("../models/user");

const validRooms = new Set(["general", "stress", "book-club", "training"]);

const serializeMessage = (message) => ({
  id: message._id,
  roomId: message.roomId,
  userId: message.userId,
  username: message.username,
  text: message.text,
  createdAt: message.createdAt,
});

const getMessages = async (req, res) => {
  const roomId = String(req.query.roomId || "general");
  if (!validRooms.has(roomId)) {
    return res.status(400).json({ success: false, message: "Invalid community room" });
  }

  try {
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

  if (!validRooms.has(roomId)) {
    return res.status(400).json({ success: false, message: "Invalid community room" });
  }
  if (!text || text.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Message must be between 1 and 1000 characters",
    });
  }

  try {
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

module.exports = { getMessages, createMessage };