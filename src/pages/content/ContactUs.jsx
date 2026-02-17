import "./ContactUs.css";

export default function ContactUs() {
  return (
    <section className="contact-page">
      <div className="contact-wrapper">

        {/* LEFT : MAP */}
        <div className="contact-map">
          <iframe
            title="Aashaka Location"
            src="https://www.google.com/maps?q=425/426%20Blu%20Trio,%20Adajan,%20Surat,%20Gujarat&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* RIGHT : DETAILS */}
        <div className="contact-details">

          <div className="contact-item">
            <span className="icon">📍</span>
            <p>425/426 Blu Trio, Adajan, Surat, Gujarat</p>
          </div>

          <div className="contact-item">
            <span className="icon">📞</span>
            <p>7861056619</p>
          </div>

          <div className="contact-item">
            <span className="icon">📧</span>
            <p>dabhiharshi1312@gmail.com</p>
          </div>

        </div>

      </div>
    </section>
  );
}

