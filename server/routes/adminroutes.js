const express = require("express");
const router = express.Router();
const { getStats, getUsers } = require("../controllers/admincontroller");

router.get("/stats", getStats);
router.get("/users", getUsers);

module.exports = router;
