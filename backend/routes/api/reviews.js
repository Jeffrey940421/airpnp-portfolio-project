const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Spot, Review, ReviewImage, SpotImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();
const sequelize = require("sequelize");

const validateReviewImageInfo = [
  check('url')
    .exists({checkFalsy: true})
    .isURL()
    .withMessage("Image URL is required"),
  handleValidationErrors
]

const validateReviewInfo = [
  check('review')
    .exists({checkNull: true})
    .withMessage("Please provide review text"),
  check('stars')
    .exists({checkFalsy: true})
    .isInt()
    .withMessage("Stars must be an integer")
    .custom((value) => {
      if (value >= 1 && value <= 5) {
        return true;
      }
      return false;
    })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors
]

// get reviews of current user
router.get("/current", requireAuth, async (req, res) => {
  const userId = req.user.id;
  let reviews = await Review.findAll({
    where: {userId},
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"]
      },
      {
        model: Spot,
        attributes: {
          exclude: ["description", "createdAt", "updatedAt"]
        },
        include: {
          model: SpotImage,
          attributes: ["url"],
          where: {
            preview: true
          },
          required: false
        }
      },
      {
        model: ReviewImage,
        attributes: ["id", "url"]
      }
    ]
  });
  reviews = reviews.map(review => {
    review = review.toJSON();
    if (review.Spot.SpotImages.length) {
      review.Spot.previewImage = review.Spot.SpotImages[0].url;
    } else {
      review.Spot.previewImage = null;
    }
    delete review.Spot.SpotImages;
    return review;
  })
  res.json({Reviews: reviews});
})

// add an image to a review based on review id
router.post("/:reviewId/images", requireAuth, validateReviewImageInfo, async (req, res, next) => {
  const {reviewId} = req.params;
  const review = await Review.findByPk(reviewId, {
    include: ReviewImage
  });
  const userId = req.user.id;
  if (!review) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Review couldn't be found";
    return next(error);
  }
  if (review.ReviewImages.length >= 10) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Maximum number of images for this resource was reached";
    return next(error);
  }
  if (review.userId !== userId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit the review that does not belong to the current user";
    return next(error);
  }
  const {url} = req.body;
  const newReviewImage = await review.createReviewImage({url});
  res.json({
    id: newReviewImage.id,
    url
  });
})

// edit a review
router.put("/:reviewId", requireAuth, validateReviewInfo, async (req, res, next) => {
  const {reviewId} = req.params;
  const review = await Review.findByPk(reviewId);
  const userId = req.user.id;
  if (!review) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Review couldn't be found";
    return next(error);
  }
  if (review.userId !== userId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit the review that does not belong to the current user";
    return next(error);
  }
  const updatedReview = await review.update({
    review: req.body.review,
    stars: req.body.stars
  });
  res.json(updatedReview);
})

// delete a review
router.delete("/:reviewId", requireAuth, async (req, res, next) => {
  const {reviewId} = req.params;
  const userId = req.user.id;
  const review = await Review.findByPk(reviewId);
  if (!review) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Review couldn't be found";
    return next(error);
  }
  if (review.userId !== userId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit the review that does not belong to the current user";
    return next(error);
  }
  await review.destroy();
  res.json({
    message: "Successfully deleted"
  });
})

module.exports = router;
