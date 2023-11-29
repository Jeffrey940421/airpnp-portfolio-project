import { csrfFetch } from "./csrf";

const SET_USER = "session/SET_USER";
const REMOVE_USER = "session/REMOVE_USER";
const GET_CURRENT_SPOTS = "session/GET_CURRENT_SPOTS";
const DELETE_CURRENT_SPOTS = "session/DELETE_CURRENT_SPOTS";
const GET_CURRENT_REVIEWS = "session/GET_CURRENT_REVIEWS";
const REMOVE_CURRENT_REVIEW = "session/REMOVE_CURRENT_REVIEW";
const EDIT_CURRENT_REVIEW = "session/EDIT_CURRENT_REVIEW";
const ADD_REVIEW_IMAGES = "session/ADD_REVIEW_IMAGES";
const DELETE_REVIEW_IMAGES = "session/DELETE_REVIEW_IMAGES";
const GET_CURRENT_BOOKINGS = "session/GET_CURRENT_BOOKINGS";
const REMOVE_CURRENT_BOOKING = "session/REMOVE_CURRENT_BOOKING";
const EDIT_CURRENT_BOOKING = "session/EDIT_CURRENT_BOOKING";
const GET_CURRENT_RESERVATIONS = "session/GET_CURRENT_RESERVATIONS";
const REMOVE_CURRENT_RESERVATION = "session/REMOVE_CURRENT_RESERVATION";

const setUser = (user) => {
  return {
    type: SET_USER,
    user,
  };
};

const removeUser = () => {
  return {
    type: REMOVE_USER,
  };
};

const getSpots = (spots) => {
  return {
    type: GET_CURRENT_SPOTS,
    spots
  }
};

const deleteSpots = (spotId) => {
  return {
    type: DELETE_CURRENT_SPOTS,
    spotId
  }
}

const getReviews = (reviews) => {
  return {
    type: GET_CURRENT_REVIEWS,
    reviews
  }
}

const removeReview = (reviewId) => {
  return {
    type: REMOVE_CURRENT_REVIEW,
    reviewId
  }
}

const editReview = (review) => {
  return {
    type: EDIT_CURRENT_REVIEW,
    review
  }
}

const addImages = (reviewId, images) => {
  return {
    type: ADD_REVIEW_IMAGES,
    reviewId,
    images
  }
}

const deleteImages = (reviewId, imageIds) => {
  return {
    type: DELETE_REVIEW_IMAGES,
    reviewId,
    imageIds
  }
}

const getBookings = (bookings) => {
  return {
    type: GET_CURRENT_BOOKINGS,
    bookings
  }
}

const removeBooking = (bookingId) => {
  return {
    type: REMOVE_CURRENT_BOOKING,
    bookingId
  }
}

const editBooking = (booking) => {
  return {
    type: EDIT_CURRENT_BOOKING,
    booking
  }
}

const getReservations = (reservations) => {
  return {
    type: GET_CURRENT_RESERVATIONS,
    reservations
  }
}

const removeReservation = (reservationId) => {
  return {
    type: REMOVE_CURRENT_RESERVATION,
    reservationId
  }
}

export const login = (user) => async (dispatch) => {
  const response = await csrfFetch("/api/session", {
    method: "POST",
    body: JSON.stringify(user),
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const signup = (user) => async (dispatch) => {
  const response = await csrfFetch("/api/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
}

export const logout = () => async (dispatch) => {
  const response = await csrfFetch('/api/session', {
    method: 'DELETE',
  });
  dispatch(removeUser());
  return response;
};

export const restoreUser = () => async (dispatch) => {
  const response = await csrfFetch("/api/session");
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const listSpots = () => async (dispatch) => {
  const response = await csrfFetch("/api/spots/current");
  const data = await response.json();
  dispatch(getSpots(data.Spots));
  return response;
}

export const removeSpot = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`, {
    method: 'DELETE'
  });
  if (response.ok) {
    dispatch(deleteSpots(spotId));
  } else {
    return response;
  }
}

export const listReviews = () => async (dispatch) => {
  const response = await csrfFetch("/api/reviews/current");
  const data = await response.json();
  dispatch(getReviews(data.Reviews));
  return response;
}

export const deleteReview = (reviewId) => async (dispatch) => {
  const response = await csrfFetch(`/api/reviews/${reviewId}`, {
    method: "DELETE"
  });
  if (response.ok) {
    dispatch(removeReview(reviewId));
  } else {
    return response;
  }
}

export const updateReview = (reviewId, review) => async (dispatch) => {
  const response = await csrfFetch(`/api/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(review)
  });
  const data = await response.json();
  dispatch(editReview(data));
  return response
}

export const addReviewImages = (reviewId, images) => async (dispatch) => {
  const formData = new FormData();
  Array.from(images).forEach(image => formData.append("images", image));
  const response = await csrfFetch(`/api/reviews/${reviewId}/images`, {
    method: "POST",
    body: formData
  });
  const data = await response.json();
  dispatch(addImages(reviewId, data));
  return response;
}

export const removeReviewImages = (reviewId, imageIds) => async (dispatch) => {
  const response = await Promise.all(imageIds.map(async (id) => {
    const response = await csrfFetch(`/api/review-images/${id}`, {
      method: "DELETE"
    });
    return await response.json();
  }));
  dispatch(deleteImages(reviewId, imageIds));
  return response;
}

export const listBookings = () => async (dispatch) => {
  const response = await csrfFetch("/api/bookings/current");
  const data = await response.json();
  dispatch(getBookings(data.Bookings));
  return response;
}

export const deleteBooking = (bookingId) => async (dispatch) => {
  const response = await csrfFetch(`/api/bookings/${bookingId}`, {
    method: "DELETE"
  });
  if (response.ok) {
    dispatch(removeBooking(bookingId));
  } else {
    return response;
  }
}

export const updateBooking = (bookingId, booking) => async (dispatch) => {
  const response = await csrfFetch(`/api/bookings/${bookingId}`, {
    method: "PUT",
    body: JSON.stringify(booking)
  });
  const data = await response.json();
  dispatch(editBooking(data));
  return response;
}

export const listReservations = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/bookings`);
  const data = await response.json();
  dispatch(getReservations(data.Bookings));
  return response;
}

export const deleteReservation = (reservationId) => async (dispatch) => {
  const response = await csrfFetch(`/api/bookings/${reservationId}`, {
    method: "DELETE"
  });
  if (response.ok) {
    dispatch(removeReservation(reservationId));
  } else {
    return response;
  }
}

const initialState = { user: null, spots: {}, reviews: {}, bookings: {}, reservations: {} };

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.user }
    case REMOVE_USER:
      return { ...state, user: null, spots: {}, reviews: {} }
    case GET_CURRENT_SPOTS:
      const spots = {};
      action.spots.forEach(spot => spots[spot.id] = spot);
      return { ...state, spots: spots }
    case DELETE_CURRENT_SPOTS:
      const existingSpots = { ...state.spots };
      delete existingSpots[action.spotId];
      return { ...state, spots: existingSpots }
    case GET_CURRENT_REVIEWS:
      const reviews = {};
      action.reviews.forEach(review => reviews[review.id] = review);
      return { ...state, reviews }
    case REMOVE_CURRENT_REVIEW:
      const newReviews = { ...state.reviews };
      delete newReviews[action.reviewId];
      return { ...state, reviews: newReviews };
    case EDIT_CURRENT_REVIEW:
      return { ...state, reviews: { ...state.reviews, [action.review.id]: { ...state.reviews[action.review.id], ...action.review } } }
    case ADD_REVIEW_IMAGES:
      return { ...state, reviews: { ...state.reviews, [action.reviewId]: { ...state.reviews[action.reviewId], ReviewImages: [...state.reviews[action.reviewId].ReviewImages, ...action.images] } } }
    case DELETE_REVIEW_IMAGES:
      let reviewImages = [...state.reviews[action.reviewId].ReviewImages];
      reviewImages = reviewImages.filter(image => !action.imageIds.includes(image.id));
      return { ...state, reviews: { ...state.reviews, [action.reviewId]: { ...state.reviews[action.reviewId], ReviewImages: reviewImages } } }
    case GET_CURRENT_BOOKINGS:
      const bookings = {};
      action.bookings.forEach(booking => bookings[booking.id] = booking);
      return { ...state, bookings }
    case REMOVE_CURRENT_BOOKING:
      const newBookings = { ...state.bookings };
      delete newBookings[action.bookingId];
      return { ...state, bookings: newBookings };
    case EDIT_CURRENT_BOOKING:
      return { ...state, bookings: { ...state.bookings, [action.booking.id]: { ...state.bookings[action.booking.id], ...action.booking } } }
    case GET_CURRENT_RESERVATIONS:
      const reservations = {};
      action.reservations.forEach(reservation => reservations[reservation.id] = reservation);
      return { ...state, reservations }
    case REMOVE_CURRENT_RESERVATION:
      const newReservations = { ...state.reservations };
      delete newReservations[action.reservationId];
      return { ...state, reservations: newReservations };
    default:
      return state;
  }
};

export default sessionReducer;
