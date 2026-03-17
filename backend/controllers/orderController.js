const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod = "COD",
    } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const normalizedOrderItems = [];
    let totalPrice = 0;

    for (const item of orderItems) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: `Invalid product id: ${item.product}` });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      const quantity = Number(item.quantity || 1);
      if (quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }

      const inventory = Array.isArray(product.sizes) ? product.sizes : [];
      const requestedSize = item.size ? String(item.size) : null;

      if (requestedSize) {
        const sizeEntry = inventory.find(
          (entry) => String(entry?.size) === requestedSize
        );

        if (!sizeEntry || Number(sizeEntry.quantity || 0) < quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }

        sizeEntry.quantity -= quantity;
      } else if (inventory.length > 0) {
        const totalAvailable = inventory.reduce(
          (sum, entry) => sum + (Number(entry?.quantity) || 0),
          0
        );

        if (totalAvailable < quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }

        let remaining = quantity;
        product.sizes = inventory.map((entry) => {
          const currentQty = Number(entry?.quantity) || 0;
          if (remaining === 0 || currentQty === 0) {
            return entry;
          }

          const deducted = Math.min(currentQty, remaining);
          remaining -= deducted;
          return {
            ...entry.toObject?.(),
            size: entry.size,
            quantity: currentQty - deducted,
          };
        });
      }

      await product.save();

      totalPrice += product.price * quantity;
      normalizedOrderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        size: requestedSize,
        quantity,
        image: Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : null,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems: normalizedOrderItems,
      totalPrice,
      shippingAddress,
      paymentMethod,
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "name price category images")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email role")
      .populate("orderItems.product", "name price category images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner = String(order.user?._id || order.user) === String(req.user._id);
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email role")
      .populate("orderItems.product", "name price category images")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { isPaid, isDelivered, orderStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (typeof isPaid === "boolean") {
      order.isPaid = isPaid;
    }

    if (typeof isDelivered === "boolean") {
      order.isDelivered = isDelivered;
      if (isDelivered) {
        order.orderStatus = "delivered";
      }
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (String(orderStatus).toLowerCase() === "delivered") {
        order.isDelivered = true;
      }
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email role")
      .populate("orderItems.product", "name price category images");

    return res.status(200).json({
      message: "Order updated successfully",
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus || order.orderStatus;
    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrder,
  updateOrderStatus,
};
