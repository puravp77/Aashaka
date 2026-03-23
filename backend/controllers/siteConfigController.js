const SiteConfig = require("../models/SiteConfig");

const DEFAULT_KEY = "default";

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  shippingRates: {
    flatRate: 50,
    freeShippingThreshold: 1000,
  },
};

const DEFAULT_CONTENT = {
  heroHeading: "Timeless Jewellery, Modern Grace",
  heroSubtitle: "Discover curated pieces crafted to elevate every day.",
  ctaLabel: "Explore Collection",
  ctaLink: "/jewellery/oxidised",
};

const getOrCreateSiteConfig = async () => {
  let config = await SiteConfig.findOne({ key: DEFAULT_KEY });

  if (!config) {
    config = await SiteConfig.create({
      key: DEFAULT_KEY,
      settings: DEFAULT_SETTINGS,
      content: DEFAULT_CONTENT,
    });
  }

  return config;
};

const getSettings = async (req, res, next) => {
  try {
    const config = await getOrCreateSiteConfig();
    return res.status(200).json(config.settings || DEFAULT_SETTINGS);
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const payload = {
      maintenanceMode: Boolean(req.body?.maintenanceMode),
      shippingRates: {
        flatRate: Number(req.body?.shippingRates?.flatRate ?? DEFAULT_SETTINGS.shippingRates.flatRate),
        freeShippingThreshold: Number(
          req.body?.shippingRates?.freeShippingThreshold ??
            DEFAULT_SETTINGS.shippingRates.freeShippingThreshold
        ),
      },
    };

    const config = await SiteConfig.findOneAndUpdate(
      { key: DEFAULT_KEY },
      { $set: { settings: payload } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json(config.settings);
  } catch (error) {
    next(error);
  }
};

const getContent = async (req, res, next) => {
  try {
    const config = await getOrCreateSiteConfig();
    return res.status(200).json(config.content || DEFAULT_CONTENT);
  } catch (error) {
    next(error);
  }
};

const updateContent = async (req, res, next) => {
  try {
    const payload = {
      heroHeading: String(req.body?.heroHeading ?? DEFAULT_CONTENT.heroHeading),
      heroSubtitle: String(req.body?.heroSubtitle ?? DEFAULT_CONTENT.heroSubtitle),
      ctaLabel: String(req.body?.ctaLabel ?? DEFAULT_CONTENT.ctaLabel),
      ctaLink: String(req.body?.ctaLink ?? DEFAULT_CONTENT.ctaLink),
    };

    const config = await SiteConfig.findOneAndUpdate(
      { key: DEFAULT_KEY },
      { $set: { content: payload } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json(config.content);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getContent,
  updateContent,
};
