import React from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { ProfileButton } from './ProfileButton';
import logo from "../../assets/logo/logo.svg";
import './Navigation.css';
import Select from 'react-select';
import placeData from '../../utils/placeObj.json'
import places from '../../utils/placeArr.json'
import Calendar from 'react-calendar';
import { franc, francAll } from 'franc'

export function Navigation({ isLoaded }) {
  const convertToDestination = (city, state, country) => {
    if (city && state && country) {
      return `${city}, ${state}, ${country}`
    } else if (!city && state && country) {
      return `${state}, ${country}`
    } else if (!city && !state && country) {
      return `${country}`
    } else {
      return ""
    }
  }
  const dateToString = (dateObj) => {
    return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")}`
  }

  const changeDateFormat = (dateStr) => {
    return dateStr.split("-").join("/");
  }

  const history = useHistory();
  const user = useSelector(state => state.session.user);
  const location = useLocation();
  const query = location.search;
  const params = new URLSearchParams(query);
  const [destination, setDestination] = useState(convertToDestination(params.get("city"), params.get("state"), params.get("country")));
  const [onchangeDestination, setOnchangeDestination] = useState(convertToDestination(params.get("city"), params.get("state"), params.get("country")));
  const [country, setCountry] = useState(params.get("country") || "");
  const [state, setState] = useState(params.get("state") || "");
  const [city, setCity] = useState(params.get("city") || "");
  const [checkin, setCheckin] = useState(params.get("start") || "");
  const [checkout, setCheckout] = useState(params.get("end") || "");
  const [checkinFocus, setCheckinFocus] = useState(false);
  const [checkoutFocus, setCheckoutFocus] = useState(false);
  const datesRef = React.useRef();
  const [selectRange, setSelectRange] = useState(false);
  const [range, setRange] = useState(params.get("start") && params.get("end") ? [new Date(changeDateFormat(params.get("start"))), new Date(changeDateFormat(params.get("end")))] : "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [keyword, setKeyword] = useState(params.get("keyword") || "");
  const [language, setLanguage] = useState(params.get("language") || "english");
  const supportLanguages = [
    "simple",
    "arabic",
    "armenian",
    "basque",
    "catalan",
    "danish",
    "dutch",
    "english",
    "finnish",
    "french",
    "german",
    "greek",
    "hindi",
    "hungarian",
    "indonesian",
    "irish",
    "italian",
    "lithuanian",
    "nepali",
    "norwegian",
    "portuguese",
    "romanian",
    "russian",
    "serbian",
    "spanish",
    "swedish",
    "tamil",
    "turkish",
    "yiddish"
  ]
  const calendarRef = React.useRef();
  const destinationRef = React.useRef();
  const keywordRef = React.useRef();
  const resultLimit = 10
  const filteredPlaces = places.filter((place) => place.toLowerCase().includes(onchangeDestination.toLowerCase()))


  function tileDisabled({ date, view }) {
    if (view === 'month') {
      // if selecting start date
      if (!selectRange) {
        return date < new Date(new Date().setHours(0, 0, 0, 0));
        // if selecting end date
      } else {
        return date <= new Date(changeDateFormat(checkin)) || date <= new Date(new Date().setHours(0, 0, 0, 0));
      }
    }
  }

  function onChange(newRange) {
    if (Array.isArray(newRange)) {
      setCheckin(dateToString(newRange[0]))
      setCheckout(dateToString(newRange[1]))
      setSelectRange(false)
      setCheckoutFocus(false)
      keywordRef.current.focus()
      setShowCalendar(false)
    } else {
      setCheckin(dateToString(newRange))
      setCheckout("")
      setSelectRange(true)
      setCheckinFocus(false)
      setCheckoutFocus(true)
    }
    setRange(newRange);
  }

  useEffect(() => {
    if (!onchangeDestination) {
      setShowDropdown(false);
    }
  }, [onchangeDestination]);

  useEffect(() => {
    const closeMenu = (e) => {
      e.stopPropagation();
      if (!destinationRef.current.contains(e.target)) {
        setShowDropdown(false);
        if (filteredPlaces.length) {
          setOnchangeDestination(filteredPlaces[0])
        } else {
          setOnchangeDestination("")
        }
      }
    }

    if (showDropdown) {
      document.addEventListener('click', closeMenu);
    }

    return () => document.removeEventListener("click", closeMenu);
  }, [showDropdown, filteredPlaces]);

  useEffect(() => {
    const closeCalendar = (e) => {
      e.stopPropagation();
      if (datesRef.current && !datesRef.current.contains(e.target) && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
        setCheckinFocus(false);
        setCheckoutFocus(false);
        if (checkin && !checkout) {
          const newCheckout = new Date(new Date(changeDateFormat(checkin)).setDate(new Date(changeDateFormat(checkin)).getDate() + 1))
          setCheckout(dateToString(newCheckout))
          setRange([new Date(changeDateFormat(checkin)), newCheckout])
          setSelectRange(false)
        }
      }
    }

    document.addEventListener('click', closeCalendar);

    return () => document.removeEventListener("click", closeCalendar);
  }, [showCalendar, checkin, checkout]);

  useEffect(() => {
    if (destination) {
      if (placeData[destination].type === "city") {
        setCity(placeData[destination].city)
        setState(placeData[destination].state)
        setCountry(placeData[destination].country)
      } else if (placeData[destination].type === "state") {
        setState(placeData[destination].state)
        setCountry(placeData[destination].country)
      } else if (placeData[destination].type === "country") {
        setCountry(placeData[destination].country)
      }
    } else {
      setCity("")
      setState("")
      setCountry("")
    }
  }, [destination]);

  useEffect(() => {
    setCheckinFocus(false);
    setCheckoutFocus(false);
    setShowCalendar(false);
    setShowDropdown(false);
    if (!query) {
      setOnchangeDestination("")
      setDestination("")
      setCountry("")
      setState("")
      setCity("")
      setCheckin("")
      setCheckout("")
      setKeyword("")
      setRange("")
      setSelectRange(false)
    }
  }, [query])

  return (
    <ul className='navigationBar'>
      <li className='logo'>
        <NavLink exact to="/"><img className="logo" src={logo} alt="logo" /></NavLink>
      </li>
      {
        isLoaded && location.pathname === "/" ? (
          <div className="searchBar">
            <div
              className="destination"
              ref={destinationRef}
            >
              <label htmlFor="destination">Where</label>
              <input
                name='destination'
                type="text"
                placeholder="Search Destinations"
                value={onchangeDestination}
                onChange={(e) => {
                  setOnchangeDestination(e.target.value)
                  setShowDropdown(true)
                  const filteredPlaces = places.filter((place) => place.toLowerCase().includes(e.target.value.toLowerCase()))
                  if (filteredPlaces.length && e.target.value) {
                    setDestination(filteredPlaces[0])
                  } else {
                    setDestination("")
                  }
                }}
                onFocus={() => {
                  if (!(onchangeDestination in placeData) && onchangeDestination) {
                    setShowDropdown(true)
                  }
                }}
                autoComplete="one-time-code"
              />
              <div className={`dropdownOptions${showDropdown ? "" : " hide"}`}>
                <div>
                  {
                    filteredPlaces.length ?
                      filteredPlaces
                        .slice(0, resultLimit)
                        .map((place) => {
                          return (
                            <div className="dropdownOption" onClick={(e) => {
                              e.stopPropagation()
                              setOnchangeDestination(place)
                              setDestination(place)
                              setShowDropdown(false)
                              setShowCalendar(true)
                              if (!range || Array.isArray(range)) {
                                setCheckinFocus(true)
                                setCheckoutFocus(false)
                              } else {
                                setCheckoutFocus(true)
                                setCheckinFocus(false)
                              }
                            }}>
                              {place}
                            </div>
                          )
                        }) :
                      <div className="dropdownOption">
                        No results
                      </div>
                  }
                </div>
              </div>
            </div>
            <div
              className="dates"
              ref={datesRef}
              onClick={(e) => {
                if (!calendarRef.current.contains(e.target)) {
                  setShowCalendar(true)
                  if (!range || Array.isArray(range)) {
                    setCheckinFocus(true)
                    setCheckoutFocus(false)
                  } else {
                    setCheckoutFocus(true)
                    setCheckinFocus(false)
                  }
                }
              }}
            >
              <div className='checkin'>
                <button></button>
                <label htmlFor="checkin">Checkin</label>
                <input
                  className={checkinFocus ? "dateFocused" : ""}
                  name='checkin'
                  type="text"
                  placeholder="Add dates"
                  autoComplete="one-time-code"
                  value={checkin ? `${checkin.split("-")[1]}/${checkin.split("-")[2]}/${checkin.split("-")[0]}` : ""}
                  onChange={(e) => setCheckin(e.target.value)}
                  disabled={true}
                />
              </div>
              <div className='checkout'>
                <button></button>
                <label htmlFor="checkout">Checkout</label>
                <input
                  className={checkoutFocus ? "dateFocused" : ""}
                  name='checkout'
                  type="text"
                  placeholder="Add dates"
                  autoComplete="one-time-code"
                  value={checkout ? `${checkout.split("-")[1]}/${checkout.split("-")[2]}/${checkout.split("-")[0]}` : ""}
                  onChange={(e) => setCheckout(e.target.value)}
                  disabled={true}
                />
              </div>
              <div className={`searchCalendar${showCalendar ? "" : " hide"}`} ref={calendarRef}>
                <Calendar
                  onChange={onChange}
                  value={range}
                  minDetail="month"
                  tileDisabled={tileDisabled}
                  selectRange={selectRange}
                  showNeighboringMonth={false}
                  onClickDay={(value, e) => {
                    if (!range) {
                      setCheckin(dateToString(value))
                      setCheckout("")
                      setSelectRange(true)
                    } else if (typeof range.getMonth === "function") {
                      setCheckout(dateToString(value))
                      setSelectRange(false)
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setCheckin("")
                    setCheckout("")
                    setSelectRange(false)
                    setRange("")
                    setCheckinFocus(true)
                    setCheckoutFocus(false)
                  }}
                >
                  Clear Dates
                </button>
              </div>
            </div>
            <div className='keyword'>
              <label htmlFor="keyword">Keyword</label>
              <input
                ref={keywordRef}
                name='keyword'
                type="text"
                placeholder="Search Keywords"
                autoComplete="one-time-code"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  const languageCode = franc(e.target.value, { minLength: 3 })
                  const languageNames = new Intl.DisplayNames(['en'], {
                    type: 'language'
                  });
                  console.log()
                  if (supportLanguages.includes(languageNames.of(languageCode).toLowerCase())) {
                    setLanguage(languageNames.of(languageCode).toLowerCase())
                  } else {
                    setLanguage("english")
                  }
                }}
              />
              <div className='searchButton'>
                <button
                  onClick={() => {
                    let newCheckout
                    if (checkin && !checkout) {
                      newCheckout = new Date(new Date(changeDateFormat(checkin)).setDate(new Date(changeDateFormat(checkin)).getDate() + 1))
                      setCheckout(dateToString(newCheckout))
                      setRange([new Date(changeDateFormat(checkin)), newCheckout])
                      setSelectRange(false)
                    }
                    history.push(`?country=${country}&state=${state}&city=${city}&start=${checkin}&end=${checkout || (newCheckout ? dateToString(newCheckout) : "")}&keyword=${keyword}&language=${language}`)
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass" /> Search
                </button>
              </div>
            </div>

          </div>
        ) :
          <div></div>
      }
      {isLoaded && (
        <li className='profileSection'>
          <ProfileButton user={user} />
        </li>
      )}
      {
        isLoaded && location.pathname === "/" ? (
          <div className='floatButtons'>
            <button className='filter'>
              <i className="fa-solid fa-filter" />Filter
            </button>
            <button className='sort'>
            <i className="fa-solid fa-sort" />Sort
            </button>
          </div>
        ) :
          null
      }
    </ul>
  );
}
