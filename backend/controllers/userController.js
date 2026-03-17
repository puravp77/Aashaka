const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Order = require("../models/Order");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getUsersWithOrderCounts = async (req, res, next) => {
  try {
    const [users, orderCounts] = await Promise.all([
      User.find({ role: { $ne: "admin" } })
        .select("name email role createdAt updatedAt")
        .sort({ createdAt: -1 }),
      Order.aggregate([
        {
          $group: {
            _id: "$user",
            ordersCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const orderCountMap = orderCounts.reduce((acc, item) => {
      acc[String(item._id)] = Number(item.ordersCount || 0);
      return acc;
    }, {});

    return res.status(200).json(
      users.map((user) => ({
        ...sanitizeUser(user),
        ordersCount: orderCountMap[String(user._id)] || 0,
      }))
    );
  } catch (error) {
    next(error);
  }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email role createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(admins.map(sanitizeUser));
  } catch (error) {
    next(error);
  }
};

const createAdminUser = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const adminName = String(name || username || "").trim();
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!adminName || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await User.create({
      name: adminName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      addresses: [],
    });

    return res.status(201).json({
      message: "Admin user created successfully",
      user: sanitizeUser(adminUser),
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdminUser = async (req, res, next) => {
  try {
    const adminUser = await User.findOneAndDelete({
      _id: req.params.id,
      role: "admin",
    });

    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    return res.status(200).json({ message: "Admin user removed successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsersWithOrderCounts,
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
};
