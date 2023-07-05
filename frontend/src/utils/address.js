import { Country, State, City } from "country-state-city";

let countryNames = Country.getAllCountries().map(country => country.name);
const index = countryNames.indexOf("United States");
countryNames[index] = "United States of America";
export const countryList = countryNames.map(country => {
  return { value: country, label: country };
})

const getCountryCodeByName = (countryName) => {
  if (countryName === "United States of America") {
    return Country.getAllCountries().find(country => country.name === "United States");
  } else {
    return Country.getAllCountries().find(country => country.name === countryName);
  }
}

export const getStatesByCountryName = (countryName) => {
  const countryCode = getCountryCodeByName(countryName).isoCode;
  return State.getStatesOfCountry(countryCode).map(state => {
    return { value: state.name, label: state.name };
  });
}

const getStateCodeByNames = (countryName, stateName) => {
  const countryCode = getCountryCodeByName(countryName).isoCode;
  return State.getStatesOfCountry(countryCode).find(state => state.name === stateName);
}

export const getCitiesByCountryStateNames = (countryName, stateName) => {
  const countryCode = getCountryCodeByName(countryName).isoCode;
  const stateCode = getStateCodeByNames(countryName, stateName).isoCode;
  return City.getCitiesOfState(countryCode, stateCode).map(city => {
    return { value: city.name, label: city.name };
  });
}
