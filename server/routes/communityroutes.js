const express = require("express");
const auth = require("../middleware/auth");
const { getMessages, createMessage } = require("../controllers/communitycontroller");

const router = express.Router();

router.get("/messages", auth, getMessages);
router.post("/messages", auth, createMessage);

module.exports = router;