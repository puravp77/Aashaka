import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { motion } from "framer-motion";
import "./CategorySection.css";
import { withPublicUrl } from "../../utils/assetPath";

const CATEGORY_ITEMS = [
  {
    title: "Oxidised Set",
    tagline: "Vintage silver finish",
    path: "/jewellery/oxidised",
    image: "images/OxidisedSet.jpeg",
    alt: "Oxidised Set",
  },
  {
    title: "Bangles-Kada",
    tagline: "Stacked festive shine",
    path: "/jewellery/bangles",
    image: "images/kada.jpeg",
    alt: "Bangles Kada",
  },
  {
    title: "Earrings",
    tagline: "Statement to subtle",
    path: "/jewellery/earrings",
    image: "images/Earrings.jpeg",
    alt: "Earrings",
  },
  {
    title: "Necklace",
    tagline: "Wedding-ready picks",
    path: "/jewellery/necklace",
    image: "images/neckless.jpeg",
    alt: "Necklace",
  },
  {
    title: "Kurti Set",
    tagline: "Elegant daily glam",
    path: "/kurti",
    image: "images/kurti.jpeg",
    alt: "Kurti Set",
  },
];

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
    if (!gridRef.current) return;
    gridRef.current.scrollBy({ left: -220, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!gridRef.current) return;
    gridRef.current.scrollBy({ left: 220, behavior: "smooth" });
  };

  return (
    <section className="category-section">
      <div className="category-head">
        <p className="category-kicker">Find Your Style</p>
        <h2>Shop by Category</h2>
        <p className="category-subtitle">
          Explore curated collections crafted for every mood and moment.
        </p>
      </div>

      <div className="category-wrapper">
        <button
          type="button"
          className="cat-arrow left"
          onClick={scrollLeft}
          aria-label="Scroll categories left"
        >
          &#8249;
        </button>

        <button
          type="button"
          className="cat-arrow right"
          onClick={scrollRight}
          aria-label="Scroll categories right"
        >
          &#8250;
        </button>

        <motion.div
          className="category-grid"
          ref={gridRef}
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {CATEGORY_ITEMS.map((category) => (
            <motion.button
              key={category.path}
              type="button"
              className="category-card"
              onClick={() => navigate(category.path)}
              variants={item}
            >
              <span className="category-media">
                <img src={withPublicUrl(category.image)} alt={category.alt} />
                <span className="category-shade" aria-hidden="true" />
               
              </span>

              <span className="category-copy">
                <span className="category-name">{category.title}</span>
                <span className="category-tagline">{category.tagline}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
