import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { motion } from "framer-motion";
import "./CategorySection.css";
import { withPublicUrl } from "../../utils/assetPath";

export default function CategorySection() {
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  const scrollLeft = () => {
    gridRef.current.scrollBy({ left: -180, behavior: "smooth" });
  };

  const scrollRight = () => {
    gridRef.current.scrollBy({ left: 180, behavior: "smooth" });
  };

  return (
    <section className="category-section">
      <div className="category-wrapper">

        {/* 🔥 MOBILE ARROWS */}
        <button className="cat-arrow left" onClick={scrollLeft}>
          ‹
        </button>

        <button className="cat-arrow right" onClick={scrollRight}>
          ›
        </button>

        <motion.div
          className="category-grid"
          ref={gridRef}
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >

          <motion.div
            className="category-card"
            onClick={() => navigate("/jewellery/oxidised")}
            variants={item}
          >
            <img src={withPublicUrl("images/OxidisedSet.jpeg")} alt="Oxidised Set" />
            <p><b>Oxidised set</b></p>
          </motion.div>

          <motion.div
            className="category-card"
            onClick={() => navigate("/jewellery/bangles")}
            variants={item}
          >
            <img src={withPublicUrl("images/kada.jpeg")} alt="Bangles Kada" />
            <p><b>Bangles-Kada</b></p>
          </motion.div>

          <motion.div
            className="category-card"
            onClick={() => navigate("/jewellery/earrings")}
            variants={item}
          >
            <img src={withPublicUrl("images/Earrings.jpeg")} alt="Earrings" />
            <p><b>Earrings</b></p>
          </motion.div>

          <motion.div
            className="category-card"
            onClick={() => navigate("/jewellery/necklace")}
            variants={item}
          >
            <img src={withPublicUrl("images/neckless.jpeg")} alt="Necklace" />
            <p><b>Necklace</b></p>
          </motion.div>

          <motion.div
            className="category-card"
            onClick={() => navigate("/kurti")}
            variants={item}
          >
            <img src={withPublicUrl("images/kurti.jpeg")} alt="Kurti Set" />
            <p><b>Kurti Set</b></p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

