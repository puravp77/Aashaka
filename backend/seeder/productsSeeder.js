const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Product = require("../models/Product");

dotenv.config();

const productFilePath = path.join(__dirname, "../../src/data/allProducts.jsx");
const sourceImagesDir = path.join(__dirname, "../../public/images");
const uploadsDir = path.join(__dirname, "../uploads");
const placeholderImageName = "placeholder-product.jpg";
const isAbsoluteUrl = (value) => /^https?:\/\//i.test(String(value || ""));

const getImageFilename = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") return null;
  if (isAbsoluteUrl(imagePath.trim())) return imagePath.trim();
  return path.basename(imagePath.trim());
};

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const ensurePlaceholderImage = () => {
  ensureUploadsDir();

  const placeholderPath = path.join(uploadsDir, placeholderImageName);
  if (fs.existsSync(placeholderPath)) {
    return;
  }

  const fallbackSource = path.join(sourceImagesDir, "banner1.jpg");
  if (fs.existsSync(fallbackSource)) {
    fs.copyFileSync(fallbackSource, placeholderPath);
  }
};

const loadProductsFromAllProductsFile = () => {
  const rawSource = fs.readFileSync(productFilePath, "utf-8");
  const executableSource = rawSource.replace(
    /export\s+default\s+allProducts\s*;?/,
    "module.exports = allProducts;"
  );

  const sandbox = {
    module: { exports: [] },
    exports: {},
  };

  vm.createContext(sandbox);
  const script = new vm.Script(executableSource, { filename: "allProducts.jsx" });
  script.runInContext(sandbox);

  if (!Array.isArray(sandbox.module.exports)) {
    throw new Error("allProducts.jsx did not export an array");
  }

  return sandbox.module.exports;
};

const syncImageToUploads = (filename) => {
  if (!filename) {
    return false;
  }

  ensureUploadsDir();
  const uploadPath = path.join(uploadsDir, filename);
  if (fs.existsSync(uploadPath)) {
    return true;
  }

  const sourcePath = path.join(sourceImagesDir, filename);
  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  fs.copyFileSync(sourcePath, uploadPath);
  return true;
};

const transformProduct = (product, imageStats) => {
  const sizesObject =
    product?.sizes && typeof product.sizes === "object" && !Array.isArray(product.sizes)
      ? product.sizes
      : {};

  const sizeInventory = Object.entries(sizesObject)
    .filter(([size]) => Boolean(size))
    .map(([size, quantity]) => ({
      size,
      quantity: Number(quantity) || 0,
    }));

  const imageFilenames = Array.isArray(product?.images)
    ? product.images
        .map(getImageFilename)
        .filter(Boolean)
        .map((filename) => {
          if (isAbsoluteUrl(filename)) {
            imageStats.successful += 1;
            return filename;
          }

          const imageAvailable = syncImageToUploads(filename);

          if (imageAvailable) {
            imageStats.successful += 1;
            return filename;
          }

          imageStats.missing += 1;
          return placeholderImageName;
        })
    : [placeholderImageName];

  const colour = product?.details?.colour ? String(product.details.colour).trim() : "";
  const material = product?.details?.material ? String(product.details.material).trim() : "";

  return {
    productId: String(product?.id || "").trim(),
    name: product?.title || "Untitled Product",
    price: Number(product?.price || 0),
    oldPrice: Number(product?.oldPrice || 0) || null,
    category: String(product?.category || "").trim(),
    description: product?.description || material || colour || "Aashaka product",
    images: imageFilenames,
    sizes: sizeInventory,
    colors: colour ? [colour] : [],
    stock:
      typeof product?.stock === "number"
        ? product.stock
        : sizeInventory.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0),
    rating: Number(product?.rating || 0),
    isFeatured: false,
  };
};

const seedProducts = async () => {
  try {
    ensurePlaceholderImage();

    const imageStats = {
      successful: 0,
      missing: 0,
    };
    const sourceProducts = loadProductsFromAllProductsFile();
    const products = sourceProducts.map((product) => transformProduct(product, imageStats));

    await connectDB();

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log(`Total products inserted: ${products.length}`);
    console.log(`Successful images count: ${imageStats.successful}`);
    console.log(`Missing images count: ${imageStats.missing}`);
    console.log("Products seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error(`Product seeding failed: ${error.message}`);
    process.exit(1);
  } finally {
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // ignore close errors during process shutdown
    }
  }
};

seedProducts();
