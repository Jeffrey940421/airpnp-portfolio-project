import { csrfFetch } from "./csrf";

const GET_SPOTS = "spots/GET_SPOTS";
const CREATE_SPOT = "spots/CREATE-SPOT";

const getSpots = (spots) => {
  return {
    type: GET_SPOTS,
    spots
  }
}

const createSpot = (spot) => {
  return {
    type: GET_SPOTS,
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
  return response;
};

export const addSpot = (spot) => async (dispatch) => {
  const response = await csrfFetch("/api/spots", {
    method: "POST",
    body: JSON.stringify(spot)
  });
  const data = await response.json();
  dispatch(createSpot(data));
  return response;
}

const initialState = {};

const spotsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SPOTS:
      const newState = {};
      action.spots.forEach(spot => newState[spot.id] = spot);
      return newState;
    case CREATE_SPOT:
      return {...state, [action.spot.id]: action.spot};
    default:
      return state;
  }
};

export default spotsReducer;
