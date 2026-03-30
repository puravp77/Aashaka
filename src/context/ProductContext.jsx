import { createContext, useCallback, useContext, useEffect, useState } from "react";
import allProducts from "../data/allProducts";
import { fetchCollection, isStaticDataMode } from "../utils/api";

const ProductContext = createContext();
const BASE_URL = "http://localhost:5000";
const PLACEHOLDER_IMAGE = `${BASE_URL}/uploads/placeholder-product.jpg`;
const isAbsoluteUrl = (value) => /^([a-z][a-z0-9+.-]*:)?\/\//i.test(String(value || ""));
const normalizeCategory = (value) => String(value || "").trim().toLowerCase();

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
    f: 3,
    o: 4,
    b: 5,
    n: 6,
    e: 7,
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
  const normalizedImages =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
          .filter(Boolean)
          .map((imageName) =>
            isAbsoluteUrl(imageName) ? imageName : `${BASE_URL}/uploads/${imageName}`
          )
      : [PLACEHOLDER_IMAGE];
  const normalizedSizeInventory = Array.isArray(product?.sizes)
    ? product.sizes
        .map((entry) => ({
          size: String(entry?.size || "").trim(),
          quantity: Number(entry?.quantity || 0),
        }))
        .filter((entry) => entry.size)
    : [];
  const normalizedSizes = buildSizeMap(normalizedSizeInventory);
  const normalizedColors = Array.isArray(product?.colors) ? product.colors.filter(Boolean) : [];

  return {
    ...product,
    id,
    _id: product?._id || id,
    productId: product?.productId || id,
    title: product?.title || product?.name || "Untitled Product",
    name: product?.name || product?.title || "Untitled Product",
    category: String(product?.category || "").trim(),
    description: product?.description || "",
    images: normalizedImages,
    image: normalizedImages[0] || "",
    sizes: normalizedSizes,
    sizeInventory: normalizedSizeInventory,
    colors: normalizedColors,
    oldPrice: product?.oldPrice || null,
    stock:
      typeof product?.stock === "number"
        ? product.stock
        : normalizedSizeInventory.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0),
    rating: Number(product?.rating || 0),
    details: {
      description: product?.description || "",
      colour: product?.colour || normalizedColors.join(", "),
      material: product?.material || "",
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
  const normalizedImages =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : ["images/banner1.jpg"];
  const normalizedSizeInventory = Array.isArray(product?.sizeInventory)
    ? product.sizeInventory
        .map((entry) => ({
          size: String(entry?.size || "").trim(),
          quantity: Number(entry?.quantity || 0),
        }))
        .filter((entry) => entry.size)
    : Object.entries(product?.sizes || {}).map(([size, quantity]) => ({
        size: String(size),
        quantity: Number(quantity || 0),
      }));
  const normalizedSizes = buildSizeMap(normalizedSizeInventory);
  const normalizedColors = Array.isArray(product?.colors) ? product.colors.filter(Boolean) : [];

  return {
    ...product,
    id,
    _id: product?._id || id,
    productId: product?.productId || id,
    title: product?.title || product?.name || "Untitled Product",
    name: product?.name || product?.title || "Untitled Product",
    category: String(product?.category || "").trim(),
    description: product?.description || "",
    images: normalizedImages,
    image: normalizedImages[0] || "",
    sizes: normalizedSizes,
    sizeInventory: normalizedSizeInventory,
    colors: normalizedColors,
    oldPrice: product?.oldPrice || null,
    stock:
      typeof product?.stock === "number"
        ? product.stock
        : normalizedSizeInventory.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0),
    rating: Number(product?.rating || 0),
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
    const candidates = [product.id, product.productId, product._id, product.name, product.title]
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

const filterByCategory = (items, category) => {
  if (!category) return items;

  return items.filter(
    (product) => normalizeCategory(product.category) === normalizeCategory(category)
  );
};

const mergeProducts = (primaryProducts, fallbackProducts) => {
  const merged = new Map();

  fallbackProducts.forEach((product) => {
    merged.set(String(product.id), product);
  });

  primaryProducts.forEach((product) => {
    merged.set(String(product.id), product);
  });

  return sortProducts(Array.from(merged.values()));
};

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [productAliases, setProductAliases] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (category) => {
    const fallback = loadFallbackProducts();
    const fallbackProducts = filterByCategory(fallback.normalizedProducts, category);

    if (isStaticDataMode()) {
      return fallbackProducts;
    }

    try {
      const query = category ? { category } : undefined;
      const data = await fetchCollection("api/products", { query, cache: "no-store" });
      const normalizedProducts = Array.isArray(data) ? data.map(normalizeProduct) : [];

      if (normalizedProducts.length > 0) {
        return mergeProducts(normalizedProducts, fallbackProducts);
      }

      if (!category) {
        return fallback.normalizedProducts;
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    }

    return fallbackProducts;
  }, []);

  const getProductsByCategory = useCallback(
    (category) => filterByCategory(products, category),
    [products]
  );

  const fetchProductsByCategory = useCallback(
    async (category) => fetchProducts(category),
    [fetchProducts]
  );

  useEffect(() => {
    const loadInitialProducts = async () => {
      try {
        const loadedProducts = await fetchProducts();
        const aliases = buildAliases(loadedProducts);
        setProducts(loadedProducts);
        setGroupedProducts(loadedProducts);
        setProductAliases(aliases);
      } finally {
        setLoading(false);
      }
    };

    loadInitialProducts();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider
      value={{
        products,
        groupedProducts,
        productAliases,
        loading,
        fetchProducts,
        fetchProductsByCategory,
        getProductsByCategory,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
