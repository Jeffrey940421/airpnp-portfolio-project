const express = require('express');
const { requireAuth, spotExist, spotAuthorization, spotReviewAuthorization, spotBookingAuthorization, duplicateReview } = require('../../utils/auth');
const { Spot, Review, SpotImage, User, ReviewImage, Booking, Sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();
const { Op } = require("sequelize");
const fs = require("fs");
const { multipleFilesUpload, multipleMulterUpload, retrievePrivateFile, singleMulterUpload, singleFileUpload } = require("../../awsS3");

const geolocation = JSON.parse(fs.readFileSync(require.resolve("../../utils/geolocation.json")).toString());
const timeOffset = new Date().getTimezoneOffset();
const schema = process.env.NODE_ENV === 'production' ? `${process.env.SCHEMA}.` : ""

const validateBookingInfo = [
  check("startDate")
    .exists({ checkNull: true })
    .isDate({
      format: "YYYY-MM-DD",
      delimiters: ["-"]
    })
    .withMessage("Start date must be a date in YYYY-MM-DD format"),
  check("startDate")
    .custom((value) => {
      if (new Date(value).getTime() < new Date().setHours(0, -timeOffset, 0, 0)) {
        return false
      }
      return true
    })
    .withMessage("Start date must be after today's date"),
  check("endDate")
    .exists({ checkNull: true })
    .isDate({
      format: "YYYY-MM-DD",
      delimiters: ["-"]
    })
    .withMessage("End date must be a date in YYYY-MM-DD format"),
  check("endDate")
    .custom((value, { req }) => {
      if (new Date(value).getTime() <= new Date(req.body.startDate).getTime()) {
        return false
      }
      return true
    })
    .withMessage("End date must be after start date"),
  handleValidationErrors
]

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

const validateSpotImageInfo = [
  check('preview')
    .optional({
      values: "undefined"
    })
    .custom((value) => {
      if (Number.isInteger(+value) && +value >= 0) {
        return true;
      }
      return false;
    })
    .withMessage("Preview image index must be an integer no less than 0"),
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
    .custom((value, { req }) => {
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
    .custom((value, { req }) => {
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
    .custom((value, { req }) => {
      if (req.query.minPrice && +req.query.minPrice > +value) {
        return false
      }
      return true
    })
    .withMessage("minPrice must be less than or equal to maxPrice"),
  check("city")
    .optional({
      values: "falsy"
    })
    .isLength({ min: 1, max: 70 })
    .withMessage('Please provide a city with at least 1 character and no more than 70 characters'),
  check("city")
    .optional({
      values: "falsy"
    })
    .if((value) => value)
    .custom((value, { req }) => {
      return req.query.country && req.query.state
    })
    .withMessage('Please provide state and country to validate city'),
  check("city")
    .optional({
      values: "falsy"
    })
    .if((value, { req }) => {
      return geolocation[req.query.country] && geolocation[req.query.country][req.query.state]
    })
    .custom((value, { req }) => {
      if (!geolocation[req.query.country][req.query.state].find(city => city === value)) {
        return false;
      }
      return true;
    })
    .withMessage('Please provide a valid city'),
  check("state")
    .optional({
      values: "falsy"
    })
    .isLength({ min: 2, max: 70 })
    .withMessage('Please provide a state with at least 2 characters and no more than 70 characters'),
  check("state")
    .optional({
      values: "falsy"
    })
    .if((value) => value)
    .custom((value, { req }) => {
      return req.query.country
    })
    .withMessage('Please provide country to validate city'),
  check("state")
    .optional({
      values: "falsy"
    })
    .if((value, { req }) => {
      return geolocation[req.query.country]
    })
    .custom((value, { req }) => {
      if (!geolocation[req.query.country][req.query.state]) {
        return false;
      }
      return true;
    })
    .withMessage('Please provide a valid state. City is not validated with invalid state'),
  check("country")
    .optional({
      values: "falsy"
    })
    .isLength({ min: 4, max: 50 })
    .withMessage('Please provide a state with at least 4 characters and no more than 50 characters'),
  check("country")
    .optional({
      values: "falsy"
    })
    .isIn(Object.keys(geolocation))
    .withMessage("Please provide a valid country. State and city are not validated with invalid country"),
  check("start")
    .custom((value, { req }) => {
      if (req.query.end && !req.query.start) {
        return false;
      }
      return true;
    })
    .withMessage("Please provide a start date"),
  check("start")
    .optional({
      values: "falsy"
    })
    .isDate({
      format: "YYYY-MM-DD",
      delimiters: ["-"]
    })
    .withMessage("Start date must be a date in YYYY-MM-DD format"),
  check("start")
    .optional({
      values: "falsy"
    })
    .custom((value) => {
      if (new Date(value).getTime() < new Date().setHours(0, -timeOffset, 0, 0)) {
        return false
      }
      return true
    })
    .withMessage("Start date must be after today's date"),
  check("end")
    .optional({
      values: "falsy"
    })
    .isDate({
      format: "YYYY-MM-DD",
      delimiters: ["-"]
    })
    .withMessage("End date must be a date in YYYY-MM-DD format"),
  check("end")
    .optional({
      values: "falsy"
    })
    .custom((value, { req }) => {
      if (new Date(value).getTime() <= new Date(req.query.start).getTime()) {
        return false
      }
      return true
    })
    .withMessage("End date must be after start date"),
  check("end")
    .custom((value, { req }) => {
      if (req.query.start && !req.query.end) {
        return false;
      }
      return true;
    })
    .withMessage("Please provide an end date"),
  check("sort")
    .optional({
      values: "falsy"
    })
    .isIn(["avgRating", "price", "popularity", "numReviews"])
    .withMessage("Sort must be avgRating, price, popularity, or numReviews"),
  check("order")
    .optional({
      values: "falsy"
    })
    .isIn(["ASC NULLS FIRST", "DESC NULLS LAST"])
    .withMessage("Order must be ASC NULLS FIRST or DESC NULLS LAST"),
  check("language")
    .optional({
      values: "falsy"
    })
    .isIn([
      "simple",
      "arabic",
      "armenian",
      "basque",
      "catalan",
      "danish",
      "dutch",
      "english",
      "finnish",
      "french",
      "german",
      "greek",
      "hindi",
      "hungarian",
      "indonesian",
      "irish",
      "italian",
      "lithuanian",
      "nepali",
      "norwegian",
      "portuguese",
      "romanian",
      "russian",
      "serbian",
      "spanish",
      "swedish",
      "tamil",
      "turkish",
      "yiddish"
    ])
    .withMessage("Please provide a valid language"),
  check("language")
    .custom((value, { req }) => {
      if (req.query.keyword && !req.query.language) {
        return false;
      }
      return true;
    })
    .withMessage("Please provide a valid language"),
  handleValidationErrors
]

const validateSpotInfo = [
  check('address')
    .exists({ checkFalsy: true })
    .isLength({ min: 1, max: 255 })
    .withMessage('Please provide an address with at least 1 character and no more than 255 characters'),
  check('city')
    .exists({ checkFalsy: true })
    .isLength({ min: 1, max: 70 })
    .withMessage('Please provide a city with at least 1 character and no more than 70 characters'),
  check('city')
    .if((value, { req }) => {
      return geolocation[req.body.country] && geolocation[req.body.country][req.body.state]
    })
    .custom((value, { req }) => {
      if (!geolocation[req.body.country][req.body.state].find(city => city === value)) {
        return false;
      }
      return true;
    })
    .withMessage('Please provide a valid city'),
  check('state')
    .exists({ checkFalsy: true })
    .isLength({ min: 2, max: 70 })
    .withMessage('Please provide a state with at least 2 characters and no more than 70 characters'),
  check('state')
    .if((value, { req }) => {
      return geolocation[req.body.country]
    })
    .custom((value, { req }) => {
      if (!geolocation[req.body.country][req.body.state]) {
        return false;
      }
      return true;
    })
    .withMessage('Please provide a valid state. City is not validated with invalid state'),
  check('country')
    .exists({ checkFalsy: true })
    .isLength({ min: 4, max: 50 })
    .withMessage('Please provide a state with at least 4 characters and no more than 50 characters'),
  check('country')
    .isIn(Object.keys(geolocation))
    .withMessage("Please provide a valid country. State and city are not validated with invalid country"),
  check('lat')
    .exists({ checkFalsy: true })
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
    .withMessage("Please provide a latitude expressed to 7 decimal places"),
  check('lng')
    .exists({ checkFalsy: true })
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
    .withMessage("Please provide a longitude expressed to 7 decimal places"),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ min: 1, max: 50 })
    .withMessage("Please provide a name with at least 1 characters and no more than 50 characters"),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check('price')
    .exists({ checkFalsy: true })
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
  check('price')
    .custom((value) => {
      if (+value.toFixed(2) !== value) {
        return false
      }
      return true
    })
    .withMessage("Please provide a price expressed to 2 decimal places"),
  handleValidationErrors
];

// get all spots
router.get("/", validateSpotQuery, async (req, res) => {
  let { page, size, maxLat, minLat, maxLng, minLng, maxPrice, minPrice, country, state, city, keyword, language, sort, order, start, end } = req.query
  page = +page || 1;
  size = +size || 4;
  maxLat = +maxLat || 90;
  minLat = +minLat || -90;
  maxLng = +maxLng || 180;
  minLng = +minLng || -180;
  minPrice = +minPrice || 0;
  const where = {
    [Op.and]: [
      {
        lat: {
          [Op.lte]: maxLat,
          [Op.gte]: minLat
        }
      },
      {
        lng: {
          [Op.lte]: maxLng,
          [Op.gte]: minLng
        }
      },
      {
        price: {
          [Op.gte]: minPrice
        }
      }
    ]
  };

  if (maxPrice) {
    where[Op.and].push({ price: { [Op.lte]: +maxPrice } })
  }

  if (country) {
    where[Op.and].push({ country: country });
  }

  if (state) {
    where[Op.and].push({ state: state });
  }

  if (city) {
    where[Op.and].push({ city: city });
  }

  if (start && end) {
    where[Op.and].push(Sequelize.literal(`
      NOT EXISTS (
        SELECT *
        FROM ${schema}"Bookings"
        WHERE ${schema}"Bookings"."spotId" = "Spot"."id"
        AND (
          (${schema}"Bookings"."endDate" BETWEEN '${start}' AND '${end}')
          OR
          (${schema}"Bookings"."startDate" BETWEEN '${start}' AND '${end}')
          OR
          (${schema}"Bookings"."startDate" < '${start}' AND ${schema}"Bookings"."endDate" > '${end}')
        )
      )
    `))
  }

  if (keyword) {
    where[Op.and].push({
      [Op.or]: [
        Sequelize.literal(`
          to_tsvector('${language}', "Spot"."description") @@ to_tsquery('${language}', '${keyword}')
        `),
        Sequelize.literal(`
          to_tsvector('${language}', "Spot"."name") @@ to_tsquery('${language}', '${keyword}')
        `)
      ]
    })
  }

  let spots = await Spot.findAll({
    attributes: {
      include: [
        [
          Sequelize.literal(`
            ROUND(
              NULLIF(
                COALESCE(
                  (
                    SELECT AVG(${schema}"Reviews"."stars")
                    FROM ${schema}"Reviews"
                    WHERE ${schema}"Reviews"."spotId" = "Spot"."id"
                  ),
                  NULL
                ),
                0
              ),
              2
            )
          `),
          "avgRating"
        ],
        [
          Sequelize.literal(`
            (
              SELECT COUNT(${schema}"Reviews"."id")
              FROM ${schema}"Reviews"
              WHERE ${schema}"Reviews"."spotId" = "Spot"."id"
            )
          `),
          "numReviews"
        ],
        [
          Sequelize.literal(`
            (
              SELECT COUNT(*)
              FROM ${schema}"Bookings"
              WHERE
                ${schema}"Bookings"."spotId" = "Spot"."id" AND
                ${schema}"Bookings"."createdAt" >= ${process.env.NODE_ENV === 'production' ? "CURRENT_DATE - INTERVAL '30 days'" : "datetime('now', '-30 days')"}
            )
          `),
          "popularity"
        ]
      ]
    },
    where,
    include: [
      {
        model: Review,
        attributes: []
      },
      {
        model: SpotImage,
        where: {
          preview: true
        },
        required: false
      }
    ],
    order: [
      [Sequelize.literal(sort ? `"${sort}"` : '"id"'), order || "ASC NULLS FIRST"]
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
    delete spot.SpotImages;
    return spot;
  });
  res.json({ Spots: spots, page, size });
});

// get all spots owned by the current user
router.get("/current", requireAuth, async (req, res) => {
  const ownerId = req.user.id;
  let spots = await Spot.findAll({
    where: { ownerId },
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
  res.json({ Spots: spots });
})

// get details of a spot from an id
router.get("/:spotId", spotExist, async (req, res, next) => {
  let spot = req.spot;
  const numReviews = spot.Reviews.length;
  let avgRating
  if (numReviews) {
    avgRating = +(spot.Reviews.reduce((sum, review) => sum += review.stars, 0) / numReviews).toFixed(2);
  } else {
    avgRating = null;
  }
  spot = spot.toJSON();
  delete spot.Reviews;
  delete spot.Bookings;
  spot.numReviews = numReviews;
  spot.avgRating = avgRating;
  res.json(spot)
});

// create a spot
router.post("/", requireAuth, validateSpotInfo, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const ownerId = req.user.id;
  const newSpot = await Spot.create({ ownerId, address, city, state, country, lat, lng, name, description, price });
  res.status(201);
  res.json(newSpot);
});

// add spot images based on spot id
router.post("/:spotId/images", multipleMulterUpload("images"), requireAuth, spotExist, spotAuthorization, validateSpotImageInfo, async (req, res, next) => {
  const err = Error("Bad request.");
  err.status = 400;
  err.errors = {}
  err.title = "Bad Request";
  if (!req.files.length) {
    err.errors.images = "Please provide spot images";
    return next(err);
  } else if (req.files.find(file => !file.mimetype.startsWith("image"))) {
    err.errors.images = "Please upload images only";
    return next(err);
  }
  const spot = req.spot;
  const { spotId } = req.params;
  const urls = req.files ?
    await multipleFilesUpload({ files: req.files, public: true }) :
    null;
  const { preview } = req.body;
  const images = urls.map((url, i) => {
    return { spotId, url, preview: preview ? i === +preview : false }
  })
  if (preview) {
    const previewImage = spot.SpotImages.find(spotImage => spotImage.preview === true)
    if (previewImage) {
      previewImage.preview = false;
      await previewImage.save();
    }
  }
  const newSpotImages = await Promise.all(
    images.map(image => SpotImage.create(image))
  )
  res.json(newSpotImages)
})

// edit a spot
router.put("/:spotId", requireAuth, spotExist, spotAuthorization, validateSpotInfo, async (req, res, next) => {
  const spot = req.spot;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  let updatedSpot = await spot.update({ address, city, state, country, lat, lng, name, description, price });
  updatedSpot = updatedSpot.toJSON();
  delete updatedSpot.Reviews;
  delete updatedSpot.SpotImages;
  delete updatedSpot.Owner;
  delete updatedSpot.Bookings;
  res.json(updatedSpot);
})

// delete spot
router.delete("/:spotId", requireAuth, spotExist, spotAuthorization, async (req, res, next) => {
  const spot = req.spot;
  await spot.destroy();
  res.json({
    message: "Successfully deleted"
  });
})

// get reviews by spot id
router.get("/:spotId/reviews", spotExist, async (req, res, next) => {
  const spot = req.spot;
  res.json({ Reviews: spot.Reviews });
})

// create a review for a spot based on spot id
router.post("/:spotId/reviews", requireAuth, spotExist, spotReviewAuthorization, duplicateReview, validateReviewInfo, async (req, res, next) => {
  const spot = req.spot;
  const userId = req.user.id;
  const { review, stars } = req.body;
  const newReview = await spot.createReview({ userId, review, stars });
  res.status(201);
  res.json(newReview);
})

// get bookings for a spot based on spot id
router.get("/:spotId/bookings", requireAuth, spotExist, async (req, res, next) => {
  const spot = req.spot;
  const { spotId } = req.params;
  const userId = req.user.id;
  if (spot.ownerId !== userId) {
    let bookings = spot.Bookings.map(booking => {
      return {
        id: booking.id,
        spotId,
        startDate: booking.startDate,
        endDate: booking.endDate
      }
    })
    return res.json({ Bookings: bookings });
  } else {
    return res.json({ Bookings: spot.Bookings });
  }
})

// create a booking for a spot based on spot id
router.post("/:spotId/bookings", requireAuth, spotExist, spotBookingAuthorization, validateBookingInfo, async (req, res, next) => {
  const spot = req.spot;
  const userId = req.user.id;
  const { startDate, endDate } = req.body;
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
        error.errors.eitherDate = "Either start date or end date conflicts with an existing booking"
      }
    });
    if (Object.keys(error.errors).length) {
      return next(error);
    }
  }
  const newBooking = await spot.createBooking({ userId, startDate, endDate });
  res.json(newBooking);
})

module.exports = router;
