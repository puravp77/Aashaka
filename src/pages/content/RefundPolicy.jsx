import React from "react";

export default function RefundPolicy() {
  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        padding: "12px 20px 100px",
        fontFamily: "Times New Roman, serif",
      }}
    >
      <div
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          color: "#4a4a4a",
          lineHeight: "1.9",
        }}
      >
        {/* TITLE */}
        <h1 style={{ marginBottom: "32px", fontSize: "28px" }}>
          Aashaka – Exchange Policy
        </h1>

        {/* INTRO */}
        <p style={{ marginBottom: "36px" }}>
          We want you to love every piece you purchase from us. While we do not
          offer refunds, we are happy to provide an exchange in the form of a
          store credit for any non-offer products. Please read our policy
          carefully to ensure a smooth process.
        </p>

        {/* SECTION 1 */}
        <h3 style={{ marginBottom: "14px" }}>
          1. Eligibility for Exchange
        </h3>
        <ul style={{ marginBottom: "32px", paddingLeft: "20px" }}>
          <li>
            <strong>Timeframe :</strong> To be eligible for an exchange, you must
            contact us within <strong>24 hours</strong> of receiving your order.
          </li>
          <li>
            <strong>Product Condition :</strong> The item must be unused,
            unworn, in its original condition, and with all original tags and
            packaging intact.
          </li>
          <li>
            <strong>Non-Eligible Items :</strong> Products purchased during a
            sale, with a discount code, or as part of any special promotion are
            considered final sale and are <strong>not eligible</strong> for
            exchange.
          </li>
        </ul>

        {/* SECTION 2 */}
        <h3 style={{ marginBottom: "14px" }}>
          2. How to Initiate an Exchange (2 Simple Steps)
        </h3>
        <ul style={{ marginBottom: "32px", paddingLeft: "20px" }}>
          <li>
            <strong>Contact Us :</strong> Email us at{" "}
            <a href="mailto:dabhiharshi1312@gmail.com">
              dabhiharshi1312@gmail.com
            </a>{" "}
            or send a message to <strong>7861056619</strong>. Please include your{" "}
            <strong>Order Number</strong> and the reason for the exchange.
          </li>
          <li>
            <strong>Await Confirmation :</strong> Our team will review your
            request and get back to you with confirmation and instructions to
            proceed.
          </li>
        </ul>

        {/* SECTION 3 */}
        <h3 style={{ marginBottom: "14px" }}>
          3. Shipping the Product Back to Us
        </h3>
        <ul style={{ marginBottom: "32px", paddingLeft: "20px" }}>
          <li>
            <strong>Shipping Deadline :</strong> Once your exchange is confirmed,
            you must ship the product back to us within <strong>2 days</strong>.
          </li>
          <li>
            <strong>Packaging :</strong> Please ensure the product is securely
            packed to prevent any damage during transit. Remember to include the{" "}
            <strong>original invoice</strong> inside the package.
          </li>
          <li>
            <strong>Shipping Address :</strong>
            <br />
            <br />
            <strong>Aashaka</strong>
            <br />
            A-802, Raghuvir Shell,
            <br />
            Gail Colony, Opposite VR Mall Vesu,
            <br />
            Surat, Gujarat.
          </li>
          <li>
            <strong>Shipping Costs :</strong> The customer is responsible for all
            shipping costs. This includes the cost of returning the item and the
            shipping fee for the exchanged product.
          </li>
        </ul>

        {/* SECTION 4 */}
        <h3 style={{ marginBottom: "14px" }}>
          4. Receiving Your Store Credit
        </h3>
        <ul style={{ marginBottom: "36px", paddingLeft: "20px" }}>
          <li>
            <strong>Inspection :</strong> Once we receive the returned item, our
            team will conduct a quality inspection.
          </li>
          <li>
            <strong>Store Credit Issuance :</strong> Upon successful inspection,
            a coupon code equivalent to the product value will be issued.
          </li>
          <li>
            <strong>Timeline :</strong> The coupon code will be sent to your
            registered email within <strong>5 business days</strong> of
            receiving your return.
          </li>
        </ul>

        {/* NOTE */}
        <p style={{ fontSize: "15px", color: "#555" }}>
          <strong>Please Note :</strong> Aashaka reserves the right to reject any
          exchange request if the product shows signs of use, damage, or does
          not meet the conditions outlined above.
        </p>
      </div>
    </section>
  );
}

