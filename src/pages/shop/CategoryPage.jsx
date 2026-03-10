import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import { categoryMetadata } from "../../data/categoryMetadata";
import { withPublicUrl } from "../../utils/assetPath";
import { motion } from "framer-motion";
import "./CategoryPage.css";

const sortOptionMeta = {
    newest: {
        label: "Newest arrivals",
        hint: "Latest drops first"
    },
    "price-low": {
        label: "Price ascending",
        hint: "From budget to premium"
    },
    "price-high": {
        label: "Price descending",
        hint: "From premium to budget"
    }
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
        <div className="sort-wrapper" ref={rootRef}>
            <span className="sort-label">Sort By</span>
            <div className="sort-copy">
                <strong>{activeSortMeta.label}</strong>
                <span>{activeSortMeta.hint}</span>
            </div>
            <div className={`sort-select-shell ${isOpen ? "is-open" : ""}`}>
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

    // Determine category from param or pathname
    const categoryName = paramCategory || (location.pathname === '/kurti' ? 'kurti' : 'all');

    const metadata = categoryMetadata[categoryName] || {
        title: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
        description: "Explore our beautiful collection.",
        bannerImage: "images/banners/default-banner.jpg"
    };

    const filteredProducts = useMemo(() => {
        let result = categoryName === 'all'
            ? [...products]
            : products.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());

        if (sortBy === "price-low") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [products, categoryName, sortBy]);

    const bannerImage = useMemo(() => {
        if (metadata.bannerImage) {
            return metadata.bannerImage;
        }

        const categoryProducts = categoryName === "all"
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

    if (loading) return <div className="loading-container">Loading...</div>;

    return (
        <div className="category-page">
            {/* Category Banner */}
            <div className="category-hero">
                <div className="hero-overlay"></div>
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
                {/* Filter Bar */}
                <div className="filter-bar">
                    <span className="count">{filteredProducts.length} PRODUCTS FOUND</span>
                    <SortMenu value={sortBy} onChange={setSortBy} />
                </div>

                {/* Product Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="product-grid">
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                className={`product-card ${product.images?.[1] && product.images[1] !== product.images[0] ? "has-secondary-image" : ""}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <div className="image-wrapper">
                                    {(() => {
                                        const primaryImage = product.images?.[0];
                                        const secondaryImage = product.images?.[1] || primaryImage;
                                        const hasSecondaryImage = Boolean(
                                            product.images?.[1] && product.images[1] !== product.images[0]
                                        );

                                        return (
                                            <>
                                                <img
                                                    className="product-image product-image-primary"
                                                    src={withPublicUrl(primaryImage)}
                                                    alt={product.title}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = withPublicUrl("images/placeholder-product.jpg");
                                                    }}
                                                />
                                                {hasSecondaryImage && (
                                                    <img
                                                        className="product-image product-image-secondary"
                                                        src={withPublicUrl(secondaryImage)}
                                                        alt={`${product.title} alternate view`}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = withPublicUrl(primaryImage || "images/placeholder-product.jpg");
                                                        }}
                                                    />
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                                <div className="info">
                                    <h3>{product.title}</h3>
                                    <div className="price-box">
                                        <span className="current">₹{product.price}</span>
                                        {product.oldPrice && (
                                            <span className="old">₹{product.oldPrice}</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
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
