import { csrfFetch } from "./csrf";

const GET_REVIEWS = "reviews/GET_REVIEWS";
const ADD_REVIEW = "reviews/ADD_REVIEW";
const REMOVE_REVIEW = "reviews/REMOVE_REVIEW";

const getReviews = (spotId, reviews) => {
  return {
    type: GET_REVIEWS,
    spotId,
    reviews
  }
}

const addReview = (spotId, review, user) => {
  return {
    type: ADD_REVIEW,
    spotId,
    review,
    user
  }
}

const removeReview = (spotId, reviewId) => {
  return {
    type: REMOVE_REVIEW,
    spotId,
    reviewId
  }
}

export const loadReviews = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
  const data = await response.json();
  dispatch(getReviews(spotId, data.Reviews));
  return response;
}

export const createReview = (spotId, review, user) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
    method: "POST",
    body: JSON.stringify(review)
  });
  const data = await response.json();
  dispatch(addReview(spotId, data, user));
  return response;
}

export const deleteReview = (spotId, reviewId) => async (dispatch) => {
  const response = await csrfFetch(`/api/reviews/${reviewId}`, {
    method: "DELETE"
  });
  if (response.ok) {
    dispatch(removeReview(spotId, reviewId));
  } else {
    return response;
  }
}

const initialState = {};

const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_REVIEWS:
      const spotReviews = {};
      action.reviews.forEach(review => spotReviews[review.id] = review);
      return { ...state, [action.spotId]: spotReviews };
    case ADD_REVIEW:
      return { ...state, [action.spotId]: { ...state[action.spotId], [action.review.id]: { ...action.review, User: action.user, ReviewImages: [] } } };
    case REMOVE_REVIEW:
      const reviews = { ...state[action.spotId] };
      delete reviews[action.reviewId];
      return { ...state, [action.spotId]: reviews };
    default:
      return state;
  }
}

export default reviewsReducer;
