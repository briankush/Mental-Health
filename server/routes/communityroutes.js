const express = require("express");
const auth = require("../middleware/auth");
const { getMessages, createMessage, getRoom } = require("../controllers/communitycontroller");

const router = express.Router();

router.get("/rooms/:id", auth, getRoom);
router.get("/messages", auth, getMessages);
router.post("/messages", auth, createMessage);

module.exports = router;