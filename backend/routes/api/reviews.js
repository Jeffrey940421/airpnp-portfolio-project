const express = require('express');
const { requireAuth, reviewExist, reviewAuthorization, reviewLimit } = require('../../utils/auth');
const { Spot, Review, ReviewImage, SpotImage, User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();
const { multipleFilesUpload, multipleMulterUpload, retrievePrivateFile } = require("../../awsS3");

const validateReviewInfo = [
  check('review')
    .exists({ checkNull: true })
    .withMessage("Please provide review text"),
  check('stars')
    .exists({ checkFalsy: true })
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
    where: { userId },
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
  res.json({ Reviews: reviews });
})

// add images to a review based on review id
router.post("/:reviewId/images", multipleMulterUpload("images"), requireAuth, reviewExist, reviewAuthorization, reviewLimit, async (req, res, next) => {
  const err = Error("Bad request.");
  err.status = 400;
  err.errors = {}
  err.title = "Bad Request";
  if (!req.files.length) {
    err.errors.images = "Please provide review images";
    return next(err);
  } else if (req.files.find(file => !file.mimetype.startsWith("image"))) {
    err.errors.images = "Please upload images only";
    return next(err);
  }
  const review = req.review;
  const { reviewId } = req.params;
  const urls = req.files ?
    await multipleFilesUpload({ files: req.files, public: true }) :
    null;
  const newReviewImages = await Promise.all(
    urls.map(url => review.createReviewImage({ reviewId, url }))
  )
  res.json(newReviewImages);
})

// edit a review
router.put("/:reviewId", requireAuth, reviewExist, reviewAuthorization, validateReviewInfo, async (req, res, next) => {
  const review = req.review;
  let updatedReview = await review.update({
    review: req.body.review,
    stars: req.body.stars
  });
  updatedReview = updatedReview.toJSON();
  delete updatedReview.ReviewImages;
  res.json(updatedReview);
})

// delete a review
router.delete("/:reviewId", requireAuth, reviewExist, reviewAuthorization, async (req, res, next) => {
  const review = req.review;
  await review.destroy();
  res.json({
    message: "Successfully deleted"
  });
})

module.exports = router;
