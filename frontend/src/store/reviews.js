import { csrfFetch } from "./csrf";

const GET_REVIEWS = "reviews/GET_REVIEWS";

const getReviews = (spotId, reviews) => {
  return {
    type: GET_REVIEWS,
    spotId,
    reviews
  }
}

export const loadReviews = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
  const data = await response.json();
  dispatch(getReviews(spotId, data.Reviews));
  return response;
}

const initialState = {};

const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_REVIEWS:
      const spotReviews = { ...state[action.spotId] };
      action.reviews.forEach(review => spotReviews[review.id] = review);
      return { ...state, [action.spotId]: { ...state[action.spotId], ...spotReviews } };
    default:
      return state;
  }
}

export default reviewsReducer;
