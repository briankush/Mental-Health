const express = require("express");

const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
} = require("../controllers/authcontroller");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);
router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateProfile);
router.post("/logout", auth, logout);

module.exports = router;

// 