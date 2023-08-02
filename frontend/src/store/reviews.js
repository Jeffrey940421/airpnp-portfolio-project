import { csrfFetch } from "./csrf";

const GET_REVIEWS = "reviews/GET_REVIEWS";
const ADD_REVIEW = "reviews/ADD_REVIEW";
const REMOVE_REVIEW = "reviews/REMOVE_REVIEW";
const EDIT_REVIEW = "reviews/EDIT_REVIEW";
const ADD_IMAGES = "review/ADD_IMAGES";
const DELETE_IMAGES = "review/DELETE_IMAGES";

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

const editReview = (spotId, review) => {
  return {
    type: EDIT_REVIEW,
    spotId,
    review
  }
}

const addImages = (spotId, reviewId, images) => {
  return {
    type: ADD_IMAGES,
    spotId,
    reviewId,
    images
  }
}

const deleteImages = (spotId, reviewId, imageIds) => {
  return {
    type: DELETE_IMAGES,
    spotId,
    reviewId,
    imageIds
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
  if (response.ok) {
    return data
  } else {
    return response;
  }
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

export const updateReview = (spotId, reviewId, review) => async (dispatch) => {
  const response = await csrfFetch(`/api/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(review)
  });
  const data = await response.json();
  dispatch(editReview(spotId, data));
  return response
}

export const addReviewImages = (spotId, reviewId, images) => async (dispatch) => {
  const formData = new FormData();
  Array.from(images).forEach(image => formData.append("images", image));
  const response = await csrfFetch(`/api/reviews/${reviewId}/images`, {
    method: "POST",
    body: formData
  });
  const data = await response.json();
  dispatch(addImages(spotId, reviewId, data));
  return response;
}

export const removeReviewImages = (spotId, reviewId, imageIds) => async (dispatch) => {
  const response = await Promise.all(imageIds.map(async (id) => {
    const response = await csrfFetch(`/api/review-images/${id}`, {
      method: "DELETE"
    });
    return await response.json();
  }));
  dispatch(deleteImages(spotId, reviewId, imageIds));
  return response;
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
    case EDIT_REVIEW:
      return { ...state, [action.spotId]: { ...state[action.spotId], [action.review.id]: { ...state[action.spotId][action.review.id], ...action.review } } }
    case ADD_IMAGES:
      return { ...state, [action.spotId]: { ...state[action.spotId], [action.reviewId]: { ...state[action.spotId][action.reviewId], ReviewImages: [...state[action.spotId][action.reviewId].ReviewImages, ...action.images] } } }
    case DELETE_IMAGES:
      let reviewImages = [...state[action.spotId][action.reviewId].ReviewImages];
      reviewImages = reviewImages.filter(image => !action.imageIds.includes(image.id));
      return { ...state, [action.spotId]: { ...state[action.spotId], [action.reviewId]: { ...state[action.spotId][action.reviewId], ReviewImages: reviewImages } } }
    default:
      return state;
  }
}

export default reviewsReducer;
