import { csrfFetch } from './csrf';

const LOAD_API_KEY = 'maps/LOAD_API_KEY';
const GET_GEOCODE = "maps/GET_GEOCODE";

const loadApiKey = (key) => ({
  type: LOAD_API_KEY,
  payload: key,
});

const loadGeocode = (geocode) => ({
  type: GET_GEOCODE,
  geocode
})

export const getKey = () => async (dispatch) => {
  const res = await csrfFetch('/api/maps/key', {
    method: 'POST',
  });
  const data = await res.json();
  dispatch(loadApiKey(data.googleMapsAPIKey));
};

export const getGeocode = (address, city, state, country, key) => async (dispatch) => {
  const query = `${address.split(" ").join("+")},+${city.split(" ").join("+")},+${state.split(" ").join("+")},+${country.split(" ").join("+")}`
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${key}`);
  const data = await res.json();
  const result = dispatch(loadGeocode(data.results[0]));
  return result;
}

const initialState = { key: null, geocode: null };

const mapsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_API_KEY:
      return { ...state, key: action.payload };
    case GET_GEOCODE:
      return {...state, geocode: action.geocode};
    default:
      return state;
  }
};

export default mapsReducer;
