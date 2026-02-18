import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

import AnimatedRoute from "./AnimatedRoute";

import Header from "./header";
import Footer from "./Footer";

import HeroVideo from "../home/HeroVideo";
import ProtectedRoute from "./ProtectedRoute";

import CategorySection from "../home/CategorySection";
import SignatureSection from "../home/SignatureSection";
import ChokerSection from "../home/ChokerSection";
import ExploreCollection from "../home/ExploreCollecetion";
import WatchShopSection from "../home/WatchShopSection";
import AboutSection from "../home/AboutSection";




import Kurti from "../../pages/shop/Kurti";
import Oxidised from "../../pages/shop/Oxidised";
import Bangles from "../../pages/shop/Bangles";
import Earrings from "../../pages/shop/Earrings";
import Necklace from "../../pages/shop/Necklace";
import ProductDetails from "../../pages/shop/ProductDetails";
import Account from "../../pages/account/Account";
import Cart from "../../pages/order/Cart";
import PlaceOrder from "../../pages/order/PlaceOrder";
import OrderSuccess from "../../pages/order/OrderSuccess";
import Checkout from "../../pages/order/Checkout";
import Login from "../../pages/auth/Login";
import Signup from "../../pages/auth/Signup";
import SearchResults from "../../pages/shop/SearchResult";
import Wishlist from "../../pages/account/Wishlist";
import OrderHistory from "../../pages/order/OrderHistory";
import ContactUs from "../../pages/content/ContactUs";
import RefundPolicy from "../../pages/content/RefundPolicy";
import TermsCondition from "../../pages/content/TermsCondition";
import FAQ from "../../pages/content/FAQ";
import ForgotPassword from "../../pages/auth/ForgotPassword";
import UserProfile from "../../pages/profile/UserProfilePage";
import EditAddressPage from "../../pages/profile/EditAddressPage";
import UserProfileOrders from "../../pages/profile/UserProfileOrdersPage";


import PageLoader from "../../pages/order/PageLoader";
import "./page-content.css";

function Home() {
  const { scrollY } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 1200], [0, -80]);
  const orbY2 = useTransform(scrollY, [0, 1200], [0, 120]);

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
                path="/user-profile/orders"
                element={
                  <ProtectedRoute>
                    <UserProfileOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-profile/address/new"
                element={
                  <ProtectedRoute>
                    <AnimatedRoute>
                      <EditAddressPage />
                    </AnimatedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-profile/address/edit"
                element={
                  <ProtectedRoute>
                    <AnimatedRoute>
                      <EditAddressPage />
                    </AnimatedRoute>
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
