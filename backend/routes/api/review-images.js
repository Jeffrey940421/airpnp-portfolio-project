const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Spot, Review, ReviewImage, SpotImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();
const sequelize = require("sequelize");

router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const {imageId} = req.params;
  const userId = req.user.id;
  const reviewImage = await ReviewImage.findByPk(imageId, {
    include: Review
  })
  if (!reviewImage) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Review image couldn't be found";
    return next(error);
  }
  if (reviewImage.Review.userId !== userId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit the review that does not belong to the current user";
    return next(error);
  }
  await reviewImage.destroy();
  res.json({
    message: "Successfully deleted"
  })
})

module.exports = router;
