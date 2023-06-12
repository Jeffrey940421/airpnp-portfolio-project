const database = require('country-state-city')

const countryNames = database.Country.getAllCountries().map(country => country.name);

const getCountryCodeByName = (countryName) => {
  return database.Country.getAllCountries().find(country => country.name === countryName).isoCode;
}

const getStatesByCountryName = (countryName) => {
  const countryCode = getCountryCodeByName(countryName);
  return database.State.getStatesOfCountry(countryCode).map(state => state.name);
}

const getStateCodeByNames = (countryName, stateName) => {
  const countryCode = getCountryCodeByName(countryName);
  return database.State.getStatesOfCountry(countryCode).find(state => state.name === stateName).isoCode;
}

const getCitiesByCountryStateNames = (countryName, stateName) => {
  const countryCode = getCountryCodeByName(countryName);
  const stateCode = getStateCodeByNames(countryName, stateName);
  return database.City.getCitiesOfState(countryCode, stateCode).map(city => city.name);
}

module.exports = {
  countryNames,
  getStatesByCountryName,
  getCitiesByCountryStateNames
}
