import React from "react";
import "./HeroVideo.css";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { withPublicUrl } from "../../utils/assetPath";
import { useSettings } from "../../context/SettingsContext";

export default function HeroVideo() {
  const navigate = useNavigate();
  const { content } = useSettings();

  // Scroll animations for subtle parallax
  const { scrollY } = useScroll();
  const textY = useTransform(scrollY, [0, 400], [0, 50]);
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1, duration: 0.6 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="hero-video">
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={withPublicUrl("images/bannernewasaga2.jpeg")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
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
          style={{ y: textY, opacity: textOpacity }}
        >
          <motion.p className="hero-kicker" variants={item}>
            Aashaka
          </motion.p>
          <motion.h1 className="hero-title" variants={item}>
            {content.heroHeading.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i !== content.heroHeading.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </motion.h1>
          <motion.p className="hero-subtitle" variants={item}>
            {content.heroSubtitle}
          </motion.p>
          <motion.button
            className="hero-cta"
            type="button"
            variants={item}
            onClick={() => navigate("/shop/all")}
          >
            {content.ctaLabel}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
