import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import { categoryMetadata } from "../../data/categoryMetadata";
import { withPublicUrl } from "../../utils/assetPath";
import { motion } from "framer-motion";
import ProductCard from "../../components/product/ProductCard";
import "./CategoryPage.css";

const categoryGroupMap = {
  Cloths: ["kurti"],
  Jewellery: ["oxidised", "bangles", "earrings", "necklace", "choker"],
  Footwear: ["footwear"],
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

const matchesCategoryGroup = (product, selectedGroups) => {
  if (selectedGroups.length === 0) return true;

  const productCategory = String(product?.category || "").toLowerCase();
  return selectedGroups.some((group) =>
    (categoryGroupMap[group] || []).includes(productCategory)
  );
};

const matchesPriceRange = (product, selectedRange) => {
  if (!selectedRange) return true;
  const range = priceRanges.find((item) => item.id === selectedRange);
  if (!range) return true;
  const price = Number(product?.price || 0);
  return price >= range.min && price <= range.max;
};

const matchesSizes = (product, selectedSizes) => {
  if (selectedSizes.length === 0) return true;
  const productSizes = getProductSizes(product);
  return selectedSizes.some((size) => productSizes.includes(size));
};

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
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const activeSortMeta = sortOptionMeta[value] || sortOptionMeta.newest;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="sort-wrapper sort-container" ref={rootRef}>
      <div className="sort-copy sort-content">
        <span className="sort-label sort-title">Sort By</span>
        <div className="sort-copy-text">
          <strong>{activeSortMeta.label}</strong>
          <span className="sort-subtitle">{activeSortMeta.hint}</span>
        </div>
      </div>
      <div className={`sort-select-shell sort-dropdown ${isOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="sort-trigger"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{activeSortMeta.label}</span>
          <span className="sort-caret" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="sort-menu" role="listbox" aria-label="Sort products">
            {Object.entries(sortOptionMeta).map(([optionValue, option]) => (
              <button
                key={optionValue}
                type="button"
                className={`sort-option ${value === optionValue ? "active" : ""}`}
                onClick={() => {
                  onChange(optionValue);
                  setIsOpen(false);
                }}
              >
                <strong>{option.label}</strong>
                <span>{option.hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CategoryPage = () => {
  const { categoryName: paramCategory } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const [sortBy, setSortBy] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [appliedCategories, setAppliedCategories] = useState([]);
  const [appliedPriceRange, setAppliedPriceRange] = useState("");
  const [appliedSizes, setAppliedSizes] = useState([]);

  const categoryName = paramCategory || (location.pathname === "/kurti" ? "kurti" : "all");

  const metadata = categoryMetadata[categoryName] || {
    title: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
    description: "Explore our beautiful collection.",
    bannerImage: "images/bannernewasaga2.jpeg",
  };

  const availableSizes = useMemo(() => {
    const sourceProducts =
      categoryName === "all"
        ? products
        : products.filter(
            (product) => (product.category || "").toLowerCase() === categoryName.toLowerCase()
          );

    return Array.from(new Set(sourceProducts.flatMap(getProductSizes))).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [products, categoryName]);

  const filteredProducts = useMemo(() => {
    const result =
      categoryName === "all"
        ? [...products]
        : products.filter(
            (product) => (product.category || "").toLowerCase() === categoryName.toLowerCase()
          );

    const filtered = result.filter(
      (product) =>
        matchesCategoryGroup(product, appliedCategories) &&
        matchesPriceRange(product, appliedPriceRange) &&
        matchesSizes(product, appliedSizes)
    );

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, categoryName, sortBy, appliedCategories, appliedPriceRange, appliedSizes]);

  const bannerImage = useMemo(() => {
    if (metadata.bannerImage) {
      return metadata.bannerImage;
    }

    const categoryProducts =
      categoryName === "all"
        ? products
        : products.filter(
            (product) => (product.category || "").toLowerCase() === categoryName.toLowerCase()
          );

    const firstProductImage = categoryProducts.find(
      (product) => Array.isArray(product.images) && product.images[0]
    )?.images?.[0];

    return firstProductImage || "images/bannernewasaga2.jpeg";
  }, [products, categoryName, metadata.bannerImage]);

  const heroImageClassName = `hero-img ${categoryName === "all" ? "hero-img-all" : ""}`;
  const heroClassName = `category-hero ${categoryName === "all" ? "category-hero-all" : ""}`;

  const toggleCategory = (value) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleSize = (value) => {
    setSelectedSizes((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const applyFilters = () => {
    setAppliedCategories(selectedCategories);
    setAppliedPriceRange(selectedPriceRange);
    setAppliedSizes(selectedSizes);
    setFilterOpen(false);
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div className="category-page">
      <div className={heroClassName}>
        <div className="hero-overlay" />
        <img
          src={withPublicUrl(bannerImage)}
          alt={metadata.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = withPublicUrl("images/bannernewasaga2.jpeg");
          }}
          className={heroImageClassName}
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
        </div>
      </div>

      <div className="category-container">
        <div className="shop-top-bar">
          <p className="product-count">{filteredProducts.length} Products Found</p>
          <div className="shop-actions">
            <button type="button" className="filter-btn" onClick={() => setFilterOpen(true)}>
              Filter
            </button>
            <SortMenu value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {filterOpen && (
          <div className="filter-overlay" onClick={() => setFilterOpen(false)}>
            <div className="filter-drawer" onClick={(event) => event.stopPropagation()}>
              <div className="filter-drawer-header">
                <h3>Filters</h3>
                <button type="button" className="filter-close" onClick={() => setFilterOpen(false)}>
                  &times;
                </button>
              </div>

              <div className="filter-section">
                <h4>Category</h4>
                {Object.keys(categoryGroupMap).map((category) => (
                  <label key={category}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>

              <div className="filter-section">
                <h4>Price</h4>
                {priceRanges.map((range) => (
                  <label key={range.id}>
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceRange === range.id}
                      onChange={() => setSelectedPriceRange(range.id)}
                    />
                    {range.label}
                  </label>
                ))}
              </div>

              <div className="filter-section">
                <h4>Size</h4>
                {availableSizes.length > 0 ? (
                  availableSizes.map((size) => (
                    <label key={size}>
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                      />
                      {size}
                    </label>
                  ))
                ) : (
                  <p className="filter-empty">No size filters available.</p>
                )}
              </div>

              <button type="button" className="apply-btn" onClick={applyFilters}>
                Apply Filters
              </button>
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
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
