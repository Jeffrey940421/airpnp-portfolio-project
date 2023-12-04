import { csrfFetch } from "./csrf";

const GET_SPOTS = "spots/GET_SPOTS";
const CREATE_SPOT = "spots/CREATE_SPOT";
const ADD_IMAGES = "spots/ADD_IMAGES";
const DELETE_NEW_SPOT = "spots/DELETE_NEW_SPOT";
const GET_SINGLE_SPOT = "spots/GET_SINGLE_SPOT";
const UPDATE_SINGLE_SPOT = "spots/UPDATE_SINGLE_SPOT";
const DELETE_IMAGES = "spots/DELETE_IMAGES";
const SET_PREVIEW = "spots/SET_PREVIEW";
const REMOVE_SPOT = "spots/REMOVE_SPOT";
const ADD_BOOKING = "spots/ADD_BOOKING";
const GET_SPOT_BOOKINGS = "spots/GET_SPOT_BOOKINGS";
const GET_PRICES = "spots/GET_PRICES";

const getSpots = (spots, page) => {
  return {
    type: GET_SPOTS,
    spots,
    page
  }
}

const createSpot = (spot) => {
  return {
    type: CREATE_SPOT,
    spot
  }
}

const addImages = (images) => {
  return {
    type: ADD_IMAGES,
    images
  }
}

const deleteNewSpot = () => {
  return {
    type: DELETE_NEW_SPOT
  }
}

export const getSingleSpot = (spot) => {
  return {
    type: GET_SINGLE_SPOT,
    spot
  }
}

const updateSingleSpot = (spot) => {
  return {
    type: UPDATE_SINGLE_SPOT,
    spot
  }
}

const deleteImages = (imageIds) => {
  return {
    type: DELETE_IMAGES,
    imageIds
  }
}

const setPreview = (imageId) => {
  return {
    type: SET_PREVIEW,
    imageId
  }
}

const createBooking = (booking) => {
  return {
    type: ADD_BOOKING,
    booking
  }
}

const getSpotBookings = (bookings) => {
  return {
    type: GET_SPOT_BOOKINGS,
    bookings
  }
}

const getPrices = (prices) => {
  return {
    type: GET_PRICES,
    prices
  }
}

export const listSpots = (query) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots${query}`);
  const data = await response.json();
  dispatch(getSpots(data.Spots, data.page));
  if (response.ok) {
    return data;
  } else {
    return response;
  }
};

export const listPrices = (query) => async (dispatch) => {
  const minPriceResponse = await csrfFetch(`/api/spots${query}&sort=price&order=ASC NULLS FIRST&size=1&page=1`);
  const minPriceData = await minPriceResponse.json();
  const minPrice = minPriceData.Spots[0] ? minPriceData.Spots[0].price : 0;
  if (!minPriceResponse.ok) {
    return minPriceResponse;
  }
  const maxPriceResponse = await csrfFetch(`/api/spots${query}&sort=price&order=DESC NULLS LAST&size=1&page=1`);
  const maxPriceData = await maxPriceResponse.json()
  const maxPrice = maxPriceData.Spots[0] ? maxPriceData.Spots[0].price : undefined;
  if (!maxPriceResponse.ok) {
    return maxPriceResponse;
  }
  dispatch(getPrices({ minPrice, maxPrice }));
  return { minPrice, maxPrice };
}

export const addSpot = (spot, images, preview) => async (dispatch) => {
  const spotResponse = await csrfFetch("/api/spots", {
    method: "POST",
    body: JSON.stringify(spot)
  });
  const newSpot = await spotResponse.json();
  dispatch(createSpot(newSpot));
  if (!spotResponse.ok) {
    return spotResponse;
  }
  const spotId = newSpot.id;
  const formData = new FormData();
  Array.from(images).forEach(image => formData.append("images", image));
  formData.append("preview", preview);
  const imagesResponse = await csrfFetch(`/api/spots/${spotId}/images`, {
    method: "POST",
    body: formData
  });
  const newImages = await imagesResponse.json();
  dispatch(addImages(newImages));
  if (!imagesResponse.ok) {
    return imagesResponse;
  } else {
    return spotId;
  }
}

export const addNewImages = (spotId, images, preview) => async (dispatch) => {
  const formData = new FormData();
  Array.from(images).forEach(image => formData.append("images", image));
  if (preview) {
    formData.append("preview", preview);
  }
  const response = await csrfFetch(`/api/spots/${spotId}/images`, {
    method: "POST",
    body: formData
  });
  const data = await response.json();
  dispatch(addImages(data));
  return response
}

export const removeNewSpot = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`, {
    method: "DELETE"
  });
  dispatch(deleteNewSpot());
  return response;
}

export const loadSingleSpot = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`);
  const data = await response.json();
  dispatch(getSingleSpot(data));
  return response;
}

export const loadSpotBookings = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/bookings`);
  const data = await response.json();
  dispatch(getSpotBookings(data.Bookings));
  return response;
}

export const editSpot = (spot, spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`, {
    method: "PUT",
    body: JSON.stringify(spot)
  });
  const data = await response.json();
  dispatch(updateSingleSpot(data));
  return response;
}

export const removeImages = (imageIds) => async (dispatch) => {
  const responses = await Promise.all(imageIds.map(async (id) => {
    const response = await csrfFetch(`/api/spot-images/${id}`, { method: "DELETE" });
    return await response.json()
  }));
  dispatch(deleteImages(imageIds));
  return responses;
}

export const setPreviewImage = (imageId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spot-images/${imageId}`, {
    method: "PUT",
    body: JSON.stringify({ preview: true })
  });
  dispatch(setPreview(imageId));
  return response;
}

export const addBooking = (booking, spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/bookings`, {
    method: "POST",
    body: JSON.stringify(booking)
  });
  const data = await response.json();
  dispatch(createBooking(data));
  return response;
}

const initialState = { spotList: {}, singleSpot: {}, spotPrices: {} };

const spotsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SPOTS:
      const spotList = {};
      action.spots.forEach(spot => spotList[spot.id] = spot);
      if (action.page === 1) {
        return { ...state, spotList: {1: spotList} };
      } else {
        return { ...state, spotList: { ...state.spotList, [action.page]: spotList } };
      }
    case CREATE_SPOT:
      return { ...state, singleSpot: action.spot };
    case ADD_IMAGES:
      return { ...state, singleSpot: { ...state.singleSpot, SpotImages: state.singleSpot.SpotImages ? [...state.singleSpot.SpotImages, ...action.images] : action.images } };
    case DELETE_NEW_SPOT:
      return { ...state, singleSpot: {} };
    case GET_SINGLE_SPOT:
      return { ...state, singleSpot: action.spot };
    case UPDATE_SINGLE_SPOT:
      return { ...state, singleSpot: { ...state.singleSpot, ...action.spot } }
    case DELETE_IMAGES:
      let spotImages = [...state.singleSpot.SpotImages];
      spotImages = spotImages.filter(image => !action.imageIds.includes(image.id));
      return { ...state, singleSpot: { ...state.singleSpot, SpotImages: spotImages } }
    case SET_PREVIEW:
      let newSpotImages = [...state.singleSpot.SpotImages];
      for (let image of newSpotImages) {
        if (image.id === action.imageId) {
          image.preview = true
        } else {
          image.preview = false
        }
      }
      return { ...state, singleSpot: { ...state.singleSpot, SpotImages: newSpotImages } }
    case ADD_BOOKING:
      const booking = {spotId: `${action.booking.spotId}`, startDate: action.booking.startDate, endDate: action.booking.endDate};
      return { ...state, singleSpot: { ...state.singleSpot, Bookings: [...state.singleSpot.Bookings, booking] } }
    case GET_SPOT_BOOKINGS:
      return { ...state, singleSpot: { ...state.singleSpot, Bookings: action.bookings } }
    case GET_PRICES:
      return { ...state, spotPrices: action.prices }
    default:
      return state;
  }
};

export default spotsReducer;
