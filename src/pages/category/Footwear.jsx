import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "../../context/ProductContext";
import { categoryMetadata } from "../../data/categoryMetadata";
import { withPublicUrl } from "../../utils/assetPath";
import ProductCard from "../../components/product/ProductCard";
import "../shop/CategoryPage.css";

const FOOTWEAR_CATEGORY = "Footwear";
const FOOTWEAR_METADATA_KEY = "footwear";
const FOOTWEAR_BANNERS = [
  "/images/fBanner.jpg",
  "/images/fBanner1.jpg",
  "/images/fBanner2.jpg",
  "/images/fBanner3.jpg",
];

const sortOptionMeta = {
  newest: {
    label: "Newest arrivals",
    hint: "Latest drops first",
  },
  "price-low": {
    label: "Price ascending",
    hint: "From budget to premium",
  },
  "price-high": {
    label: "Price descending",
    hint: "From premium to budget",
  },
};

function SortMenu({ value, onChange }) {
  return (
    <div className="sort-wrapper">
      <span className="sort-label">Sort By</span>
      <div className="sort-copy">
        <strong>{sortOptionMeta[value]?.label}</strong>
        <span>{sortOptionMeta[value]?.hint}</span>
      </div>
      <select
        className="sort-trigger"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Sort footwear products"
      >
        {Object.entries(sortOptionMeta).map(([optionValue, option]) => (
          <option key={optionValue} value={optionValue}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Footwear() {
  const navigate = useNavigate();
  const { loading, getProductsByCategory, fetchProductsByCategory } = useProducts();
  const [sortBy, setSortBy] = useState("newest");
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const metadata = categoryMetadata[FOOTWEAR_METADATA_KEY];

  useEffect(() => {
    let isMounted = true;

    const loadCategory = async () => {
      const products = await fetchProductsByCategory(FOOTWEAR_CATEGORY);
      if (isMounted) {
        setCategoryProducts(products);
      }
    };

    loadCategory();

    return () => {
      isMounted = false;
    };
  }, [fetchProductsByCategory]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % FOOTWEAR_BANNERS.length);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const localProducts = getProductsByCategory(FOOTWEAR_CATEGORY);
  const sourceProducts = categoryProducts.length > 0 ? categoryProducts : localProducts;

  const filteredProducts = useMemo(() => {
    const result = [...sourceProducts];

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [sortBy, sourceProducts]);

  if (loading && sourceProducts.length === 0) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="category-page">
      <div className="category-hero footwear-hero">
        <div className="hero-overlay" />
        <img
          key={FOOTWEAR_BANNERS[currentBanner]}
          src={withPublicUrl(FOOTWEAR_BANNERS[currentBanner])}
          alt="Footwear Banner"
          className="hero-img footwear-banner"
        />
        <div className="hero-content">
          <span className="hero-kicker">Aashaka Curated Edit</span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {metadata.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {metadata.description}
          </motion.p>
          <div className="footwear-banner-dots" aria-label="Footwear banner navigation">
            {FOOTWEAR_BANNERS.map((banner, index) => (
              <button
                key={banner}
                type="button"
                className={`footwear-banner-dot${currentBanner === index ? " active" : ""}`}
                onClick={() => setCurrentBanner(index)}
                aria-label={`Show footwear banner ${index + 1}`}
                aria-pressed={currentBanner === index}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="category-container">
        <div className="filter-bar">
          <span className="count">{filteredProducts.length} PRODUCTS FOUND</span>
          <SortMenu value={sortBy} onChange={setSortBy} />
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                showCategory
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
