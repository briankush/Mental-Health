const Book = require("../models/books");
const Audio = require("../models/audio");
const User = require("../models/user");

// GET ADMIN DASHBOARD STATS
const getStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const freeBooks = await Book.countDocuments({ price: 0 });
    const paidBooks = await Book.countDocuments({ price: { $gt: 0 } });

    const totalAudio = await Audio.countDocuments();
    
    // User counts
    const totalUsers = await User.countDocuments();
    const therapistCount = await User.countDocuments({ role: "therapist" });
    const adminCount = await User.countDocuments({ role: "admin" });
    const clientCount = await User.countDocuments({ role: { $nin: ["therapist", "admin"] } });

    res.json({
      success: true,
      stats: {
        totalBooks,
        freeBooks,
        paidBooks,
        totalAudio,
        totalUsers,
        therapistCount,
        adminCount,
        clientCount,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE USER (Admin only)
const deleteUser = async (req, res) => {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ success: false, message: "You cannot delete your own admin account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  deleteUser,
};
