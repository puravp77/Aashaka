const express = require("express");
const {
  getUsersWithOrderCounts,
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getUsersWithOrderCounts);
router.get("/admins", protect, adminOnly, getAdminUsers);
router.post("/admins", protect, adminOnly, createAdminUser);
router.delete("/admins/:id", protect, adminOnly, deleteAdminUser);

module.exports = router;
