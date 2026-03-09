import React, { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import { categoryMetadata } from "../../data/categoryMetadata";
import { withPublicUrl } from "../../utils/assetPath";
import { motion } from "framer-motion";
import "./CategoryPage.css";

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
                    className="hero-img"
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
                    <div className="sort-wrapper">
                        <label>SORT BY:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Newest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="product-grid">
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                className="product-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <div className="image-wrapper">
                                    <img src={withPublicUrl(product.images?.[0])} alt={product.title} />
                                    {product.oldPrice > product.price && (
                                        <span className="sale-tag">SALE</span>
                                    )}
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
