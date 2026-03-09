import { createContext, useContext, useEffect, useState } from "react";
import { mapImageList, withPublicUrl } from "../utils/assetPath";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const url = process.env.NODE_ENV === "development"
          ? "http://localhost:5000/products"
          : `${process.env.PUBLIC_URL}/data/products.json`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Load failed");

        const data = await res.json();
        // Handle both flat array and keyed object formats
        const rawData = Array.isArray(data) ? data : (data.products || []);

        const normalized = rawData.map((product) => ({
          ...product,
          images: mapImageList(product.images),
          image: withPublicUrl(product.image),
        }));
        setProducts(normalized);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
