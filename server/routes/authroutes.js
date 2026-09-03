const express = require("express");

const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authcontroller");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);
router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateProfile);

module.exports = router;

// 