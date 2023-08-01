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

export const removeSpot = (spotId) => {
  return {
    type: REMOVE_SPOT,
    spotId
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

export const addNewImages = (spotId, images, preview) => async (dispatch) => {
  const formData = new FormData();
  Array.from(images).forEach(image => formData.append("images", image));
  formData.append("preview", preview);
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
    body: JSON.stringify({preview: true})
  });
  dispatch(setPreview(imageId));
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
    case REMOVE_SPOT:
      const newSpotList = { ...state.spotList };
      delete newSpotList[action.spotId];
      return { ...state, spotList: newSpotList };
    default:
      return state;
  }
};

export default spotsReducer;
