import { createContext, useContext, useEffect, useState } from "react";
import { mapImageList, withPublicUrl } from "../utils/assetPath";
import { fetchCollection } from "../utils/api";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
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
