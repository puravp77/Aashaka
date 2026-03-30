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

const priceRanges = [
  { id: "under-1000", label: "Under \u20B91000", min: 0, max: 999 },
  { id: "1000-2000", label: "\u20B91000 - \u20B92000", min: 1000, max: 2000 },
  { id: "above-2000", label: "Above \u20B92000", min: 2001, max: Number.POSITIVE_INFINITY },
];

const getProductSizes = (product) =>
  Object.keys(product?.sizes || {})
    .map((size) => String(size).trim())
    .filter(Boolean);

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [appliedPriceRange, setAppliedPriceRange] = useState("");
  const [appliedSizes, setAppliedSizes] = useState([]);
  const filterCount = selectedSizes.length + (selectedPriceRange ? 1 : 0);
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
  const availableSizes = useMemo(
    () =>
      Array.from(new Set(sourceProducts.flatMap(getProductSizes))).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
    [sourceProducts]
  );

  const filteredProducts = useMemo(() => {
    const result = [...sourceProducts].filter((product) => {
      const price = Number(product?.price || 0);
      const range = priceRanges.find((item) => item.id === appliedPriceRange);
      const matchesPrice = !range || (price >= range.min && price <= range.max);
      const productSizes = getProductSizes(product);
      const matchesSize =
        appliedSizes.length === 0 || appliedSizes.some((size) => productSizes.includes(size));

      return matchesPrice && matchesSize;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [sortBy, sourceProducts, appliedPriceRange, appliedSizes]);

  const toggleSize = (value) => {
    setSelectedSizes((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const applyFilters = () => {
    setAppliedPriceRange(selectedPriceRange);
    setAppliedSizes(selectedSizes);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setSelectedPriceRange("");
    setSelectedSizes([]);
    setAppliedPriceRange("");
    setAppliedSizes([]);
  };

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
        <div className="shop-top-bar">
          <p className="product-count">{filteredProducts.length} Products Found</p>
          <div className="shop-actions">
            <button type="button" className="filter-btn" onClick={() => setFilterOpen(true)}>
              Filter {filterCount > 0 ? `(${filterCount})` : ""}
            </button>
            <SortMenu value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {filterOpen && (
          <div className="filter-overlay" onClick={() => setFilterOpen(false)}>
            <div className="filter-drawer" onClick={(event) => event.stopPropagation()}>
              <div className="filter-drawer-header">
                <h3>Filters</h3>
                <button type="button" className="clear-btn" onClick={clearFilters}>
                  Clear All
                </button>
              </div>

              <div className="filter-body">
                <div className="filter-section">
                  <h4>Category (1)</h4>
                  <label className="active">
                    <input type="checkbox" checked readOnly />
                    Footwear
                  </label>
                </div>

                <div className="filter-section">
                  <h4>Price{selectedPriceRange ? " (1)" : ""}</h4>
                  {priceRanges.map((range) => (
                    <label
                      key={range.id}
                      className={selectedPriceRange === range.id ? "active" : ""}
                    >
                      <input
                        type="radio"
                        name="footwear-price"
                        checked={selectedPriceRange === range.id}
                        onChange={() => setSelectedPriceRange(range.id)}
                      />
                      {range.label}
                    </label>
                  ))}
                </div>

                <div className="filter-section">
                  <h4>Size{selectedSizes.length > 0 ? ` (${selectedSizes.length})` : ""}</h4>
                  {availableSizes.map((size) => (
                    <label key={size} className={selectedSizes.includes(size) ? "active" : ""}>
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-footer">
                <button type="button" className="apply-btn" onClick={applyFilters}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

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
