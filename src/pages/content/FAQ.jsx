import React from "react";

export default function FAQ() {
  return (
    <section
      style={{
        background: "#ffffff",
        padding: "80px 20px",
        fontFamily: "Times New Roman, serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          color: "#4a4a4a",
        }}
      >
        <h1 style={{ marginBottom: "40px" }}>Frequently Asked Questions</h1>

        {/* Q1 */}
        <h3 style={{ marginBottom: "10px" }}>
          How long will it take for my order to arrive?
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "30px" }}>
          We ship all orders across India via our trusted courier partner,
          Shiprocket. Once your order is confirmed, you can expect it to be
          delivered right to your doorstep within{" "}
          <strong>5–7 business days</strong>.
        </p>

        {/* Q2 */}
        <h3 style={{ marginBottom: "10px" }}>
          What payment methods do you accept?
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "30px" }}>
          We understand that you want to see our beautiful jewelry in person
          before you pay. That’s why we offer a secure{" "}
          <strong>Cash on Delivery (CoD)</strong> service. You can place your
          order with complete confidence, knowing you’ll only pay once your
          package has safely arrived.
        </p>

        {/* Q3 */}
        <h3 style={{ marginBottom: "10px" }}>
          What is your return and exchange policy?
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "30px" }}>
          We want you to be completely happy with your purchase. That’s why we
          offer returns and exchanges within{" "}
          <strong>24 hours of delivery</strong>. To be eligible, your item must
          be unused and in the same condition that you received it, with all
          original packaging intact.
        </p>

        {/* Q4 */}
        <h3 style={{ marginBottom: "10px" }}>
          How do I return or exchange an item?
        </h3>
        <p style={{ lineHeight: "1.8", marginBottom: "30px" }}>
          Just send us a message on our provided number or email us to initiate
          a return or exchange. A member of our team will guide you through the
          simple, hassle-free process.
        </p>

        {/* Q5 */}
        <h3 style={{ marginBottom: "10px" }}>
          What if I receive a damaged item?
        </h3>
        <p style={{ lineHeight: "1.8" }}>
          We take great care in packaging our jewelry, but if your item arrives
          damaged, please contact us immediately. We will be happy to exchange
          it for a new one at no extra cost, ensuring your satisfaction is our
          top priority.
        </p>
      </div>
    </section>
  );
}

