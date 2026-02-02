import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./header";
import Footer from "./Footer";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HeroVideo from "./HeroVideo";
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
import ContactUs from "../pages/ContactUs";
import RefundPolicy from "../pages/RefundPolicy";
import TermsCondition from "../pages/TermsCondition";
import FAQ from "../pages/FAQ";

import PageLoader from "../pages/PageLoader";
import "./page-content.css";

function Home() {
  return (
    <>
      <HeroVideo />
      <CategorySection />
      <SignatureSection />
      <ChokerSection />
      <ExploreCollection />
      <WatchShopSection />
      <AboutSection />
    </>
  );
}

export default function Main() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  /* single scroll reset (ONLY ON ROUTE CHANGE) */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  /* page loader */
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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/kurti" element={<Kurti />} />
            <Route path="/jewellery/oxidised" element={<Oxidised />} />
            <Route path="/jewellery/bangles" element={<Bangles />} />
            <Route path="/jewellery/earrings" element={<Earrings />} />
            <Route path="/jewellery/necklace" element={<Necklace />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/about" element={<AboutSection />} />
            <Route path="/account" element={<Account />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/refundpolicy" element={<RefundPolicy />} />
            <Route path="/termscondition" element={<TermsCondition />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </main>

        <Footer />

        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar
          pauseOnHover={false}
        />
      </div>
    </>
  );
}
