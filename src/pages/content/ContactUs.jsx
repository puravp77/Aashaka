import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import "./ContactUs.css";

export default function ContactUs() {
  return (
    <section className="contact-page">
      <header className="contact-hero">
        <p className="contact-kicker">Get In Touch</p>
        <h1>Contact Aashaka</h1>
        <p>
          Visit our studio, call us, or drop us an email. We respond quickly and
          are happy to help with orders and queries.
        </p>
      </header>

      <div className="contact-wrapper">
        <div className="contact-map">
          <div className="contact-map-tag">Store Location</div>
          <iframe
            title="Aashaka Location"
            src="https://www.google.com/maps?q=425/426%20Blu%20Trio,%20Adajan,%20Surat,%20Gujarat&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <aside className="contact-details" aria-label="Contact details">
          <h2>Contact Us</h2>
          <p className="contact-subtitle">
            We are here to help with orders, support, and collaborations.
          </p>

          <div className="contact-item">
            <span className="icon" aria-hidden="true">
              <FiMapPin />
            </span>
            <div>
              <h3>Address</h3>
              <p>425/426 Blu Trio, Adajan, Surat, Gujarat</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="icon" aria-hidden="true">
              <FiPhone />
            </span>
            <div>
              <h3>Phone</h3>
              <p>
                <a href="tel:+917861056619">+91 78610 56619</a>
              </p>
            </div>
          </div>

          <div className="contact-item">
            <span className="icon" aria-hidden="true">
              <FiMail />
            </span>
            <div>
              <h3>Email</h3>
              <p>
                <a href="mailto:dabhiharshi1312@gmail.com">dabhiharshi1312@gmail.com</a>
              </p>
            </div>
          </div>

          <div className="contact-actions">
            <a href="tel:+917861056619">Call Now</a>
            <a href="mailto:dabhiharshi1312@gmail.com">Send Email</a>
          </div>
        </aside>
      </div>
    </section>
  );
}
