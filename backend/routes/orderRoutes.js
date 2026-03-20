const express = require("express");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrder,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id", protect, adminOnly, updateOrder);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
