import "./HeroVideo.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { withPublicUrl } from "../../utils/assetPath";

export default function HeroVideo() {
  const navigate = useNavigate();
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="hero-video">
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <source src={withPublicUrl("video/hero.mp4")} type="video/mp4" />
        Your browser does not support the video tag.
      </motion.video>

      <div className="hero-overlay">
        <motion.div
          className="hero-content"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.p className="hero-kicker" variants={item}>
            Aashaka
          </motion.p>
          <motion.h1 className="hero-title" variants={item}>
            Timeless Jewellery, <br></br>Modern Grace
          </motion.h1>
          <motion.p className="hero-subtitle" variants={item}>
            Discover curated pieces crafted to elevate every day.
          </motion.p>
          <motion.button
            className="hero-cta"
            type="button"
            variants={item}
            onClick={() => navigate("/jewellery/oxidised")}
          >
            Explore Collection
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
