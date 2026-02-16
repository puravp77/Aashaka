import "./Kurti.css";
import { withPublicUrl } from "../utils/assetPath";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import normalizedKurtiData from "../data/normalizedKurtiData";

export default function Kurti() {

  const navigate = useNavigate();
    const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemMotion = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="kurti-page">
      <div className="kurti-top">
        <span className="count">
          {normalizedKurtiData.length} PRODUCTS
        </span>
      </div>

      <motion.div
        className="kurti-grid"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
      >
        {normalizedKurtiData.map((product) => (
          <motion.div
            key={product.id}
            className="kurti-item"
            onClick={() => navigate(`/product/${product.id}`)}
            variants={itemMotion}
          >
            <img src={withPublicUrl(product.images[0])} alt={product.title} />
            <h3>{product.title}</h3>

            <div className="price">
              <span className="current">₹{product.price}</span>
              <span className="old">₹{product.oldPrice}</span>
            </div>
          </motion.div>      
           ))}
        </motion.div>
    </section>
  );
}
