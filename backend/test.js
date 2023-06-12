const countries = require('country-state-city').Country.getAllCountries().map(country => country.isoCode);
const database = require('country-state-city')
let result = []
const countryCodes = {};
database.Country.getAllCountries().forEach(country => {
  countryCodes[country.name] = country.isoCode
});

countries.forEach(country => {
  result = result.concat(database.State.getStatesOfCountry(country).map(state=>state.name))
})

// console.log(result.reduce((acc, el) => acc = el.length > acc ? el.length : acc, 0))
console.log(database.City.getAllCities().map(city => city.name).reduce((acc, el) => el.length > acc ? el.length : acc, 0))
