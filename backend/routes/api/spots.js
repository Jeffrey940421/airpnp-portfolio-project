const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Spot, Review, SpotImage, User, ReviewImage, Booking } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();
const sequelize = require("sequelize");
const { countryNames, getCountryCodeByName, getStatesByCountryName, getStateCodeByNames, getCitiesByCountryStateNames } = require("../../utils/address-validation");
const { Op } = require("sequelize");

const validateBookingInfo = [
  check("startDate")
    .exists({checkNull: true})
    .isDate({
      format: "YYYY-MM-DD",
      delimiters: ["-"]
    })
    .withMessage("Start date must be a date in YYYY-MM-DD format"),
  check("startDate")
    .custom((value) => {
      if (new Date(value).getTime() < new Date().setHours(-7, 0, 0, 0)) {
        return false
      }
      return true
    })
    .withMessage("Start date must be after today's date"),
  check("endDate")
    .exists({checkNull: true})
    .isDate({
      format: "YYYY-MM-DD",
      delimiters: ["-"]
    })
    .withMessage("Start date must be a date in YYYY-MM-DD format"),
  check("endDate")
    .custom((value, {req}) => {
      if (new Date(value).getTime() <= new Date(req.body.startDate).getTime()) {
        return false
      }
      return true
    })
    .withMessage("End Date must be after start date"),
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

const validateSpotQuery = [
  check("page")
    .optional({
      values: "falsy"
    })
    .isInt()
    .withMessage("Page must be an integer")
    .custom((value) => {
      if (value < 1 || value > 10) {
        return false
      }
      return true
    })
    .withMessage("Page must be between 1 and 10"),
  check("size")
    .optional({
      values: "falsy"
    })
    .isInt()
    .withMessage("Size must be an integer")
    .custom((value) => {
      if (value < 1 || value > 20) {
        return false
      }
      return true
    })
    .withMessage("Size must be between 1 and 20"),
  check(["minLat", "maxLat"])
    .optional({
      values: "falsy"
    })
    .isNumeric()
    .withMessage("Latitude must be a number"),
  check(["minLat", "maxLat"])
    .optional({
      values: "falsy"
    })
    .custom((value) => {
      if (value <= 90 && value >= -90) {
        return true
      }
      return false
    })
    .withMessage("Please provide a latitude no greater than 90 and no less than -90"),
  check("maxLat")
    .optional({
      values: "falsy"
    })
    .custom((value, {req}) => {
      if (req.query.minLat && +req.query.minLat > +value) {
        return false
      }
      return true
    })
    .withMessage("minLat must be less than or equal to maxLat"),
  check(["minLng", "maxLng"])
    .optional({
      values: "falsy"
    })
    .isNumeric()
    .withMessage("Longitude must be a number"),
  check(["minLng", "maxLng"])
    .optional({
      values: "falsy"
    })
    .custom((value) => {
      if (value <= 180 && value >= -180) {
        return true
      }
      return false
    })
    .withMessage("Please provide a longitude no greater than 180 and no less than -180"),
  check("maxLng")
    .optional({
      values: "falsy"
    })
    .custom((value, {req}) => {
      if (req.query.minLng && +req.query.minLng > +value) {
        return false
      }
      return true
    })
    .withMessage("minLng must be less than or equal to maxLng"),
  check(["minPrice", "maxPrice"])
    .optional({
      values: "falsy"
    })
    .isNumeric()
    .withMessage("Price must be a number"),
  check(["minPrice", "maxPrice"])
    .optional({
      values: "falsy"
    })
    .custom((value) => {
      if (value >= 0) {
        return true
      }
      return false
    })
    .withMessage("Please provide a price greater than or equal to 0"),
  check("maxPrice")
    .optional({
      values: "falsy"
    })
    .custom((value, {req}) => {
      if (req.query.minPrice && +req.query.minPrice > +value) {
        return false
      }
      return true
    })
    .withMessage("minPrice must be less than or equal to maxPrice"),
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
    .custom((value) => {
      if (value !== +value) {
        return false;
      }
      return true
    })
    .withMessage("Price must be a number"),
  check('price')
    .custom((value) => {
      if (value > 0) {
        return true
      }
      return false
    })
    .withMessage("Please provide a price greater than 0"),
  handleValidationErrors
];

// get all spots
router.get("/", validateSpotQuery, async (req, res) => {
  let {page, size, maxLat, minLat, maxLng, minLng, maxPrice, minPrice} = req.query
  page = +page || 1;
  size = +size || 20;
  maxLat = +maxLat || 90;
  minLat = +minLat || -90;
  maxLng = +maxLng || 180;
  minLng = +minLng || -180;
  minPrice = +minPrice || 0;
  const where = {
    lat: {
      [Op.lte]: maxLat,
      [Op.gte]: minLat
    },
    lng: {
      [Op.lte]: maxLng,
      [Op.gte]: minLng
    },
    price: {
      [Op.gte]: minPrice
    }
  };

  if (maxPrice) {
    where.price[Op.lte] = +maxPrice
  }

  let spots = await Spot.findAll({
    where,
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
    ],
    limit: size,
    offset: size * (page - 1)
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
  res.json({Spots: spots, page, size});
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

// get bookings for a spot based on spot id
router.get("/:spotId/bookings", requireAuth, async (req, res, next) => {
  const {spotId} = req.params;
  const userId = req.user.id;
  const spot = await Spot.findByPk(spotId, {
    include: [
      {
        model: Booking,
        include: {
          model: User,
          attributes: ["id", "firstName", "lastName"]
        }
      }
    ]
  });
  if (!spot) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Spot couldn't be found";
    return next(error);
  }
  if (spot.ownerId !== userId) {
    let bookings = spot.Bookings.map(booking => {
      return {
        spotId,
        startDate: booking.startDate,
        endDate: booking.endDate
      }
    })
    return res.json({Bookings: bookings});
  } else {
    return res.json({Bookings: spot.Bookings});
  }
})

// create a booking for a spot based on spot id
router.post("/:spotId/bookings", requireAuth, validateBookingInfo, async (req, res, next) => {
  const {spotId} = req.params;
  const userId = req.user.id;
  const spot = await Spot.findByPk(spotId, {
    include: Booking
  });
  if (!spot) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Spot couldn't be found";
    return next(error);
  }
  if (spot.ownerId === userId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot create a booking for the spot that belongs to the current user";
    return next(error);
  }
  const {startDate, endDate} = req.body;
  const bookings = spot.Bookings;
  if (bookings.length) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Sorry, this spot is already booked for the specified dates"
    error.errors = {};
    bookings.forEach(booking => {
      if (new Date(startDate) >= new Date(booking.startDate) && new Date(startDate) < new Date(booking.endDate)) {
        error.errors.startDate = "Start date conflicts with an existing booking"
      }
      if (new Date(endDate) > new Date(booking.startDate) && new Date(endDate) <= new Date(booking.endDate)) {
        error.errors.endDate = "End date conflicts with an existing booking"
      }
      if (new Date(startDate) < new Date(booking.startDate) && new Date(endDate) > new Date(booking.endDate)) {
        error.errors.bothDates = "Both start and end dates conflict with an existing booking"
      }
    });
    if (Object.keys(error.errors).length) {
      return next(error);
    }
  }
  const newBooking = await spot.createBooking({userId, startDate, endDate});
  res.json(newBooking);
})

module.exports = router;
