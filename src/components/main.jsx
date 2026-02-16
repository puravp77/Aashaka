import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

import AnimatedRoute from "./AnimatedRoute";

import Header from "./header";
import Footer from "./Footer";

import HeroVideo from "./HeroVideo";
import ProtectedRoute from "./ProtectedRoute";

import CategorySection from "./CategorySection";
import SignatureSection from "./SignatureSection";
import ChokerSection from "./ChokerSection";
import ExploreCollection from "./ExploreCollecetion";
import WatchShopSection from "./WatchShopSection";
import AboutSection from "./AboutSection";

import Kurti from "../pages/Kurti";
import Oxidised from "../pages/Oxidised";
import Bangles from "../pages/Bangles";
import Earrings from "../pages/Earrings";
import Necklace from "../pages/Necklace";
import ProductDetails from "../pages/ProductDetails";
import Account from "../pages/Account";
import Cart from "../pages/Cart";
import PlaceOrder from "../pages/PlaceOrder";
import OrderSuccess from "../pages/OrderSuccess";
import Checkout from "../pages/Checkout";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import SearchResults from "../pages/SearchResult";
import Wishlist from "../pages/Wishlist";
import OrderHistory from "../pages/OrderHistory";
import ContactUs from "../pages/ContactUs";
import RefundPolicy from "../pages/RefundPolicy";
import TermsCondition from "../pages/TermsCondition";
import FAQ from "../pages/FAQ";
import ForgotPassword from "../pages/ForgotPassword";
import UserProfile from "./UserProfile";


import PageLoader from "../pages/PageLoader";
import "./page-content.css";

function Home() {
  const { scrollY } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 1200], [0, -80]);
  const orbY2 = useTransform(scrollY, [0, 1200], [0, 120]);

  const reveal = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
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
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <CategorySection />
      </motion.section>
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
      >
        <SignatureSection />
      </motion.section>
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
      >
        <ChokerSection />
      </motion.section>
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
      >
        <ExploreCollection />
      </motion.section>
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
      >
        <WatchShopSection />
      </motion.section>
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
      >
        <AboutSection />
      </motion.section>
    </div>
  );
}

export default function Main() {
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
    <>
      {loading && <PageLoader />}

      <div className="app-layout">
        <Header />

        <main className="page-content">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

              <Route
                path="/"
                element={
                  <AnimatedRoute>
                    <Home />
                  </AnimatedRoute>
                }
              />

              <Route
                path="/login"
                element={
                  <AnimatedRoute>
                    <Login />
                  </AnimatedRoute>
                }
              />

              <Route
                path="/signup"
                element={
                  <AnimatedRoute>
                    <Signup />
                  </AnimatedRoute>
                }
              />

              <Route
                path="/search"
                element={
                  <AnimatedRoute>
                    <SearchResults />
                  </AnimatedRoute>
                }
              />

              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <AnimatedRoute>
                      <Wishlist />
                    </AnimatedRoute>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/order-history"
                element={
                  <ProtectedRoute>
                    <AnimatedRoute>
                      <OrderHistory />
                    </AnimatedRoute>
                  </ProtectedRoute>
                }
              />

              <Route path="/kurti" element={<AnimatedRoute><Kurti /></AnimatedRoute>} />
              <Route path="/jewellery/oxidised" element={<AnimatedRoute><Oxidised /></AnimatedRoute>} />
              <Route path="/jewellery/bangles" element={<AnimatedRoute><Bangles /></AnimatedRoute>} />
              <Route path="/jewellery/earrings" element={<AnimatedRoute><Earrings /></AnimatedRoute>} />
              <Route path="/jewellery/necklace" element={<AnimatedRoute><Necklace /></AnimatedRoute>} />
              <Route path="/product/:id" element={<AnimatedRoute><ProductDetails /></AnimatedRoute>} />

              <Route path="/about" element={<AnimatedRoute><AboutSection /></AnimatedRoute>} />
              <Route path="/account" element={<AnimatedRoute><Account /></AnimatedRoute>} />
              <Route
                path="/user-profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <AnimatedRoute>
                    <Cart />
                  </AnimatedRoute>
                }
              />

              <Route
                path="/checkout"
                element={
                  <AnimatedRoute>
                    <Checkout />
                  </AnimatedRoute>
                }
              />

              <Route
                path="/place-order"
                element={
                  <AnimatedRoute>
                    <PlaceOrder />
                  </AnimatedRoute>
                }
              />

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
    </>
  );
}
