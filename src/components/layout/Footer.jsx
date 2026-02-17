import "./Footer.css";
import { withPublicUrl } from "../../utils/assetPath";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [email, setEmail] = useState("");

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

          {/* LOGO */}
          <div className="footer-logo">
            <img src={withPublicUrl("images/headerlogo.jpeg")} alt="Aashaka" />
          </div>

          {/* SUBSCRIBE */}
          <div className="footer-subscribe">
            <h3>
              Subscribe to Aashaka Fashion and
              <br />
              share our story.
            </h3>

            <form
              className="subscribe-input"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubscribe();
              }}
            >
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="arrow">❯</button>
            </form>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-links">
            <h4>QUICK LINKS</h4>
            <ul>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/theaashaka.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/theaashaka.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          {/* HELP */}
          <div className="footer-links">
            <h4>HELP</h4>
            <ul>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <Link to="/RefundPolicy">Refund Policy</Link>
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

        {/* BOTTOM */}
        <div className="footer-bottom">
          © 2025 Aashaka Fashion Handcrafted By S M Techno Consultants Pvt. Ltd.
        </div>
      </div>
    </footer>
  );
}

