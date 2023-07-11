import { csrfFetch } from './csrf';

const LOAD_API_KEY = 'maps/LOAD_API_KEY';
const GET_GEOCODE = "maps/GET_GEOCODE";
const UPDATE_GEOCODE = "maps/UPDATE_GEOCODE";

const loadApiKey = (key) => ({
  type: LOAD_API_KEY,
  payload: key,
});

const loadGeocode = (address_components, coord, address_types) => ({
  type: GET_GEOCODE,
  address_components,
  coord: { lat: +coord.lat.toFixed(7), lng: +coord.lng.toFixed(7) },
  address_types
});

const editGeocode = (address_components, coord, address_types) => ({
  type: UPDATE_GEOCODE,
  address_components,
  coord: { lat: +coord.lat.toFixed(7), lng: +coord.lng.toFixed(7) },
  address_types
})

export const getKey = () => async (dispatch) => {
  const res = await csrfFetch('/api/maps/key', {
    method: 'POST',
  });
  const data = await res.json();
  dispatch(loadApiKey(data.googleMapsAPIKey));
};

const isPlusCode = (address) => {
  if (address.split("+").length === 2 && address.split("+")[0].length === 4 && address.split("+")[1].length <= 3) {
    return true;
  }
  return false;
}

export const getGeocode = (address, city, state, country, key) => async (dispatch) => {
  if (isPlusCode(address)) {
    address = address.split("+").join("%2B")
  }
  const query = `${address.split(" ").join("+")},+${city.split(" ").join("+")},+${state.split(" ").join("+")},+${country.split(" ").join("+")}`
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${key}`);
  const data = await res.json();
  const geocode = data.results[0];
  dispatch(loadGeocode(geocode.address_components, geocode.geometry.location, geocode.types));
}

export const updateGeocode = (lat, lng, key) => async (dispatch) => {
  const query = `${lat}, ${lng}`;
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${query}&key=${key}`);
  const data = await res.json();
  const geocode = data.results[0];
  console.log(geocode)
  dispatch(editGeocode(geocode.address_components, { lat, lng }, geocode.types));
}

const initialState = { key: null, geocode: null };

const mapsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_API_KEY:
      return { ...state, key: action.payload };
    case GET_GEOCODE:
      return {
        ...state, geocode: {
          address_components: action.address_components,
          coord: action.coord,
          address_types: action.address_types
        }
      };
    case UPDATE_GEOCODE:
      return {
        ...state, geocode: {
          address_components: action.address_components,
          coord: action.coord,
          address_types: action.address_types
        }
      }
    default:
      return state;
  }
};

export default mapsReducer;
