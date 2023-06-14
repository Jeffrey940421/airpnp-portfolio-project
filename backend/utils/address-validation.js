const database = require('country-state-city')

const countryNames = database.Country.getAllCountries().map(country => country.name);

const getCountryCodeByName = (countryName) => {
  return database.Country.getAllCountries().find(country => country.name === countryName);
}

const getStatesByCountryName = (countryName) => {
  const countryCode = getCountryCodeByName(countryName).isoCode;
  return database.State.getStatesOfCountry(countryCode).map(state => state.name);
}

const getStateCodeByNames = (countryName, stateName) => {
  const countryCode = getCountryCodeByName(countryName).isoCode;
  return database.State.getStatesOfCountry(countryCode).find(state => state.name === stateName);
}

const getCitiesByCountryStateNames = (countryName, stateName) => {
  const countryCode = getCountryCodeByName(countryName).isoCode;
  const stateCode = getStateCodeByNames(countryName, stateName).isoCode;
  return database.City.getCitiesOfState(countryCode, stateCode).map(city => city.name);
}

module.exports = {
  countryNames,
  getCountryCodeByName,
  getStatesByCountryName,
  getStateCodeByNames,
  getCitiesByCountryStateNames
}
