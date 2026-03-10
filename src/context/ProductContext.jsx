import { createContext, useContext, useEffect, useState } from "react";
import { mapImageList, withPublicUrl } from "../utils/assetPath";
import { fetchCollection } from "../utils/api";

const ProductContext = createContext();
const KURTI_VARIANT_FAMILIES = [
  { title: "Aadhya Kurti Set", ids: ["k1", "k2"] },
  { title: "Amara Kurti Set", ids: ["k3", "k4", "k14"] },
  { title: "Printed Kurti Set", ids: ["k5", "k6"] },
  { title: "Phool Mahal", ids: ["k11", "k12"] },
  { title: "Kusum Kurti Set", ids: ["k9", "k20"] },
  { title: "Phool Kusum Kurti Set", ids: ["k18", "k19"] },
];
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

const extractTitleColor = (title = "") =>
  COLOR_PREFIXES
    .sort((a, b) => b.length - a.length)
    .find((color) => title.toLowerCase().startsWith(`${color.toLowerCase()} `)) || "";

const KURTI_FAMILY_LOOKUP = new Map(
  KURTI_VARIANT_FAMILIES.flatMap((family) =>
    family.ids.map((id) => [String(id), family])
  )
);

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

    const family = KURTI_FAMILY_LOOKUP.get(String(product.id));
    const groupKey = family?.title || String(product.id);
    const color = extractTitleColor(product.title || "") || product.details?.colour || "Default";
    const group = kurtiGroups.get(groupKey) || [];

    group.push({
      ...product,
      variantColor: color,
      familyTitle: family?.title || product.title,
    });
    kurtiGroups.set(groupKey, group);
  });

  const groupedKurtiProducts = Array.from(kurtiGroups.entries()).map(([, group]) => {
    const familyTitle = group[0]?.familyTitle || group[0]?.title || "";
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
      const fallbackVariant = {
        color: single.variantColor || single.details?.colour || "Default",
        images: single.images || [],
        sizes: single.sizes || {},
        sourceId: single.id,
        price: single.price,
        oldPrice: single.oldPrice,
      };

      return {
        ...single,
        title: single.title,
        variants:
          Array.isArray(single.variants) && single.variants.length > 0
            ? single.variants
            : [fallbackVariant],
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
        price: item.price,
        oldPrice: item.oldPrice,
      };
    });

    return {
      ...primary,
      title: familyTitle || primary.title,
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
