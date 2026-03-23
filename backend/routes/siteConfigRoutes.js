const express = require("express");
const {
  getSettings,
  updateSettings,
  getContent,
  updateContent,
} = require("../controllers/siteConfigController");

const router = express.Router();

router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.get("/content", getContent);
router.put("/content", updateContent);

module.exports = router;
