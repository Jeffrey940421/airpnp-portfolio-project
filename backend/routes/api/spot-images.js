const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Spot, Review, ReviewImage, SpotImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();
const sequelize = require("sequelize");


// delete a spot image
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const {imageId} = req.params;
  const ownerId = req.user.id;
  const spotImage = await SpotImage.findByPk(imageId, {
    include: Spot
  })
  if (!spotImage) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Spot image couldn't be found";
    return next(error);
  }
  if (spotImage.Spot.ownerId !== ownerId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit the spot that does not belong to the current user";
    return next(error);
  }
  await spotImage.destroy();
  res.json({
    message: "Successfully deleted"
  })
})

module.exports = router;
