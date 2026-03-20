import { createContext, useContext, useEffect, useState } from "react";
import allProducts from "../data/allProducts";

const ProductContext = createContext();
const BASE_URL = "http://localhost:5000";
const PLACEHOLDER_IMAGE = `${BASE_URL}/uploads/placeholder-product.jpg`;
const buildSizeMap = (sizes) => {
  if (!Array.isArray(sizes) || sizes.length === 0) {
    return {};
  }

  return sizes.reduce((acc, sizeEntry) => {
    if (!sizeEntry || !sizeEntry.size) return acc;
    acc[String(sizeEntry.size)] = Number(sizeEntry.quantity || 0);
    return acc;
  }, {});
};

const getProductSortParts = (productId = "") => {
  const match = String(productId).match(/^([a-zA-Z]+)(\d+)/);
  if (!match) {
    return {
      prefix: "ZZ",
      number: Number.MAX_SAFE_INTEGER,
    };
  }

  return {
    prefix: match[1],
    number: Number.parseInt(match[2], 10),
  };
};

const sortProducts = (products) => {
  const prefixPriority = {
    k: 1,
    WS: 2,
    o: 3,
    b: 4,
    n: 5,
    e: 6,
  };

  return [...products].sort((a, b) => {
    const aParts = getProductSortParts(a.productId);
    const bParts = getProductSortParts(b.productId);
    const aPriority = prefixPriority[aParts.prefix] ?? 999;
    const bPriority = prefixPriority[bParts.prefix] ?? 999;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    if (aParts.prefix !== bParts.prefix) {
      return aParts.prefix.localeCompare(bParts.prefix);
    }

    return aParts.number - bParts.number;
  });
};

const normalizeProduct = (product) => {
  const id = String(product?.productId || product?._id || product?.id || "");
  const normalizedImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
        .filter(Boolean)
        .map((imageName) => `${BASE_URL}/uploads/${imageName}`)
    : [PLACEHOLDER_IMAGE];
  const normalizedSizeInventory = Array.isArray(product?.sizes)
    ? product.sizes
        .map((entry) => ({
          size: String(entry?.size || ""),
          quantity: Number(entry?.quantity || 0),
        }))
        .filter((entry) => entry.size)
    : [];
  const normalizedSizes = buildSizeMap(normalizedSizeInventory);
  const normalizedColors = Array.isArray(product?.colors)
    ? product.colors.filter(Boolean)
    : [];

  return {
    ...product,
    id,
    _id: product?._id || id,
    productId: product?.productId || id,
    title: product?.name || "Untitled Product",
    name: product?.name || "Untitled Product",
    category: String(product?.category || "").toLowerCase(),
    description: product?.description || "",
    images: normalizedImages,
    image: normalizedImages[0] || "",
    sizes: normalizedSizes,
    sizeInventory: normalizedSizeInventory,
    colors: normalizedColors,
    oldPrice: product?.oldPrice || null,
    details: {
      description: product?.description || "",
      colour: normalizedColors.join(", "),
      material: "",
      size: Object.keys(normalizedSizes).join(", "),
    },
    variants: normalizedColors.map((color) => ({
      color,
      images: normalizedImages,
      sizes: normalizedSizes,
      sizeInventory: normalizedSizeInventory,
      sourceId: id,
      price: product?.price,
      oldPrice: product?.oldPrice || null,
    })),
  };
};

const normalizeFallbackProduct = (product) => {
  const id = String(product?.id || product?.productId || product?._id || "");
  const normalizedImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images.filter(Boolean)
    : ["images/placeholder-product.jpg"];
  const normalizedSizeInventory = Array.isArray(product?.sizeInventory)
    ? product.sizeInventory
        .map((entry) => ({
          size: String(entry?.size || ""),
          quantity: Number(entry?.quantity || 0),
        }))
        .filter((entry) => entry.size)
    : Object.entries(product?.sizes || {}).map(([size, quantity]) => ({
        size: String(size),
        quantity: Number(quantity || 0),
      }));
  const normalizedSizes = buildSizeMap(normalizedSizeInventory);
  const normalizedColors = Array.isArray(product?.colors)
    ? product.colors.filter(Boolean)
    : [];

  return {
    ...product,
    id,
    _id: product?._id || id,
    productId: product?.productId || id,
    title: product?.title || product?.name || "Untitled Product",
    name: product?.name || product?.title || "Untitled Product",
    category: String(product?.category || "").toLowerCase(),
    description: product?.description || "",
    images: normalizedImages,
    image: normalizedImages[0] || "",
    sizes: normalizedSizes,
    sizeInventory: normalizedSizeInventory,
    colors: normalizedColors,
    oldPrice: product?.oldPrice || null,
    details: {
      description: product?.details?.description || product?.description || "",
      colour: product?.details?.colour || normalizedColors.join(", "),
      material: product?.details?.material || "",
      size: product?.details?.size || Object.keys(normalizedSizes).join(", "),
    },
    variants: Array.isArray(product?.variants)
      ? product.variants
      : normalizedColors.map((color) => ({
          color,
          images: normalizedImages,
          sizes: normalizedSizes,
          sizeInventory: normalizedSizeInventory,
          sourceId: id,
          price: product?.price,
          oldPrice: product?.oldPrice || null,
        })),
  };
};

const buildAliases = (items) =>
  items.reduce((acc, product) => {
    const canonicalId = String(product.id);
    const candidates = [
      product.id,
      product.productId,
      product._id,
      product.name,
      product.title,
    ]
      .filter(Boolean)
      .map((value) => String(value));

    candidates.forEach((candidate) => {
      acc[candidate] = canonicalId;
      acc[candidate.toLowerCase()] = canonicalId;
    });

    return acc;
  }, {});

const loadFallbackProducts = () => {
  const normalizedProducts = Array.isArray(allProducts)
    ? allProducts.map(normalizeFallbackProduct)
    : [];
  const sortedProducts = sortProducts(normalizedProducts);
  const aliases = buildAliases(sortedProducts);

  return {
    normalizedProducts: sortedProducts,
    aliases,
  };
};

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [productAliases, setProductAliases] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/products`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        const normalizedProducts = Array.isArray(data)
          ? data.map(normalizeProduct)
          : [];
        const hasRemoteProducts = normalizedProducts.length > 0;
        const sortedProducts = hasRemoteProducts
          ? sortProducts(normalizedProducts)
          : loadFallbackProducts().normalizedProducts;
        const aliases = hasRemoteProducts
          ? buildAliases(sortedProducts)
          : loadFallbackProducts().aliases;

        setProducts(sortedProducts);
        setGroupedProducts(sortedProducts);
        setProductAliases(aliases);
      } catch (error) {
        console.error("Failed to load products:", error);
        const fallback = loadFallbackProducts();
        setProducts(fallback.normalizedProducts);
        setGroupedProducts(fallback.normalizedProducts);
        setProductAliases(fallback.aliases);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, groupedProducts, productAliases, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
