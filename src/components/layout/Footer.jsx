import "./Footer.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer() {
  const [email, setEmail] = useState("");
  const year = new Date().getFullYear();

  const handleSubscribe = () => {
    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email");
      return;
    }

    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={withPublicUrl("images/headerlogo.jpeg")} alt="Aashaka" />
            </div>
            <p className="footer-brand-copy">
              Contemporary Indian fashion rooted in craftsmanship, culture, and
              everyday celebration.
            </p>
            <div className="footer-socials">
              <a
                href="https://www.instagram.com/theaashaka.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://www.facebook.com/theaashaka.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FaFacebookF />
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>

          <div className="footer-subscribe">
            <p className="footer-kicker">Newsletter</p>
            <h3>Get first access to fresh drops and exclusive style edits.</h3>

            <form
              className="subscribe-input"
              aria-label="Subscribe to Aashaka newsletter"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubscribe();
              }}
            >
              <input
                type="email"
                placeholder="Your Email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="subscribe-btn">
                Join
              </button>
            </form>

            <p className="footer-sub-note">
              By subscribing, you agree to receive updates from Aashaka.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/about">About Us</Link>
                </li>
                <li>
                  <Link to="/kurti">Kurti</Link>
                </li>
                <li>
                  <Link to="/jewellery/oxidised">Jewellery</Link>
                </li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Support</h4>
              <ul>
                <li>
                  <Link to="/faq">FAQ</Link>
                </li>
                <li>
                  <Link to="/refundpolicy">Refund Policy</Link>
                </li>
                <li>
                  <Link to="/termscondition">Terms & Conditions</Link>
                </li>
                <li>
                  <Link to="/contact-us">Contact Us</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            (c) {year} Aashaka Fashion. S M Techno Consultants Pvt. Ltd.
          </span>
        </div>
      </div>
    </footer>
  );
}
