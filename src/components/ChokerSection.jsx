import "./ChokerSection.css";
import { withPublicUrl } from "../utils/assetPath";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import allProducts from "../data/allProducts";

export default function ChokerSection() {
  const navigate = useNavigate();
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  const chokers = allProducts.filter(
    (item) => item.category === "choker"
  );

  return (
    <section className="choker-section">
      <h2 className="choker-title">CHOKER</h2>

      <motion.div
        className="choker-grid"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
      >
        {chokers.map((product) => (
          <motion.div
            className="product-card"
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: "pointer" }}
            variants={item}
          >
            <div className="product-image">
              <img src={withPublicUrl(product.images[0])} alt={product.title} />
              <div className="hover-overlay"></div>
              <span className="view-icon">👁</span>
            </div>

            <div className="product-info">
              <p className="product-title">{product.title}</p>

              <div className="product-price">
                <span className="price">₹{product.price}</span>
                <span className="old-price">₹{product.oldPrice}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
