const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Spot, Review, SpotImage, User, ReviewImage } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();
const sequelize = require("sequelize");
const { countryNames, getCountryCodeByName, getStatesByCountryName, getStateCodeByNames, getCitiesByCountryStateNames } = require("../../utils/address-validation");
const spot = require('../../db/models/spot');

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

const validateSpotImageInfo = [
  check('url')
    .exists({checkFalsy: true})
    .isURL()
    .withMessage("Image URL is required"),
  check('preview')
    .exists({checkNull: true})
    .custom((value) => {
      if (value === true || value === false) {
        return true;
      }
      return false;
    })
    .withMessage("Preview must be boolean"),
  handleValidationErrors
]

const validateSpotInfo = [
  check('address')
    .exists({checkFalsy: true})
    .isLength({min: 1, max: 255})
    .withMessage('Please provide an address with at least 1 character and no more than 255 characters'),
  check('city')
    .exists({checkFalsy: true})
    .isLength({min: 1, max: 70})
    .withMessage('Please provide a city with at least 1 character and no more than 70 characters'),
  check('city')
    .if((value, {req}) => {
      return getCountryCodeByName(req.body.country) && getStateCodeByNames(req.body.country, req.body.state)
    })
    .custom((value, {req}) => {
      if (!getCitiesByCountryStateNames(req.body.country, req.body.state).find(city => city === value)) {
        return false;
      }
      return true;
    })
    .withMessage('Please provide a valid city'),
  check('state')
    .exists({checkFalsy: true})
    .isLength({min: 2, max: 70})
    .withMessage('Please provide a state with at least 2 characters and no more than 70 characters'),
  check('state')
    .if((value, {req}) => {
      return getCountryCodeByName(req.body.country)
    })
    .custom((value, {req}) => {
      if (!getStatesByCountryName(req.body.country).find(state => state === value)) {
        return false;
      }
      return true;
    })
    .withMessage('Please provide a valid state. City is not validated with invalid state'),
  check('country')
    .exists({checkFalsy: true})
    .isLength({min: 4, max: 50})
    .withMessage('Please provide a state with at least 4 characters and no more than 50 characters'),
  check('country')
    .isIn(countryNames)
    .withMessage("Please provide a valid country. State and city are not validated with invalid country"),
  check('lat')
    .exists({checkFalsy: true})
    .custom((value) => {
      if (value !== +value) {
        return false;
      }
      return true
    })
    .withMessage("Latitude must be a number"),
  check('lat')
    .custom((value) => {
      if (value <= 90 && value >= -90) {
        return true
      }
      return false
    })
    .withMessage("Please provide a latitude no greater than 90 and no less than -90"),
  check('lat')
    .custom((value) => {
      if (+value.toFixed(7) !== value) {
        return false
      }
      return true
    })
    .withMessage("Please provide a latitude with a scale of 7"),
  check('lng')
    .exists({checkFalsy: true})
    .custom((value) => {
      if (value !== +value) {
        return false;
      }
      return true
    })
    .withMessage("Longitude must be a number"),
  check('lng')
    .custom((value) => {
      if (value <= 180 && value >= -180) {
        return true
      }
      return false
    })
    .withMessage("Please provide a longitude no greater than 180 and no less than -180"),
  check('lng')
    .custom((value) => {
      if (+value.toFixed(7) !== value) {
        return false
      }
      return true
    })
    .withMessage("Please provide a longitude with a scale of 7"),
  check('name')
    .exists({checkFalsy: true})
    .isLength({min: 1, max: 50})
    .withMessage("Please provide a name with at least 1 characters and no more than 50 characters"),
  check('description')
    .exists({checkFalsy: true})
    .withMessage("Description is required"),
  check('price')
    .exists({checkFalsy: true})
    .withMessage("Price is required"),
  check('price')
    .isInt()
    .withMessage("Price must be an integer"),
  handleValidationErrors
];

// get all spots
router.get("/", async (req, res) => {
  let spots = await Spot.findAll({
    include: [
      {
        model: Review,
        attributes: ["stars"]
      },
      {
        model: SpotImage,
        where: {
          preview: true
        },
        required: false
      }
    ]
  });
  spots = spots.map(spot => {
    spot = spot.toJSON();
    if (spot.SpotImages.length) {
      spot.previewImage = spot.SpotImages[0].url;
    } else {
      spot.previewImage = null;
    }
    if (spot.Reviews.length) {
      spot.avgRating = +(spot.Reviews.reduce((sum, review) => sum += review.stars, 0) / spot.Reviews.length).toFixed(2);
    } else {
      spot.avgRating = null;
    }
    delete spot.SpotImages;
    delete spot.Reviews;
    return spot;
  });
  res.json({Spots: spots});
});

// get all spots owned by the current user
router.get("/current", requireAuth, async (req, res) => {
  const ownerId = req.user.id;
  let spots = await Spot.findAll({
    where: {ownerId},
    include: [
      {
        model: Review,
        attributes: ["stars"]
      },
      {
        model: SpotImage,
        where: {
          preview: true
        },
        required: false
      }
    ]
  });
  spots = spots.map(spot => {
    spot = spot.toJSON();
    if (spot.SpotImages.length) {
      spot.previewImage = spot.SpotImages[0].url;
    } else {
      spot.previewImage = null;
    }
    if (spot.Reviews.length) {
      spot.avgRating = +(spot.Reviews.reduce((sum, review) => sum += review.stars, 0) / spot.Reviews.length).toFixed(2);
    } else {
      spot.avgRating = null;
    }
    delete spot.SpotImages;
    delete spot.Reviews;
    return spot;
  });
  res.json({Spots: spots});
})

// get details of a spot from an id
router.get("/:spotId", async (req, res, next) => {
  const {spotId} = req.params;
  let spotDetail = await Spot.findByPk(spotId, {
    attributes: {
      exclude: ["previewImage"]
    },
    include: [
      {
        model: Review,
        attributes: ["stars"]
      },
      {
        model: SpotImage,
        attributes: {
          exclude: ["spotId", "createdAt", "updatedAt"]
        }
      },
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
        as: "Owner"
      }
    ]
  });
  if (!spotDetail) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Spot couldn't be found";
    return next(error);
  }
  const numReviews = spotDetail.Reviews.length;
  let avgRating
  if (numReviews) {
    avgRating = +(spotDetail.Reviews.reduce((sum, review) => sum += review.stars, 0) / numReviews).toFixed(2);
  } else {
    avgRating = null;
  }
  spotDetail = spotDetail.toJSON();
  delete spotDetail.Reviews;
  spotDetail.numReviews = numReviews;
  spotDetail.avgRating = avgRating;
  res.json(spotDetail)
});

// create a spot
router.post("/", requireAuth, validateSpotInfo, async (req, res) => {
  const {address, city, state, country, lat, lng, name, description, price} = req.body;
  const ownerId = req.user.id;
  const newSpot = await Spot.create({ownerId, address, city, state, country, lat, lng, name, description, price});
  res.status(201);
  res.json(newSpot);
});

// add a spot image based on spot id
router.post("/:spotId/images", requireAuth, validateSpotImageInfo, async (req, res, next) => {
  const {spotId} = req.params;
  const ownerId = req.user.id;
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Spot couldn't be found";
    return next(error);
  }
  if (spot.ownerId !== ownerId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit the spot that does not belong to the current user";
    return next(error);
  }
  const {url, preview} = req.body;
  if (preview) {
    const previewImage = await SpotImage.findOne({
      where: {
        spotId,
        preview: true
      }
    });
    if (previewImage) {
      previewImage.preview = false;
      await previewImage.save();
    }
  }
  const newSpotImage = await SpotImage.create({spotId, url, preview});
  res.json({
    id: newSpotImage.id,
    url,
    preview
  })
})

// edit a spot
router.put("/:spotId", requireAuth, validateSpotInfo, async (req, res, next) => {
  const {spotId} = req.params;
  const ownerId = req.user.id;
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Spot couldn't be found";
    return next(error);
  }
  if (spot.ownerId !== ownerId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit the spot that does not belong to the current user";
    return next(error);
  }
  const {address, city, state, country, lat, lng, name, description, price} = req.body;
  const updatedSpot = await spot.update({address, city, state, country, lat, lng, name, description, price});
  res.json(updatedSpot);
})

// delete spot
router.delete("/:spotId", requireAuth, async (req, res, next) => {
  const {spotId} = req.params;
  const ownerId = req.user.id;
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Spot couldn't be found";
    return next(error);
  }
  if (spot.ownerId !== ownerId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit the spot that does not belong to the current user";
    return next(error);
  }
  await spot.destroy();
  res.json({
    message: "Successfully deleted"
  });
})

// get reviews by spot id
router.get("/:spotId/reviews", async (req, res, next) => {
  const {spotId} = req.params;
  const spot = await Spot.findByPk(spotId, {
    include: {
      model: Review,
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"]
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"]
        }
      ]
    }
  })
  if (!spot) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Spot couldn't be found";
    return next(error);
  }
  res.json({Reviews: spot.Reviews});
})

// create a review for a spot based on spot id
router.post("/:spotId/reviews", requireAuth, validateReviewInfo, async (req, res, next) => {
  const {spotId} = req.params;
  const userId = req.user.id;
  const spot = await Spot.findByPk(spotId, {
    include: {
      model: Review,
      attributes: ["userId"]
    }
  });
  if (!spot) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Spot couldn't be found";
    return next(error);
  }
  if (spot.Reviews.find(review => review.userId === userId)) {
    const error = {};
    error.title = "Internal Server Error";
    error.status = 500;
    error.message = "User already has a review for this spot";
    return next(error);
  }
  if (spot.ownerId === userId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot create a review for the spot that belongs to the current user";
    return next(error);
  }
  const {review, stars} = req.body;
  const newReview = await spot.createReview({userId, review, stars});
  res.status(201);
  res.json(newReview);
})


module.exports = router;
