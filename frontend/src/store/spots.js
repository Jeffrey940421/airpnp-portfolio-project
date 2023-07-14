import { csrfFetch } from "./csrf";

const GET_SPOTS = "spots/GET_SPOTS";
const CREATE_SPOT = "spots/CREATE_SPOT";
const ADD_IMAGES = "spots/ADD_IMAGES";
const DELETE_NEW_SPOT = "spots/DELETE_NEW_SPOT";
const GET_SINGLE_SPOT = "spots/GET_SINGLE_SPOT";

const getSpots = (spots) => {
  return {
    type: GET_SPOTS,
    spots
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

const getSingleSpot = (spot) => {
  return {
    type: GET_SINGLE_SPOT,
    spot
  }
}

export const listSpots = (filter) => async (dispatch) => {
  const page = filter.page || "";
  const size = filter.size || "";
  const minLng = filter.minLng || "";
  const maxLng = filter.maxLng || "";
  const minLat = filter.minLat || "";
  const maxLat = filter.maxLat || "";
  const minPrice = filter.minPrice || "";
  const maxPrice = filter.maxPrice || "";
  const response = await csrfFetch(`/api/spots?page=${page}&size=${size}&minLng=${minLng}&maxLng=${maxLng}&minLat=${minLat}&maxLat=${maxLat}&minPrice=${minPrice}&maxPrice=${maxPrice}`);
  const data = await response.json();
  dispatch(getSpots(data.Spots));
  if (response.ok) {
    return data;
  } else {
    return response;
  }
};

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

const initialState = { spotList: {}, singleSpot: {} };

const spotsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SPOTS:
      const spotList = {};
      action.spots.forEach(spot => spotList[spot.id] = spot);
      return { ...state, spotList: { ...state.spotList, ...spotList } };
    case CREATE_SPOT:
      return { ...state, singleSpot: action.spot };
    case ADD_IMAGES:
      return { ...state, singleSpot: { ...state.singleSpot, SpotImages: state.singleSpot.SpotImages ? [...state.singleSpot.SpotImages, ...action.images] : action.images } };
    case DELETE_NEW_SPOT:
      return { ...state, singleSpot: {} };
    case GET_SINGLE_SPOT:
      return { ...state, singleSpot: action.spot };
    default:
      return state;
  }
};

export default spotsReducer;
