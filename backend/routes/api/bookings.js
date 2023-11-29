const express = require('express');
const { requireAuth, bookingExist, bookingAuthorization, pastBooking, bookingDeleteAuthorization } = require('../../utils/auth');
const { Spot, Review, ReviewImage, SpotImage, User, Booking } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

const timeOffset = new Date().getTimezoneOffset();

const validateBookingInfo = [
  check("startDate")
    .exists({checkNull: true})
    .isDate({
      format: "YYYY-MM-DD",
      delimiters: ["-"]
    })
    .withMessage("Start date must be a date in YYYY-MM-DD format"),
  check("startDate")
    .custom(async (value, {req}) => {
      const {bookingId} = req.params;
      const booking = await Booking.findByPk(bookingId);
      if (booking) {
        const originalStartDate = booking.startDate;
        if (new Date(originalStartDate).getTime() >= new Date().setHours(0, -timeOffset, 0, 0) && new Date(value).getTime() < new Date().setHours(0, -timeOffset, 0, 0)) {
          return Promise.reject()
        }
      }
      return Promise.resolve()
    })
    .withMessage("Start date must be after today's date"),
  check("endDate")
    .exists({checkNull: true})
    .isDate({
      format: "YYYY-MM-DD",
      delimiters: ["-"]
    })
    .withMessage("End date must be a date in YYYY-MM-DD format"),
  check("endDate")
    .custom((value, {req}) => {
      if (new Date(value).getTime() <= new Date(req.body.startDate).getTime()) {
        return false
      }
      return true
    })
    .withMessage("End Date must be after start date"),
  check("endDate")
    .custom((value) => {
      if (new Date(value).getTime() < new Date().setHours(0, -timeOffset, 0, 0)) {
        return false
      }
      return true
    })
    .withMessage("End date must be after today's date"),
  handleValidationErrors
]

// get bookings of current user
router.get("/current", requireAuth, async (req, res, next) => {
  const userId = req.user.id;
  let bookings = await Booking.findAll({
    where: {userId},
    include: {
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
    }
  });
  bookings = bookings.map(booking => {
    booking = booking.toJSON();
    if (booking.Spot.SpotImages.length) {
      booking.Spot.previewImage = booking.Spot.SpotImages[0].url;
    } else {
      booking.Spot.previewImage = null;
    }
    delete booking.Spot.SpotImages;
    return booking;
  });
  res.json({Bookings: bookings});
})

// edit a booking
router.put("/:bookingId", requireAuth, bookingExist, bookingAuthorization, pastBooking, validateBookingInfo, async (req, res, next) => {
  const booking = req.booking
  const {bookingId} = req.params;
  let {startDate, endDate} = req.body;
  const originalStartDate = booking.startDate;
  const bookings = booking.Spot.Bookings;
  if (bookings.length) {
    const error = {};
    error.title = "Forbidden";
    error.status = 403;
    error.message = "Sorry, this spot is already booked for the specified dates"
    error.errors = {};
    bookings.forEach(booking => {
      if (booking.id !== +bookingId) {
        if (new Date(startDate) >= new Date(booking.startDate) && new Date(startDate) < new Date(booking.endDate)) {
          error.errors.startDate = "Start date conflicts with an existing booking"
        }
        if (new Date(endDate) > new Date(booking.startDate) && new Date(endDate) <= new Date(booking.endDate)) {
          error.errors.endDate = "End date conflicts with an existing booking"
        }
        if (new Date(startDate) < new Date(booking.startDate) && new Date(endDate) > new Date(booking.endDate)) {
          error.errors.eitherDate = "Either start date or end date conflicts with an existing booking"
        }
      }
    });
    if (Object.keys(error.errors).length) {
      return next(error);
    }
  }
  if (startDate === originalStartDate) {
    startDate = undefined;
  }
  let updatedBooking = await booking.update({startDate, endDate});
  updatedBooking = updatedBooking.toJSON();
  delete updatedBooking.Spot;
  res.json(updatedBooking);
})

// delete a booking
router.delete("/:bookingId", requireAuth, bookingExist, bookingDeleteAuthorization, async (req, res, next) => {
  const booking = req.booking;
  await booking.destroy();
  res.json({
    message: "Successfully deleted"
  });
})

module.exports = router;
