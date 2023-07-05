import React, { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import Select from 'react-select';
import { countryList, getStatesByCountryName, getCitiesByCountryStateNames } from "../../utils/address";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import "./CreateSpot.css";
import MapContainer from "../Maps";
import { Redirect } from "react-router-dom";

export function CreateSpot() {

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [onchangeAddress, setOnchangeAddress] = useState("");
  const [lat, setLat] = useState("");
  const [onchangeLat, setOnchangeLat] = useState("");
  const [lng, setLng] = useState("");
  const [onchangeLng, setOnchangeLng] = useState("");
  const [exactLocation, setExactLocation] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});

  const user = useSelector(state => state.session.user);
  const geocode = useSelector((state) => state.maps.geocode);

  useEffect(() => {
    if (geocode && address && city && state && country && !geocode.types.includes("street_address")) {
      setExactLocation(false);
    } else {
      setExactLocation(true);
    }

    if (geocode) {
      setLat(geocode.geometry.location.lat);
      setOnchangeLat(geocode.geometry.location.lat);
      setLng(geocode.geometry.location.lng);
      setOnchangeLng(geocode.geometry.location.lng);
    }
  }, [geocode, address, city, state, country])

  if (!user) {
    return <Redirect to="/" />
  }

  return (
    <>
      <h1>Create a New Spot</h1>
      <form className="createSpotForm">
        <h2>Where's your place located</h2>
        <p>Guests will only get your exact address once they booked a reservation</p>
        <div className={`selectMenu ${availabilityErrors.country || serverErrors.country ? "error" : ""}`}>
          <label htmlFor="country">Country</label>
          <Select
            onChange={(selectedVal) => {
              setCountry(selectedVal.value);
              setState("");
            }}
            className="selectOptions"
            value={{ value: country, label: country }}
            isSearchable={true}
            isClearable={false}
            name="country"
            options={countryList}
            style={{
              control: (provided, state) => ({
                ...provided,
                background: 'transparent',
                borderColor: '#9e9e9e',
                minHeight: '50px',
                height: '50px',
                boxShadow: state.isFocused ? null : null,
              })

            }}
          />
        </div>
        <div className={`selectMenu ${availabilityErrors.country || serverErrors.country ? "error" : ""}`}>
          <label htmlFor="state">State</label>
          <Select
            onChange={(selectedVal) => {
              setState(selectedVal.value);
              setCity("");
            }}
            value={{ value: state, label: state }}
            className="selectOptions"
            isSearchable={true}
            isClearable={false}
            name="state"
            options={country ? getStatesByCountryName(country) : []}
          />
        </div>
        <div className={`selectMenu ${availabilityErrors.country || serverErrors.country ? "error" : ""}`}>
          <label htmlFor="city">City</label>
          <Select
            onChange={(selectedVal) => setCity(selectedVal.value)}
            value={{ value: city, label: city }}
            className="selectOptions"
            isSearchable={true}
            isClearable={true}
            name="city"
            options={(country && state) ? getCitiesByCountryStateNames(country, state) : []}
          />
        </div>
        <div className={`inputBox ${availabilityErrors.email || (validationErrors.email && validationErrors.email.length) || serverErrors.email ? "error" : ""}`}>
          <label htmlFor="address">Address</label>
          <input
            name="address"
            type="text"
            value={onchangeAddress}
            onChange={(e) => setOnchangeAddress(e.target.value)}
            onBlur={(e) => setAddress(e.target.value)}
          />
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
            <p>We are unable to find the exact location of your house. Please either check the address you entered or enter the latitude and longitude of your house manually.</p>
          </>
        }
        {address && city && state && country && <MapContainer address={address} city={city} state={state} country={country} latitude={lat} longitude={lng} />}
      </form>
    </>
  )
}
