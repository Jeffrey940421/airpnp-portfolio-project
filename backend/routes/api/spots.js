const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Spot } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

// get all spots
router.get("/", async (req, res) => {
  const spots = await Spot.findAll();
  res.json({spots});
})

module.exports = router;
