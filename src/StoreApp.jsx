import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { FaArrowUp, FaWhatsapp } from "react-icons/fa";

import AnimatedRoute from "./components/layout/AnimatedRoute";
import Header from "./components/layout/header";
import Footer from "./components/layout/Footer";
import HeroVideo from "./components/home/HeroVideo";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import CategorySection from "./components/home/CategorySection";
import SignatureSection from "./components/home/SignatureSection";
import ChokerSection from "./components/home/ChokerSection";
import ExploreCollection from "./components/home/ExploreCollecetion";
import WatchShopSection from "./components/home/WatchShopSection";
import AboutSection from "./components/home/AboutSection";

import CategoryPage from "./pages/shop/CategoryPage";
import ProductDetails from "./pages/shop/ProductDetails";
import Account from "./pages/account/Account";
import Cart from "./pages/order/Cart";
import PlaceOrder from "./pages/order/PlaceOrder";
import OrderSuccess from "./pages/order/OrderSuccess";
import Checkout from "./pages/order/Checkout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import SearchResults from "./pages/shop/SearchResult";
import Wishlist from "./pages/account/Wishlist";
import OrderHistory from "./pages/order/OrderHistory";
import ContactUs from "./pages/content/ContactUs";
import RefundPolicy from "./pages/content/RefundPolicy";
import TermsCondition from "./pages/content/TermsCondition";
import FAQ from "./pages/content/FAQ";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UserProfile from "./pages/profile/UserProfilePage";
import EditAddressPage from "./pages/profile/EditAddressPage";
import UserProfileOrders from "./pages/profile/UserProfileOrdersPage";
import Footwear from "./pages/category/Footwear";

import PageLoader from "./pages/order/PageLoader";
import "./components/layout/page-content.css";
import "./StoreStyles.css";

function Home() {
  const { scrollY } = useScroll();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const orbY1 = useTransform(scrollY, [0, 1200], [0, -80]);
  const orbY2 = useTransform(scrollY, [0, 1200], [0, 120]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setShowScrollTop(latest > 220);
  });

  const reveal = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };
  const sectionViewport = { once: true, amount: 0.25 };
  const repeatRevealViewport = { once: false, amount: 0.25 };
  const sectionTransition = {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1],
  };

  return (
    <div className="home">
      <motion.div className="home-orb orb-1" style={{ y: orbY1 }} />
      <motion.div className="home-orb orb-2" style={{ y: orbY2 }} />

      <HeroVideo />
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        transition={sectionTransition}
      >
        <CategorySection />
      </motion.section>
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        transition={sectionTransition}
      >
        <SignatureSection />
      </motion.section>
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        transition={sectionTransition}
      >
        <ChokerSection />
      </motion.section>
      <section>
        <ExploreCollection />
      </section>
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={repeatRevealViewport}
        transition={sectionTransition}
      >
        <WatchShopSection />
      </motion.section>
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        transition={sectionTransition}
      >
        <AboutSection />
      </motion.section>

      <a
        className="home-whatsapp-fab"
        href="https://wa.me/919265169947?text=Hi%20Aashaka%2C%20I%20need%20help."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </a>

      {showScrollTop && (
        <button
          type="button"
          className="home-scrolltop-fab"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}

export default function StoreApp() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className="store-root">
      {loading && <PageLoader />}

      <div className="app-layout">
        <Header />

        <main className="page-content">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<AnimatedRoute><Home /></AnimatedRoute>} />
              <Route path="/login" element={<AnimatedRoute><Login /></AnimatedRoute>} />
              <Route path="/signup" element={<AnimatedRoute><Signup /></AnimatedRoute>} />
              <Route path="/search" element={<AnimatedRoute><SearchResults /></AnimatedRoute>} />

              <Route path="/wishlist" element={<ProtectedRoute><AnimatedRoute><Wishlist /></AnimatedRoute></ProtectedRoute>} />
              <Route path="/order-history" element={<ProtectedRoute><AnimatedRoute><OrderHistory /></AnimatedRoute></ProtectedRoute>} />

              <Route path="/kurti" element={<AnimatedRoute><CategoryPage /></AnimatedRoute>} />
              <Route path="/footwear" element={<AnimatedRoute><Footwear /></AnimatedRoute>} />
              <Route path="/jewellery/:categoryName" element={<AnimatedRoute><CategoryPage /></AnimatedRoute>} />
              <Route path="/shop/:categoryName" element={<AnimatedRoute><CategoryPage /></AnimatedRoute>} />
              <Route path="/product/:id" element={<AnimatedRoute><ProductDetails /></AnimatedRoute>} />

              <Route path="/about" element={<AnimatedRoute><AboutSection /></AnimatedRoute>} />
              <Route path="/account" element={<AnimatedRoute><Account /></AnimatedRoute>} />
              <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/user-profile/orders" element={<ProtectedRoute><UserProfileOrders /></ProtectedRoute>} />
              <Route path="/user-profile/address/new" element={<ProtectedRoute><AnimatedRoute><EditAddressPage /></AnimatedRoute></ProtectedRoute>} />
              <Route path="/user-profile/address/edit" element={<ProtectedRoute><AnimatedRoute><EditAddressPage /></AnimatedRoute></ProtectedRoute>} />

              <Route path="/cart" element={<AnimatedRoute><Cart /></AnimatedRoute>} />
              <Route path="/checkout" element={<AnimatedRoute><Checkout /></AnimatedRoute>} />
              <Route path="/place-order" element={<AnimatedRoute><PlaceOrder /></AnimatedRoute>} />
              <Route path="/order-success/:orderId" element={<AnimatedRoute><OrderSuccess /></AnimatedRoute>} />
              <Route path="/order-success" element={<AnimatedRoute><OrderSuccess /></AnimatedRoute>} />

              <Route path="/contact-us" element={<AnimatedRoute><ContactUs /></AnimatedRoute>} />
              <Route path="/refundpolicy" element={<AnimatedRoute><RefundPolicy /></AnimatedRoute>} />
              <Route path="/termscondition" element={<AnimatedRoute><TermsCondition /></AnimatedRoute>} />
              <Route path="/faq" element={<AnimatedRoute><FAQ /></AnimatedRoute>} />
              <Route path="/forget-password" element={<AnimatedRoute><ForgotPassword /></AnimatedRoute>} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
}
