import { csrfFetch } from "./csrf";

const SET_USER = "session/SET_USER";
const REMOVE_USER = "session/REMOVE_USER";
const GET_CURRENT_SPOTS = "session/GET_CURRENT_SPOTS";
const DELETE_CURRENT_SPOTS = "session/DELETE_CURRENT_SPOTS";

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

const initialState = { user: null, spots: {} };

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.user }
    case REMOVE_USER:
      return { ...state, user: null }
    case GET_CURRENT_SPOTS:
      const spots = {};
      action.spots.forEach(spot => spots[spot.id] = spot);
      return { ...state, spots: { ...state.spots, ...spots } }
    case DELETE_CURRENT_SPOTS:
      const existingSpots = { ...state.spots };
      delete existingSpots[action.spotId];
      return { ...state, spots: existingSpots }
    default:
      return state;
  }
};

export default sessionReducer;
