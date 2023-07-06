import React, { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import Select from 'react-select';
import { countryList, getStatesByCountryName, getCitiesByCountryStateNames } from "../../utils/address";
import "./CreateSpot.css";
import MapContainer from "../Maps";
import { Redirect } from "react-router-dom";

export function CreateSpot() {

  const [country, setCountry] = useState("");
  const [countryEdited, setCountryEdited] = useState(false);
  const [state, setState] = useState("");
  const [stateEdited, setStateEdited] = useState(false);
  const [city, setCity] = useState("");
  const [cityEdited, setCityEdited] = useState(false);
  const [address, setAddress] = useState("");
  const [onchangeAddress, setOnchangeAddress] = useState("");
  const [addressEdited, setAddressEdited] = useState(false);
  const [lat, setLat] = useState("");
  const [onchangeLat, setOnchangeLat] = useState("");
  const [latEdited, setLatEdited] = useState(false)
  const [lng, setLng] = useState("");
  const [onchangeLng, setOnchangeLng] = useState("");
  const [lngEdited, setLngEdited] = useState(false);
  const [exactLocation, setExactLocation] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});

  const user = useSelector(state => state.session.user);
  const geocode = useSelector((state) => state.maps.geocode);

  const selectMenuStyle = {
    control: (base, state) => ({
      ...base,
      minHeight: "60px !important",
      maxHeight: "60px",
      backgroundColor: "transparent",
      borderRadius: "10px",
      boxShadow: "none",
      borderColor: state.isFocused ? "black" : "#DDDDDD",
      outline: state.isFocused ? "1.5px solid " : "none",
      boxShadow: "none",
      '&:hover': {
        borderColor: "black",
        borderWidth: "1.5px"
      },
    }),
    valueContainer: (base, state) => ({
      ...base,
      minHeight: "60px !important",
      maxHeight: "60px",
      position: "relative",
      backgroundColor: "transparent"
    }),
    singleValue: (base, state) => ({
      ...base,
      paddingTop: "17px",
      backgroundColor: "transparent"
    }),
    indicatorContainer: (base, state) => ({
      ...base,
      minHeight: "60px !important",
      maxHeight: "60px",
      backgroundColor: "transparent"
    }),
    input: (base, state) => ({
      ...base,
      minHeight: "60px !important",
      maxHeight: "60px",
      paddingTop: "17px",
      backgroundColor: "transparent"
    }),
    menu: (base, state) => ({
      ...base,
      borderRadius: "5px"
    }),
    option: (base, state) => ({
      ...base,
      height: "50px",
      display: "flex",
      alignItems: "center"
    })
  }

  useEffect(() => {
    if (geocode && address && city && state && country && (!geocode.types.includes("street_address") || !geocode.types.includes("premise"))) {
      setExactLocation(false);
    } else {
      setExactLocation(true);
    }

    if (geocode && !lat && !lng) {
      const latitude = geocode.geometry.location.lat.toFixed(7);
      const longitude = geocode.geometry.location.lng.toFixed(7);
      setLat(latitude);
      setOnchangeLat(latitude);
      setLng(longitude);
      setOnchangeLng(longitude);
    }
  }, [geocode, address, city, state, country, lat, lng]);

  useEffect(() => {
    const errors = {};

    if (countryEdited && !country) errors.country = "Country is required";
    if (stateEdited && !state) errors.state = "State is required";
    if (cityEdited && !city) errors.city = "City is required";
    if (addressEdited && !address) errors.address = "Address is required";
    if (latEdited && !lat) errors.lat = "Latitude is required";
    if (lngEdited && !lng) errors.lng = "Longitude is required";

    setAvailabilityErrors(errors);
  }, [country, countryEdited, state, stateEdited, city, cityEdited, address, addressEdited, lat, latEdited, lng, lngEdited]);

  useEffect(() => {
    const errors = { address: [], lat: [], lng: [] };

    if (address && address.length > 255) errors.address.push("Address must be at most 255 characters long");



    setValidationErrors(errors);
  }, [address, lat, lng])

  if (!user) {
    return <Redirect to="/" />
  }

  return (
    <div className="createSpotForm">
      <h1>Create a New Spot</h1>
      <form className="createSpotForm">
        <div className="locationSection">
          <h2>Where's your place located</h2>
          <p>Guests will only get your exact address once they booked a reservation</p>
          <div className={`selectMenu ${availabilityErrors.country || serverErrors.country ? "error" : ""}`}>
            <label htmlFor="country">Country</label>
            <Select
              onChange={(selectedVal) => {
                setCountry(selectedVal.value);
                setState("");
                setCity("");
                setLat("");
                setOnchangeLat("");
                setLng("");
                setOnchangeLng("")
              }}
              onBlur={() => setCountryEdited(true)}
              classNames={{
                control: (state) => (
                  state.isFocused ? "focusedSelect" : "unfocusedSelect"
                )
              }}
              className="selectOptions"
              value={{ value: country, label: country }}
              isSearchable={true}
              isClearable={false}
              name="country"
              options={countryList}
              styles={selectMenuStyle}
            />
          </div>
          <div className="errorMessage">
            {serverErrors.country && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" />
              {serverErrors.country}</p>}
            {availabilityErrors.country && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.country}</p>}
          </div>
          <div className={`selectMenu ${availabilityErrors.state || serverErrors.state ? "error" : ""}`}>
            <label htmlFor="state">State</label>
            <Select
              onChange={(selectedVal) => {
                setState(selectedVal.value);
                setCity("");
                setLat("");
                setOnchangeLat("");
                setLng("");
                setOnchangeLng("")
              }}
              value={{ value: state, label: state }}
              className="selectOptions"
              isSearchable={true}
              isClearable={false}
              name="state"
              options={country ? getStatesByCountryName(country) : []}
              styles={selectMenuStyle}
              onBlur={() => setStateEdited(true)}
              classNames={{
                control: (state) => (
                  state.isFocused ? "focusedSelect" : "unfocusedSelect"
                )
              }}
            />
          </div>
          <div className="errorMessage">
            {serverErrors.state && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" />
              {serverErrors.state}</p>}
            {availabilityErrors.state && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.state}</p>}
          </div>
          <div className={`selectMenu ${availabilityErrors.city || serverErrors.city ? "error" : ""}`}>
            <label htmlFor="city">City</label>
            <Select
              onChange={(selectedVal) => {
                setCity(selectedVal.value);
                setLat("");
                setOnchangeLat("");
                setLng("");
                setOnchangeLng("")
              }}
              value={{ value: city, label: city }}
              className="selectOptions"
              isSearchable={true}
              isClearable={false}
              name="city"
              options={(country && state) ? getCitiesByCountryStateNames(country, state) : []}
              styles={selectMenuStyle}
              onBlur={() => setCityEdited(true)}
              classNames={{
                control: (state) => (
                  state.isFocused ? "focusedSelect" : "unfocusedSelect"
                )
              }}
            />
          </div>
          <div className="errorMessage">
            {serverErrors.city && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" />
              {serverErrors.city}</p>}
            {availabilityErrors.city && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.city}</p>}
          </div>
          <div className={`inputBox ${availabilityErrors.address || (validationErrors.address && validationErrors.address.length) || serverErrors.address ? "error" : ""}`}>
            <label htmlFor="address">Address</label>
            <input
              name="address"
              type="text"
              value={onchangeAddress}
              onChange={(e) => {
                setOnchangeAddress(e.target.value);
              }}
              onBlur={(e) => {
                setAddressEdited(true);
                setAddress(e.target.value);
                setLat("");
                setOnchangeLat("");
                setLng("");
                setOnchangeLng("")
              }}
            />
          </div>
          <div className="errorMessage">
            {serverErrors.address && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" />
              {serverErrors.address}</p>}
            {availabilityErrors.address && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.address}</p>}
          </div>
          {exactLocation ? null :
            <>
              <div className={`inputBox ${availabilityErrors.email || (validationErrors.email && validationErrors.email.length) || serverErrors.email ? "error" : ""}`}>
                <label htmlFor="lat">Latitude</label>
                <input
                  name="lat"
                  type="number"
                  value={onchangeLat}
                  onChange={(e) => setOnchangeLat(e.target.value)}
                  onBlur={(e) => setLat(e.target.value)}
                />
              </div>
              <div className={`inputBox ${availabilityErrors.email || (validationErrors.email && validationErrors.email.length) || serverErrors.email ? "error" : ""}`}>
                <label htmlFor="lng">Longitude</label>
                <input
                  name="lng"
                  type="number"
                  value={onchangeLng}
                  onChange={(e) => setOnchangeLng(e.target.value)}
                  onBlur={(e) => setLng(e.target.value)}
                />
              </div>
              <p className="warningMessage"><i className="fa-sharp fa-solid fa-circle-exclamation" /> We are unable to find the exact location of your house. Please either check the address you entered or enter the latitude and longitude of your house manually.</p>
            </>
          }
          {address && city && state && country && <MapContainer address={address} city={city} state={state} country={country} latitude={lat} longitude={lng} />}
        </div>
        <div className="submitButtons">
          <button
            type="submit"
            disabled={Object.values(availabilityErrors).length || Object.values(validationErrors).flat().length || !countryEdited}
          >
            Create Spot
          </button>
        </div>
      </form>
    </div>
  )
}
