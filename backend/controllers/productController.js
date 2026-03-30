const mongoose = require("mongoose");
const Product = require("../models/Product");

const buildProductIdentifierFilter = (identifier) => {
  const filter = [{ productId: identifier }];

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    filter.unshift({ _id: identifier });
  }

  return { $or: filter };
};

const findProductByIdentifier = (identifier) =>
  Product.findOne(buildProductIdentifierFilter(identifier));

const normalizeSizes = (sizes) => {
  if (!Array.isArray(sizes)) {
    return [];
  }

  return sizes
    .map((entry) => {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        return {
          size: String(entry.size || "").trim(),
          quantity: Number(entry.quantity || 0),
        };
      }

      return {
        size: String(entry || "").trim(),
        quantity: 0,
      };
    })
    .filter((entry) => entry.size);
};

const getProducts = async (req, res, next) => {
  try {
    const { category, search, isFeatured } = req.query;
    const filter = {};

    if (category) {
      filter.category = { $regex: `^${String(category).trim()}$`, $options: "i" };
    }

    if (typeof isFeatured !== "undefined") {
      filter.isFeatured = isFeatured === "true";
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await findProductByIdentifier(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      productId,
      id,
      name,
      price,
      oldPrice,
      category,
      description,
      images,
      sizes,
      colors,
      stock,
      rating,
      isFeatured,
    } = req.body;

    const product = await Product.create({
      productId: productId || id,
      name,
      price,
      oldPrice,
      category,
      description,
      images: Array.isArray(images) ? images : [],
      sizes: normalizeSizes(sizes),
      colors: Array.isArray(colors) ? colors : [],
      stock: Number(stock || 0),
      rating: Number(rating || 0),
      isFeatured: Boolean(isFeatured),
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const {
      productId,
      name,
      price,
      oldPrice,
      category,
      description,
      images,
      sizes,
      colors,
      stock,
      rating,
      isFeatured,
    } = req.body;

    const updateData = {
      productId,
      name,
      price,
      oldPrice,
      category,
      description,
      stock: Number(stock || 0),
      rating: Number(rating || 0),
      isFeatured,
    };

    if (Array.isArray(images)) updateData.images = images;
    if (Array.isArray(sizes)) updateData.sizes = normalizeSizes(sizes);
    if (Array.isArray(colors)) updateData.colors = colors;

    const product = await Product.findOneAndUpdate(
      buildProductIdentifierFilter(req.params.id),
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete(
      buildProductIdentifierFilter(req.params.id)
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
