import { createContext, useContext, useEffect, useState } from "react";
import { mapImageList, withPublicUrl } from "../utils/assetPath";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${process.env.PUBLIC_URL}/data/products.json`);
        const data = await res.json();

        const normalized = Array.isArray(data)
          ? data.map((product) => ({
              ...product,
              images: mapImageList(product.images),
              image: withPublicUrl(product.image),
            }))
          : [];
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
