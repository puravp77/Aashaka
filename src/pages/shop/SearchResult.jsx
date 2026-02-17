import React, { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import allProducts from "../../data/allProducts";
import "./SearchResult.css";
import { withPublicUrl } from "../../utils/assetPath";

export default function SearchResult() {
  const location = useLocation();
  const [results, setResults] = useState([]);

  // 🔍 Get query from URL (?q=necklace)
  const params = new URLSearchParams(location.search);
  const query = params.get("q")?.toLowerCase().trim();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const filtered = allProducts.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";
      const colour = product.details?.colour?.toLowerCase() || "";

      return (
        title.includes(query) ||
        category.includes(query) ||
        colour.includes(query)
      );
    });

    setResults(filtered);
  }, [query]);

  return (
    <section className="search-page">
      <h2 className="search-title">
        Search Results {query && `for "${query}"`}
      </h2>

      {results.length === 0 ? (
        <p className="no-results">No products found.</p>
      ) : (
        <div className="search-grid">
          {results.map((product) => (
            <div className="search-card" key={product.id}>
              <NavLink to={`/product/${product.id}`}>
                <div className="image-box">
                  <img
                    src={withPublicUrl(product.images?.[0])}
                    alt={product.title}
                  />
                </div>
              </NavLink>

              <h4 className="product-title">{product.title}</h4>
              <p className="price">₹{product.price}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

