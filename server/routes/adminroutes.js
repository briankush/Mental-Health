const express = require("express");
const router = express.Router();
const { getStats, getUsers, deleteUser } = require("../controllers/admincontroller");
const { createRoom, getRooms, endRoom } = require("../controllers/communitycontroller");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

// All admin routes require: valid JWT (auth) + admin role (adminOnly)
router.get("/stats", auth, adminOnly, getStats);
router.get("/users", auth, adminOnly, getUsers);
router.delete("/users/:id", auth, adminOnly, deleteUser);
router.post("/community/rooms", auth, adminOnly, createRoom);
router.get("/community/rooms", auth, adminOnly, getRooms);
router.delete("/community/rooms/:id", auth, adminOnly, endRoom);

module.exports = router;
