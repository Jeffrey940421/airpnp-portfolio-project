import React, { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import Select from 'react-select';
import geolocation from '../../utils/geolocation.json'
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
  const [exactLocation, setExactLocation] = useState(true);
  const [description, setDescription] = useState("");
  const [onchangeDescription, setOnchangeDescription] = useState("");
  const [descriptionEdited, setDescriptionEdited] = useState(false);
  const [name, setName] = useState("");
  const [onchangeName, setOnchangeName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [onchangePrice, setOnchangePrice] = useState("");
  const [priceEdited, setPriceEdited] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});

  const user = useSelector(state => state.session.user);
  const geocode = useSelector((state) => state.maps.geocode);
  const lat = geocode ? geocode.coord.lat : "";
  const lng = geocode ? geocode.coord.lng : "";

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

  const preventSymbols = (e) => {
    setOldPrice(onchangePrice);
    const number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    if (!number.map(number => `Digit${number}`).includes(e.code) && e.code !== "Period") {
      e.preventDefault();
    }
    if ((!onchangePrice || onchangePrice.includes(".")) && e.code === "Period") {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (onchangePrice.includes(".") && onchangePrice.split(".")[1].length > 2) {
      setOnchangePrice(oldPrice);
    }
    if (onchangePrice.startsWith("0") && onchangePrice[1] && onchangePrice[1] !== ".") {
      setOnchangePrice(onchangePrice.slice(1));
    }
    if (price && price.includes(".") && price.endsWith("0")) {
      setOnchangePrice(onchangePrice.slice(0, onchangePrice.length - 1));
      setPrice(price.slice(0, price.length - 1));
    }
    if (price && price.endsWith(".")) {
      setOnchangePrice(onchangePrice.slice(0, onchangePrice.length - 1));
      setPrice(price.slice(0, price.length - 1));
    }
    if (onchangePrice.startsWith(".")) {
      setOnchangePrice("0" + onchangePrice);
    }
  }, [onchangePrice, price])

  useEffect(() => {
    if (geocode && (!geocode.address_types.includes("street_address") && !geocode.address_types.includes("premise"))) {
      setExactLocation(false);
    } else {
      setExactLocation(true);
    }
  }, [geocode]);

  useEffect(() => {
    const errors = {};

    if (countryEdited && !country) errors.country = "Country is required";
    if (stateEdited && !state) errors.state = "State is required";
    if (cityEdited && !city) errors.city = "City is required";
    if (addressEdited && !address) errors.address = "Address is required";
    if (descriptionEdited && !description) errors.description = "Description is required";
    if (nameEdited && !name) errors.name = "Name is required";
    if (priceEdited && !price) errors.price = "Price is required";

    setAvailabilityErrors(errors);
  }, [country, countryEdited, state, stateEdited, city, cityEdited, address, addressEdited, description, descriptionEdited, name, nameEdited, price, priceEdited]);

  useEffect(() => {
    const errors = { address: [], description: [], name: [], price: [] };

    if (address && address.length > 255) errors.address.push("Address must be at most 255 characters long");

    if (description && description.length < 30) errors.description.push("Description must be at least 30 characters long");

    if (name && name.length > 50) errors.name.push("Place title must be at most 50 characters long");

    if (price && price === "0") errors.price.push("Price must be greater than 0");

    setValidationErrors(errors);
  }, [address, description, name, price])

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
              options={Object.keys(geolocation).map(country => {
                return { value: country, label: country }
              })}
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
              }}
              value={{ value: state, label: state }}
              className="selectOptions"
              isSearchable={true}
              isClearable={false}
              name="state"
              options={country ? Object.keys(geolocation[country]).map(state => {
                return { value: state, label: state }
              }) : []}
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
              }}
              value={{ value: city, label: city }}
              className="selectOptions"
              isSearchable={true}
              isClearable={false}
              name="city"
              options={(country && state) ? geolocation[country][state].map(city => {
                return { value: city, label: city }
              }) : []}
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
              }}
            />
          </div>
          <div className="errorMessage">
            {serverErrors.address && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" />
              {serverErrors.address}</p>}
            {availabilityErrors.address && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.address}</p>}
            {validationErrors.address && validationErrors.address.length > 0 && validationErrors.address.map(error => (
              <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
            ))}
          </div>
          {address && city && state && country && <MapContainer address={address} city={city} state={state} country={country} exactLocation={exactLocation} />}
        </div>
        <div className="descriptionSection">
          <h2>Describe your place to guests</h2>
          <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
          <div className={`inputArea ${availabilityErrors.description || (validationErrors.description && validationErrors.description.length) || serverErrors.description ? "errorTextarea" : ""}`}>
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              value={onchangeDescription}
              onChange={(e) => {
                setOnchangeDescription(e.target.value);
              }}
              onBlur={(e) => {
                setDescriptionEdited(true);
                setDescription(e.target.value);
              }}
            />
          </div>
          <div className="errorMessage">
            {serverErrors.description && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" />
              {serverErrors.description}</p>}
            {availabilityErrors.description && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.description}</p>}
            {validationErrors.description && validationErrors.description.length > 0 && validationErrors.description.map(error => (
              <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
            ))}
          </div>
        </div>
        <div className="nameSection">
          <h2>Create a title for your place</h2>
          <p>Catch guests' attention with a place title that highlights what makes your place special.</p>
          <div className={`inputBox ${availabilityErrors.name || (validationErrors.name && validationErrors.name.length) || serverErrors.name ? "error" : ""}`}>
            <label htmlFor="name">Place Title</label>
            <input
              name="name"
              type="text"
              value={onchangeName}
              onChange={(e) => {
                setOnchangeName(e.target.value);
              }}
              onBlur={(e) => {
                setNameEdited(true);
                setName(e.target.value);
              }}
            />
          </div>
          <div className="errorMessage">
            {serverErrors.name && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" />
              {serverErrors.name}</p>}
            {availabilityErrors.name && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.name}</p>}
            {validationErrors.name && validationErrors.name.length > 0 && validationErrors.name.map(error => (
              <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
            ))}
          </div>
        </div>
        <div className="priceSection">
          <h2>Set a base price for your spot</h2>
          <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
          <div className={`inputBox ${availabilityErrors.price || (validationErrors.price && validationErrors.price.length) || serverErrors.price ? "error" : ""}`}>
            <label htmlFor="price">{"Price per Night (USD)"}</label>
            <input
              name="price"
              type="text"
              value={onchangePrice}
              onChange={(e) => {
                setOnchangePrice(e.target.value);
              }}
              onBlur={(e) => {
                setPriceEdited(true);
                setOnchangePrice(e.target.value);
                setPrice(e.target.value);
              }}
              onKeyPress={preventSymbols}
            />
          </div>
          <div className="errorMessage">
            {serverErrors.price && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" />
              {serverErrors.price}</p>}
            {availabilityErrors.price && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.price}</p>}
            {validationErrors.price && validationErrors.price.length > 0 && validationErrors.price.map(error => (
              <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
            ))}
          </div>
        </div>

        <div className="submitButtons">
          <button
            type="submit"
            disabled={Object.values(availabilityErrors).length || Object.values(validationErrors).flat().length || !countryEdited || !stateEdited || !cityEdited || !addressEdited || !lat || !lng || !descriptionEdited}
          >
            Create Spot
          </button>
        </div>
      </form>
    </div>
  )
}
