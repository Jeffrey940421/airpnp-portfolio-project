import React, { useState, useEffect, useRef } from "react";
import * as spotActions from "../../store/spots";
import * as mapActions from "../../store/maps";
import { useDispatch, useSelector } from "react-redux";
import Select from 'react-select';
import geolocation from '../../utils/geolocation.json'
import "./CreateSpot.css";
import MapContainer from "../Maps";
import { useHistory, useParams } from "react-router-dom";
import { usePopup } from "../../context/Popup";
import { Loader } from "../Loader/Loader";

export function CreateSpot({ type, spot, spotId }) {


  const existingLat = spot && spot.lat;
  const existingLng = spot && spot.lng;

  const [country, setCountry] = useState(spot ? spot.country : "");
  const [countryEdited, setCountryEdited] = useState(spot ? true : false);
  const [state, setState] = useState(spot ? spot.state : "");
  const [stateEdited, setStateEdited] = useState(spot ? true : false);
  const [city, setCity] = useState(spot ? spot.city : "");
  const [cityEdited, setCityEdited] = useState(spot ? true : false);
  const [address, setAddress] = useState(spot ? spot.address.split(" | ")[0] : "");
  const [onchangeAddress, setOnchangeAddress] = useState(spot ? spot.address.split(" | ")[0] : "");
  const [addressEdited, setAddressEdited] = useState(spot ? true : false);
  const [address2, setAddress2] = useState(spot ? spot.address.split(" | ")[1] : "");
  const [exactLocation, setExactLocation] = useState(true);
  const [description, setDescription] = useState(spot ? spot.description : "");
  const [onchangeDescription, setOnchangeDescription] = useState(spot ? spot.description : "");
  const [descriptionEdited, setDescriptionEdited] = useState(spot ? true : false);
  const [name, setName] = useState(spot ? spot.name : "");
  const [onchangeName, setOnchangeName] = useState(spot ? spot.name : "");
  const [nameEdited, setNameEdited] = useState(spot ? true : false);
  const [price, setPrice] = useState(spot ? spot.price.toString() : "");
  const [oldPrice, setOldPrice] = useState("");
  const [onchangePrice, setOnchangePrice] = useState(spot ? spot.price.toString() : "");
  const [priceEdited, setPriceEdited] = useState(spot ? true : false);
  const [images, setImages] = useState([]);
  const [imagesEdited, setImagesEdited] = useState(spot ? true : false);
  const [imagesToKeep, setImagesToKeep] = useState(spot ? spot.SpotImages : []);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [preview, setPreview] = useState(spot ? - spot.SpotImages.indexOf(spot.SpotImages.find(image => image.preview)) - 1 : 0);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const history = useHistory();
  const dispatch = useDispatch();
  const ref = React.useRef(null);
  const { setPopupContent } = usePopup();
  const imagesNum = Array.from(images).filter(file => file.type.startsWith("image")).length + imagesToKeep.length;

  const user = useSelector(state => state.session.user);
  const geocode = useSelector((state) => state.maps.geocode);
  const lat = geocode ? geocode.coord.lat : "";
  const lng = geocode ? geocode.coord.lng : "";
  const suggestedStreetNumber = geocode ? geocode.address_components.find(el => el.types.includes("street_number")) ? geocode.address_components.find(el => el.types.includes("street_number")).long_name : "" : "";
  const suggestedStreet = geocode ? geocode.address_components.find(el => el.types.includes("route")) ? geocode.address_components.find(el => el.types.includes("route")).long_name : "" : ""
  const suggestedPlusCode = geocode ? geocode.address_components.find(el => el.types.includes("plus_code")) ? geocode.address_components.find(el => el.types.includes("plus_code")).long_name : "" : "";
  const suggestedState = geocode ? geocode.address_components.find(el => el.types.includes("administrative_area_level_1")) ? geocode.address_components.find(el => el.types.includes("administrative_area_level_1")).long_name : "" : "";
  const suggestedCountry = geocode ? geocode.address_components.find(el => el.types.includes("country")) ? geocode.address_components.find(el => el.types.includes("country")).long_name : "" : "";
  const possibleCities = geocode ? geocode.address_components.filter(el => el.types.includes("locality") || el.types.includes("administrative_area_level_2") || el.types.includes("administrative_area_level_3") || el.types.includes("administrative_area_level_4") || el.types.includes("administrative_area_level_5") || el.types.includes("administrative_area_level_6") || el.types.includes("administrative_area_level_7")) ? geocode.address_components.filter(el => el.types.includes("locality") || el.types.includes("administrative_area_level_2") || el.types.includes("administrative_area_level_3") || el.types.includes("administrative_area_level_4") || el.types.includes("administrative_area_level_5") || el.types.includes("administrative_area_level_6") || el.types.includes("administrative_area_level_7")).map(city => city.long_name) : [] : [];
  const suggestedCity = suggestedCountry && suggestedState && suggestedCountry in geolocation && suggestedState in geolocation[suggestedCountry] ? possibleCities.find(city => geolocation[suggestedCountry][suggestedState].includes(city)) : "";
  const suggestedStreetAddress = (suggestedStreetNumber && suggestedStreet && suggestedCity && suggestedState && suggestedCountry) ? `${suggestedStreetNumber} ${suggestedStreet}, ${suggestedCity}, ${suggestedState}, ${suggestedCountry}` : "";
  const suggestedPlusCodeAddress = (suggestedPlusCode && suggestedCity && suggestedState && suggestedCountry) ? `${suggestedPlusCode}, ${suggestedCity}, ${suggestedState}, ${suggestedCountry}` : "";
  const suggestedAddress = suggestedStreetAddress || suggestedPlusCodeAddress;

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
      paddingTop: "10px",
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
      paddingTop: "10px",
      paddingBottom: "0px",
      margin: "0px",
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

  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
      setImagesEdited(true);
    }
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const dataTransfer = new DataTransfer();
    Array.from(images).forEach(image => dataTransfer.items.add(image));
    Array.from(e.dataTransfer.files).forEach(image => dataTransfer.items.add(image));
    const input = document.querySelector(".dropBox input");
    input.files = dataTransfer.files;
    setImages(dataTransfer.files);
    setImagesEdited(true);
  };

  const preventSymbols = (e) => {
    setOldPrice(onchangePrice);
    const number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const forbiddenChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
    if (!number.map(number => `Digit${number}`).includes(e.code) && e.code !== "Period") {
      e.preventDefault();
    }
    if (forbiddenChars.includes(e.key)) {
      e.preventDefault();
    }
    if ((!onchangePrice || onchangePrice.includes(".")) && e.code === "Period") {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});

    const spot = {
      address: `${address}${address2 ? ` | ${address2}` : ""}`,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price: +price
    };

    if (!Object.values(availabilityErrors).length && !Object.values(validationErrors).flat().length) {
      if (type === "edit") {
        setPopupContent(<Loader text={"Place is being updated..."} />);
        return dispatch(spotActions.editSpot(spot, spotId))
          .then(() => dispatch(spotActions.removeImages(imagesToDelete)))
          .then(() => {
            if (images.length) {
              if (preview >= 0) {
                return dispatch(spotActions.addNewImages(spotId, images, preview))
              } else {
                return dispatch(spotActions.addNewImages(spotId, images))
              }
            }
          })
          .then(() => {
            if (preview < 0) {
              return dispatch(spotActions.setPreviewImage(imagesToKeep[-preview - 1].id))
            }
          })
          .then(() => setPopupContent(null))
          .then(() => history.push(`/spots/${spotId}`))
          .catch(
            async (res) => {
              setPopupContent(null)
              const data = await res.json();
              if (data && data.errors) {
                setServerErrors(data.errors);
              } else {
                history.replace(`/error/${res.status}`);
              }
              // TO DO: Restore the spot
            }
          )
      } else {
        setPopupContent(<Loader text={"Place is being created..."} />);
        return dispatch(spotActions.addSpot(spot, images, preview))
          .then((spotId) => history.push(`/spots/${spotId}`))
          .then(() => setPopupContent(null))
          .catch(
            async (res) => {
              setPopupContent(null)
              const data = await res.json();
              if (data && data.errors) {
                setServerErrors(data.errors);
                await dispatch(spotActions.removeNewSpot(res.url.split("/")[5]));
              } else {
                history.replace(`/error/${res.status}`);
              }
            }
          );
      }
    }
  }

  useEffect(() => {
    const reviewImages = document.querySelectorAll(".previewBox img");
    if (reviewImages.length) {
      reviewImages.forEach(image => {
        image.addEventListener("error", (e) => {
          e.target.src = "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/public/imageNotFound-svg.png"
          e.onerror = null
        })
      })
    }
  })

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
    const validTypes = ["street_address", "premise", "subpremise", "plus_code", "natural_feature", "floor", "room"];
    if ((geocode && !geocode.address_types.find(type => validTypes.includes(type)) && !suggestedStreetNumber && !suggestedPlusCode) || (suggestedAddress && suggestedAddress.toLowerCase() !== `${address}, ${city}, ${state}, ${country}`.toLowerCase()) || !suggestedAddress) {
      setExactLocation(false);
    } else {
      setExactLocation(true);
    }
  }, [geocode, address, city, state, country]);

  useEffect(() => {
    const errors = {};

    if (countryEdited && !country) errors.country = "Country is required";
    if (stateEdited && !state) errors.state = "State is required";
    if (cityEdited && !city) errors.city = "City is required";
    if (addressEdited && !address) errors.address = "Street address is required";
    if (descriptionEdited && !description) errors.description = "Description is required";
    if (nameEdited && !name) errors.name = "Name is required";
    if (priceEdited && !price) errors.price = "Price is required";
    if (imagesEdited && !imagesNum) errors.images = "At least 5 photos are required";
    if (imagesNum && imagesNum < 5) errors.images = (`At least ${5 - imagesNum} more ${imagesNum === 4 ? "photo is" : "photos are"} required`);

    setAvailabilityErrors(errors);
  }, [country, countryEdited, state, stateEdited, city, cityEdited, address, addressEdited, description, descriptionEdited, name, nameEdited, price, priceEdited, images, imagesEdited, imagesToKeep]);

  useEffect(() => {
    const errors = { address: [], address2: [], description: [], name: [], price: [], images: [] };

    if (address && address.length > 200) errors.address.push("Street address must be at most 200 characters long");

    if (address2 && address2.length > 50) errors.address2.push("Apt, suite, or unit must be at most 50 characters long");

    if (description && description.length < 30) errors.description.push("Description must be at least 30 characters long");

    if (name && name.length > 50) errors.name.push("Place title must be at most 50 characters long");

    if (price && price <= 0) errors.price.push("Price must be greater than 0");

    if (images && Array.from(images).find(image => !image.type.startsWith("image"))) errors.images.push("Only image files are accepted")

    setValidationErrors(errors);
  }, [address, address2, description, name, price, images]);

  useEffect(() => {
    const start = -imagesToKeep.length;
    const end = images.length - 1;
    if (preview < start) {
      setPreview(start);
    } else if (preview > end) {
      setPreview(end);
    }
  }, [imagesToKeep, images]);

  if (!user) {
    return history.replace("/error/401");
  } else if (spot && spot.ownerId !== user.id) {
    return history.replace("/error/403");
  }

  return (
    <div className="createSpotForm">
      <h1>{type === "edit" ? "Update Your Place" : "Create New Place"}</h1>
      <form className="createSpotForm" onSubmit={handleSubmit}>
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
              autoComplete="one-time-code"
            />
          </div>
          <div className="errorMessage">
            {serverErrors.country && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.country}</p>}
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
              autoComplete="one-time-code"
            />
          </div>
          <div className="errorMessage">
            {serverErrors.state && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.state}</p>}
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
              autoComplete="one-time-code"
            />
          </div>
          <div className="errorMessage">
            {serverErrors.city && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.city}</p>}
            {availabilityErrors.city && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.city}</p>}
          </div>
          <div className={`inputBox ${availabilityErrors.address || (validationErrors.address && validationErrors.address.length) || serverErrors.address ? "error" : ""}`}>
            <label htmlFor="address">Street Address</label>
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
              autoComplete="one-time-code"
            />
          </div>
          <div className="errorMessage">
            {serverErrors.address && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.address}</p>}
            {availabilityErrors.address && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.address}</p>}
            {validationErrors.address && validationErrors.address.length > 0 && validationErrors.address.map(error => (
              <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
            ))}
          </div>
          <div className={`inputBox ${(validationErrors.address2 && validationErrors.address2.length) || serverErrors.address ? "error" : ""}`}>
            <label htmlFor="address2">Apt, Suite, or Unit (Optional)</label>
            <input
              name="address2"
              type="text"
              value={address2}
              onChange={(e) => {
                setAddress2(e.target.value);
              }}
              autoComplete="one-time-code"
            />
          </div>
          <div className="errorMessage">
            {serverErrors.address && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.address}</p>}
            {validationErrors.address2 && validationErrors.address2.length > 0 && validationErrors.address2.map(error => (
              <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
            ))}
          </div>
          {address && city && state && country && suggestedAddress && suggestedCountry in geolocation && suggestedState in geolocation[suggestedCountry] && geolocation[suggestedCountry][suggestedState].includes(suggestedCity) && !exactLocation && suggestedAddress.toLowerCase() !== `${address}, ${city}, ${state}, ${country}`.toLowerCase() ?
            <div className="addressSuggestion">
              <span>Suggested Address: {suggestedAddress}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setAddress(suggestedPlusCode ? suggestedPlusCode : `${suggestedStreetNumber} ${suggestedStreet}`);
                  setOnchangeAddress(suggestedPlusCode ? suggestedPlusCode : `${suggestedStreetNumber} ${suggestedStreet}`);
                  setCity(suggestedCity);
                  setState(suggestedState);
                  setCountry(suggestedCountry);
                }}
              >Use Suggested Address</button>
            </div>
            : null
          }
          {address && city && state && country && <MapContainer address={address} city={city} state={state} country={country} exactLocation={exactLocation} options={type === "edit" ? { setLat: existingLat, setLng: existingLng, marker: true, overlay: true, spot } : undefined} />}
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
              autoComplete="one-time-code"
            />
          </div>
          <div className="errorMessage">
            {serverErrors.description && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.description}</p>}
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
              autoComplete="one-time-code"
            />
          </div>
          <div className="errorMessage">
            {serverErrors.name && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.name}</p>}
            {availabilityErrors.name && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.name}</p>}
            {validationErrors.name && validationErrors.name.length > 0 && validationErrors.name.map(error => (
              <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
            ))}
          </div>
        </div>
        <div className="priceSection">
          <h2>Set a base price for your place</h2>
          <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
          <div className={`inputBox ${availabilityErrors.price || (validationErrors.price && validationErrors.price.length) || serverErrors.price ? "error" : ""}`}>
            <label htmlFor="price">{"Price per Night (USD)"}</label>
            <input
              name="price"
              type="text"
              value={`$ ${onchangePrice}`}
              onChange={(e) => {
                setOnchangePrice(e.target.value.slice(2));
              }}
              onBlur={(e) => {
                setPriceEdited(true);
                setOnchangePrice(e.target.value.slice(2));
                setPrice(e.target.value.slice(2));
              }}
              onKeyPress={preventSymbols}
              autoComplete="one-time-code"
            />
          </div>
          <div className="errorMessage">
            {serverErrors.price && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.price}</p>}
            {availabilityErrors.price && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.price}</p>}
            {validationErrors.price && validationErrors.price.length > 0 && validationErrors.price.map(error => (
              <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
            ))}
          </div>
        </div>
        <div className="imageSection">
          <h2>Liven up your place with photos</h2>
          <p>Upload at least 5 photos to publish your place.</p>
          <div
            className={`dropBox ${availabilityErrors.images || (validationErrors.images && validationErrors.images.length) || serverErrors.images ? "error" : ""}`}
            onDragEnter={handleDrag}
          >
            <input
              ref={ref}
              type="file"
              className="fileUpload"
              accept="image/*"
              multiple={true}
              name="images"
              onChange={(e) => {
                const dataTransfer = new DataTransfer();
                Array.from(images).forEach(image => dataTransfer.items.add(image));
                Array.from(e.target.files).forEach(image => dataTransfer.items.add(image));
                e.target.files = dataTransfer.files;
                setImages(e.target.files);
                setImagesEdited(true);
              }}
            />
            <label htmlFor="images" className={`fileUpload ${dragActive ? "dragActive" : ""}`}>
              <span>Drag your photos here to start uploading</span>
              <span>— OR —</span>
              <button
                className="uploadButton"
                onClick={(e) => {
                  e.preventDefault();
                  ref.current.click();
                  setImagesEdited(true);
                }}>
                Browse photos
              </button>
            </label>
            {dragActive && <div id="dragFileElement" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
          </div>
          <div className="errorMessage">
            {serverErrors.images && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.images}</p>}
            {serverErrors.preview && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.preview}</p>}
            {availabilityErrors.images && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.images}</p>}
            {validationErrors.images && validationErrors.images.length > 0 && validationErrors.images.map(error => (
              <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
            ))}
          </div>
          {imagesNum ? <span className="previewTitle">Selected Photos:</span> : null}
          <div className="previewSection">
            {imagesToKeep.map((image, i) => {
              const imageUrl = image.url.split("/");
              const imageName = imageUrl[imageUrl.length - 1];
              return (
                <div className="previewBox" key={-i - 1}>
                  <img
                    className={`preview ${preview === -i - 1 ? "spotPreview" : ""}`}
                    src={image.url}
                    alt={imageName}
                    onClick={(e) => {
                      e.preventDefault();
                      setPreview(-i - 1)
                    }}
                  />
                  {preview === -i - 1 ? <div className="previewMark">Preview</div> : null}
                  <div className="previewButtons">
                    <span className="fileName">{imageName}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setImagesToKeep((prev) => {
                          const imageList = [...prev];
                          imageList.splice(i, 1);
                          return imageList;
                        });
                        setImagesToDelete((prev) => {
                          let imageList = [...prev];
                          imageList.push(image.id);
                          return imageList;
                        });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
            {Array.from(images).map((image, i) => {
              return (
                <div className="previewBox" key={i}>
                  <img
                    className={`preview ${preview === i ? "spotPreview" : ""}`}
                    src={URL.createObjectURL(image)}
                    alt={image.name}
                    onClick={(e) => {
                      e.preventDefault();
                      setPreview(i)
                    }}
                  />
                  {preview === i ? <div className="previewMark">Preview</div> : null}
                  <div className="previewButtons">
                    <span className="fileName">{image.name}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const dataTransfer = new DataTransfer();
                        Array.from(images).forEach(file => {
                          if (file.name !== image.name) {
                            dataTransfer.items.add(file)
                          }
                        });
                        const input = document.querySelector(".dropBox input");
                        input.files = dataTransfer.files;
                        setImages(input.files);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="submitButtons">
          <button
            type="submit"
            disabled={Object.values(availabilityErrors).length || Object.values(validationErrors).flat().length || !countryEdited || !stateEdited || !cityEdited || !addressEdited || !lat || !lng || !descriptionEdited || !nameEdited || !priceEdited || !imagesEdited}
          >
            {type === "edit" ? "Update Spot" : "Create Spot"}
          </button>
        </div>
      </form>
    </div>
  )
}
