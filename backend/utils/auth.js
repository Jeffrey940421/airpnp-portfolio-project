const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { Spot, Review, SpotImage, User, ReviewImage, Booking } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

//generate a JWT token and save it in the cookie when the user is logged in or signed in
const setTokenCookie = (res, user) => {
  // Create the token.
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };
  const token = jwt.sign(
    {data: safeUser},
    secret,
    {expiresIn: parseInt(expiresIn)}
  );

  const isProduction = process.env.NODE_ENV === "production";

  // Set the token cookie
  res.cookie('token', token, {
    maxAge: expiresIn * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction && "Lax"
  });

  return token;
};

// verify the identity of user using the JWT token stored in the cookie
// if the token is valid and the user is found in the database, store the user information in the req object
const restoreUser = (req, res, next) => {
  // token parsed from cookies
  const {token} = req.cookies;
  req.user = null;

  return jwt.verify(token, secret, null, async (error, jwtPayload) => {
    if (error) {
      return next();
    }

    try {
      const {id} = jwtPayload.data;
      req.user = await User.findByPk(id, {
        attributes: {
          include: ['email', 'createdAt', 'updatedAt']
        }
      });
    } catch (err) {
      res.clearCookie('token');
      return next();
    }

    if (!req.user) res.clearCookie('token');

    return next();
  });
};


// disallow the user to accessing a route if the user information is not stored in the req object
// which means that the user identity is not verified
const requireAuth = function (req, res, next) {
  if (req.user) {
    return next();
  }

  const err = new Error('Authentication required');
  err.title = 'Authentication required';
  err.errors = {message: 'Authentication required'};
  err.status = 401;
  return next(err);
}

// check if the spot exists and return 404 error if not
const spotExist = async function (req, res, next) {
  const {spotId} = req.params;
  const spot = await Spot.findByPk(spotId, {
    include: [
      {
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
      },
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
  req.spot = spot;
  return next();
}

// check if the user has the authorization (user must be the owner) to edit the spot and return 403 if not
const spotAuthorization = async function (req, res, next) {
  const spot = req.spot;
  const ownerId = req.user.id;
  if (spot.ownerId !== ownerId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit or delete the spot that does not belong to the current user";
    return next(error);
  }
  return next();
}

// check if the user has the authorization (user must not be the owner) to edit the spot and return 403 if not
const spotReviewAuthorization = async function (req, res, next) {
  const spot = req.spot;
  const userId = req.user.id;
  if (spot.ownerId == userId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot create a review for the spot that belongs to the current user";
    return next(error);
  }
  return next();
}

// check if the user has the authorization (user must not be the owner) to create the booking and return 403 if not
const spotBookingAuthorization = async function (req, res, next) {
  const spot = req.spot;
  const userId = req.user.id;
  if (spot.ownerId == userId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot create a booking for the spot that belongs to the current user";
    return next(error);
  }
  return next();
}

// check if the user already has a review for the spot and return 500 if does
const duplicateReview = async function (req, res, next) {
  const spot = req.spot;
  const userId = req.user.id;
  if (spot.Reviews.find(review => review.userId === userId)) {
    const error = {};
    error.title = "Internal Server Error";
    error.status = 500;
    error.message = "User already has a review for this spot";
    return next(error);
  }
  return next();
}

// check if the review exists and return 404 if not
const reviewExist = async function (req, res, next) {
  const {reviewId} = req.params;
  const review = await Review.findByPk(reviewId, {
    include: ReviewImage
  });
  if (!review) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Review couldn't be found";
    return next(error);
  }
  req.review = review;
  return next();
}

const reviewAuthorization = async function (req, res, next) {
  const review = req.review;
  const userId = req.user.id;
  if (review.userId !== userId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit or delete the review that does not belong to the current user";
    return next(error);
  }
  return next();
}

const reviewLimit = async function (req, res, next) {
  const review = req.review;
  const error = {};
  error.title = "Forbidden";
  error.status = 403;
  if (review.ReviewImages.length >= 10) {
    error.message = "Maximum number of images for this review was reached";
    return next(error);
  } else if (review.ReviewImages.length + req.files.length > 10) {
    error.message = "Maximum of 10 images are allowed for each review";
    return next(error);
  }
  return next();
}

const bookingExist = async function (req, res, next) {
  const {bookingId} = req.params;
  const booking = await Booking.findByPk(bookingId, {
    include: {
      model: Spot,
      include: Booking
    }
  });
  if (!booking) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Booking couldn't be found";
    return next(error);
  }
  req.booking = booking;
  return next();
}

const bookingAuthorization = async function (req, res, next) {
  const booking = req.booking;
  const userId = req.user.id;
  if (booking.userId !== userId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit a booking that does not belong to the current user";
    return next(error);
  }
  return next();
}

const bookingDeleteAuthorization = async function (req, res, next) {
  const booking = req.booking;
  const userId = req.user.id;
  const startDate = booking.startDate;
  const error = {};
  error.title = "Forbidden";
  error.status = 403;
  if (booking.userId !== userId && booking.Spot.ownerId !== userId) {
    error.message = "Cannot delete a booking that does not belong to the current user or is not associated with a spot the current user owns";
    return next(error);
  }
  if (new Date(startDate).getTime() <= new Date().setHours(-7, 0, 0, 0)) {
    error.message = "Cannot delete an ongoing or completed booking";
    return next(error);
  }
  return next();
}

const pastBooking = async function (req, res, next) {
  const booking = req.booking;
  const originalStartDate = booking.startDate;
  const originalEndDate = booking.endDate;
  let {startDate} = req.body;
  const error = {};
  error.title = "Forbidden";
  error.status = 403;
  if (new Date(originalStartDate).getTime() < new Date().setHours(-7, 0, 0, 0) && startDate && startDate !== originalStartDate) {
    error.message = "Cannot edit a past start date. Only end date can be edited";
    return next(error);
  }
  if (new Date(originalEndDate).getTime() < new Date().setHours(-7, 0, 0, 0)) {
    error.message = "Cannot edit a past booking";
    return next(error);
  }
  return next();
}

const spotImageExist = async function (req, res, next) {
  const {imageId} = req.params;

  const spotImage = await SpotImage.findByPk(imageId, {
    include: {
      model: Spot,
      include: {
        model: SpotImage,
        order: [['id']]
      }
    }
  })
  if (!spotImage) {
    const error = {};
    error.title = "Not Found";
    error.status = 404;
    error.message = "Spot image couldn't be found";
    return next(error);
  }
  req.spotImage = spotImage;
  return next();
}

const spotImageAuthorization = async function (req, res, next) {
  const ownerId = req.user.id;
  const spotImage = req.spotImage;
  if (spotImage.Spot.ownerId !== ownerId) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Cannot edit the spot that does not belong to the current user";
    return next(error);
  }
  return next();
}

module.exports = {
  setTokenCookie,
  restoreUser,
  requireAuth,
  spotExist,
  spotAuthorization,
  spotReviewAuthorization,
  spotBookingAuthorization,
  duplicateReview,
  reviewExist,
  reviewAuthorization,
  reviewLimit,
  bookingExist,
  bookingAuthorization,
  bookingDeleteAuthorization,
  pastBooking,
  spotImageExist,
  spotImageAuthorization
};
