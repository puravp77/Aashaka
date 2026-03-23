const mongoose = require("mongoose");

const siteConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
    },
    settings: {
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
      shippingRates: {
        flatRate: {
          type: Number,
          default: 50,
        },
        freeShippingThreshold: {
          type: Number,
          default: 1000,
        },
      },
    },
    content: {
      heroHeading: {
        type: String,
        default: "Timeless Jewellery, Modern Grace",
      },
      heroSubtitle: {
        type: String,
        default: "Discover curated pieces crafted to elevate every day.",
      },
      ctaLabel: {
        type: String,
        default: "Explore Collection",
      },
      ctaLink: {
        type: String,
        default: "/jewellery/oxidised",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SiteConfig", siteConfigSchema);
