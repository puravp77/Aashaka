import { createContext, useContext, useEffect, useState } from "react";
import { mapImageList, withPublicUrl } from "../utils/assetPath";
import { fetchCollection } from "../utils/api";

const ProductContext = createContext();
const COLOR_PREFIXES = [
  "Peach Pink",
  "Navy Blue",
  "Baby Pink",
  "Parrot Green",
  "Dark Green",
  "Olive Green",
  "Clay Blue",
  "Rosewood Red",
  "Baby Blue",
  "Purple",
  "Olive",
  "White",
  "Black",
  "Green",
  "Yellow",
  "Pink",
  "Blue",
  "Red",
];

const stripColorPrefix = (title = "") => {
  const match = COLOR_PREFIXES
    .sort((a, b) => b.length - a.length)
    .find((color) => title.toLowerCase().startsWith(`${color.toLowerCase()} `));

  if (!match) return title.trim();
  return title.slice(match.length).trim();
};

const normalizeKurtiTitle = (title = "") => {
  const withoutColor = stripColorPrefix(title);

  return withoutColor
    .replace(/\bkurti\b/gi, "")
    .replace(/\s+set\b/gi, " Set")
    .replace(/\s+/g, " ")
    .trim();
};

const createGroupedProducts = (products) => {
  const aliasMap = {};
  const nonKurtiProducts = [];
  const kurtiGroups = new Map();

  products.forEach((product) => {
    if ((product.category || "").toLowerCase() !== "kurti") {
      nonKurtiProducts.push(product);
      aliasMap[String(product.id)] = String(product.id);
      return;
    }

    const baseTitle = normalizeKurtiTitle(product.title || "");
    const color = product.details?.colour || "Default";
    const groupKey = baseTitle || product.title || String(product.id);
    const group = kurtiGroups.get(groupKey) || [];

    group.push({
      ...product,
      variantColor: color,
    });
    kurtiGroups.set(groupKey, group);
  });

  const groupedKurtiProducts = Array.from(kurtiGroups.entries()).map(([baseTitle, group]) => {
    const variantsByColor = new Map();
    group.forEach((item) => {
      const colorKey = (item.variantColor || "Default").toLowerCase();
      const current = variantsByColor.get(colorKey);

      if (!current) {
        variantsByColor.set(colorKey, item);
        return;
      }

      aliasMap[String(item.id)] = String(current.id);
    });

    const uniqueVariants = Array.from(variantsByColor.values());

    if (uniqueVariants.length === 1) {
      const [single] = uniqueVariants;
      aliasMap[String(single.id)] = String(single.id);
      return {
        ...single,
        title: baseTitle || single.title,
        variants: Array.isArray(single.variants) ? single.variants : [],
      };
    }

    const primary = uniqueVariants[0];
    const variants = uniqueVariants.map((item) => {
      aliasMap[String(item.id)] = String(primary.id);
      return {
        color: item.variantColor,
        images: item.images || [],
        sizes: item.sizes || {},
        sourceId: item.id,
      };
    });

    return {
      ...primary,
      title: baseTitle || primary.title,
      details: {
        ...primary.details,
        colour: variants.map((variant) => variant.color).join(", "),
      },
      variants,
      sizes: variants[0]?.sizes || primary.sizes || {},
      images: variants[0]?.images || primary.images || [],
    };
  });

  return {
    products: [...groupedKurtiProducts, ...nonKurtiProducts],
    aliases: aliasMap,
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
        const data = await fetchCollection("products");
        const normalized = data.map((product) => ({
          ...product,
          images: mapImageList(product.images),
          image: withPublicUrl(product.image),
        }));
        const grouped = createGroupedProducts(normalized);
        setProducts(normalized);
        setGroupedProducts(grouped.products);
        setProductAliases(grouped.aliases);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
        setGroupedProducts([]);
        setProductAliases({});
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
