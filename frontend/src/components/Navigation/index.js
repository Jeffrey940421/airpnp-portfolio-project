import React from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { ProfileButton } from './ProfileButton';
import logo from "../../assets/logo/logo.svg";
import './Navigation.css';
import Select from 'react-select';
import placeData from '../../utils/placeObj.json'
import places from '../../utils/placeArr.json'
import Calendar from 'react-calendar';
import { franc, francAll } from 'franc'
import * as spotActions from "../../store/spots";
import { Filter } from '../Filter';
import { useModal } from '../../context/Modal';
import avatar from "../../assets/avatar.jpg"

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
  const dispatch = useDispatch();
  const { setModalContent, setOnModalClose } = useModal();
  const user = useSelector(state => state.session.user);
  const location = useLocation();
  const query = location.search;
  const params = new URLSearchParams(query);
  const spots = useSelector(state => state.spots.spotList);
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
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");
  const [minLat, setMinLat] = useState(params.get("minLat") || "");
  const [maxLat, setMaxLat] = useState(params.get("maxLat") || "");
  const [minLng, setMinLng] = useState(params.get("minLng") || "");
  const [maxLng, setMaxLng] = useState(params.get("maxLng") || "");
  const sortMethods = [
    { text: "Default", sort: "", order: "" },
    { text: "Price (Low to High)", sort: "price", order: "ASC NULLS FIRST" },
    { text: "Price (High to Low)", sort: "price", order: "DESC NULLS LAST" },
    { text: "Top Reviewed", sort: "avgRating", order: "DESC NULLS LAST" },
    { text: "Most Reviewed", sort: "numReviews", order: "DESC NULLS LAST" },
    { text: "Most Popular", sort: "popularity", order: "DESC NULLS LAST" },
  ]
  const [sort, setSort] = useState(params.get("sort") || "");
  const [order, setOrder] = useState(params.get("order") || "");
  const [sortIdx, setSortIdx] = useState(sortMethods.findIndex((method) => method.sort === sort && method.order === order) === -1 ? 0 : sortMethods.findIndex((method) => method.sort === sort && method.order === order));
  const [showSortOptions, setShowSortOptions] = useState(false);
  const sortButtonRef = React.useRef();
  const sortDropdownRef = React.useRef();
  const [filterNum, setFilterNum] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

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

  function getSearchQuery() {
    let newCheckout
    if (checkin && !checkout) {
      newCheckout = new Date(new Date(changeDateFormat(checkin)).setDate(new Date(changeDateFormat(checkin)).getDate() + 1))
      setCheckout(dateToString(newCheckout))
      setRange([new Date(changeDateFormat(checkin)), newCheckout])
      setSelectRange(false)
    }
    setOnchangeDestination(destination)
    return `?country=${country}&state=${state}&city=${city}&start=${checkin}&end=${checkout || (newCheckout ? dateToString(newCheckout) : "")}&keyword=${keyword}&language=${language}`
  }

  const getFilterQuery = () => {
    return `&minPrice=${minPrice}&maxPrice=${maxPrice}&minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`
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
    let i = 0
    if (minPrice || maxPrice) {
      i += 1
    }
    if (minLat || maxLat) {
      i += 1
    }
    if (minLng || maxLng) {
      i += 1
    }
    setFilterNum(i)
  }, [minPrice, maxPrice, minLat, maxLat, minLng, maxLng])

  useEffect(() => {
    if (destination) {
      if (placeData[destination].type === "city") {
        setCity(placeData[destination].city)
        setState(placeData[destination].state)
        setCountry(placeData[destination].country)
      } else if (placeData[destination].type === "state") {
        setState(placeData[destination].state)
        setCountry(placeData[destination].country)
        setCity("")
      } else if (placeData[destination].type === "country") {
        setCountry(placeData[destination].country)
        setState("")
        setCity("")
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
      setMinPrice("")
      setMaxPrice("")
      setMinLat("")
      setMaxLat("")
      setMinLng("")
      setMaxLng("")
      setSort("")
      setOrder("")
      setSortIdx(0)
    } else {
      setOnchangeDestination(convertToDestination(params.get("city"), params.get("state"), params.get("country")))
      setDestination(convertToDestination(params.get("city"), params.get("state"), params.get("country")))
      setCountry(params.get("country") || "")
      setState(params.get("state") || "")
      setCity(params.get("city") || "")
      setCheckin(params.get("start") || "")
      setCheckout(params.get("end") || "")
      setKeyword(params.get("keyword") || "")
      setRange(params.get("start") && params.get("end") ? [new Date(changeDateFormat(params.get("start"))), new Date(changeDateFormat(params.get("end")))] : "")
      setSelectRange(false)
      setMinPrice(params.get("minPrice") || "")
      setMaxPrice(params.get("maxPrice") || "")
      setMinLat(params.get("minLat") || "")
      setMaxLat(params.get("maxLat") || "")
      setMinLng(params.get("minLng") || "")
      setMaxLng(params.get("maxLng") || "")
      setSort(params.get("sort") || "")
      setOrder(params.get("order") || "")
      setSortIdx(sortMethods.findIndex((method) => method.sort === params.get("sort") && method.order === params.get("order")) === -1 ? 0 : sortMethods.findIndex((method) => method.sort === params.get("sort") && method.order === params.get("order")))
    }
  }, [query])

  useEffect(() => {
    const closeSort = (e) => {
      e.stopPropagation();
      if (!sortButtonRef.current.contains(e.target) && !sortDropdownRef.current.contains(e.target)) {
        setShowSortOptions(false);
      }
    }

    if (showSortOptions) {
      document.addEventListener('click', closeSort);
    }

    return () => document.removeEventListener("click", closeSort);
  }, [showSortOptions]);

  return (
    <>
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
                        <div className="noOption">
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
                      history.push(`${getSearchQuery()}${getFilterQuery()}&sort=${sort}&order=${order}`)
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
      </ul>
      {
        isLoaded && location.pathname === "/" ? (
          <div className='subNavigationBar'>
            <div className='floatButtons'>
              <button
                className='sort'
                onClick={() => setShowSortOptions(!showSortOptions)}
                ref={sortButtonRef}
              >
                <i className="fa-solid fa-arrow-up-wide-short" /> Sort
              </button>
              <button
                className={`filter${filterNum ? " active" : ""}`}
                onClick={async () => {
                  await dispatch(spotActions.listPrices(getSearchQuery()))
                  setModalContent(<Filter filters={{ minPrice, setMinPrice, maxPrice, setMaxPrice, minLat, setMinLat, maxLat, setMaxLat, minLng, setMinLng, maxLng, setMaxLng }} searchQuery={getSearchQuery()} sort={sort} order={order} />)
                }}
              >
                <i className="fa-solid fa-sliders" /> Filters
              </button>
              {
                filterNum ?
                  <div className='filterNum'>
                    {filterNum}
                  </div> :
                  null
              }
              <div className={`sortOptions${showSortOptions ? "" : " hide"}`} ref={sortDropdownRef}>
                {
                  sortMethods.map((method, idx) => {
                    return (
                      <div
                        className={`sortOption${sortIdx === idx ? " selectedOption" : ""}`}
                        onClick={() => {
                          setSort(method.sort)
                          setOrder(method.order)
                          setSortIdx(idx)
                          setShowSortOptions(false)
                          history.push(`${getSearchQuery()}${getFilterQuery()}&sort=${method.sort}&order=${method.order}`)
                        }}
                      >
                        {method.text}
                      </div>
                    )
                  })
                }
              </div>
            </div>
            <div className='aboutDeveloper'>
              <h5>Meet<br></br>Developer</h5>
              <div
                className='personalInfo'
                onClick={() => setShowInfo(!showInfo)}
              >
                <div className='avatar'>
                  <img src={avatar} alt="avatar" />
                </div>
                <div className='info'>
                  <p>Jeffrey Zhang</p>
                  <p>{showInfo ? "Hide Info <<" : "More Info >>"}</p>
                </div>
              </div>
              <div className={`contactInfo${showInfo ? "" : " hide"}`}>
                  <a
                    className='github'
                    href="https://github.com/Jeffrey940421"
                  >
                    <i className="fa-brands fa-github" />
                  </a>
                  <a
                    className='linkedin'
                    href="https://www.linkedin.com/in/jeffrey-zhang-usc/"
                  >
                    <i className="fa-brands fa-linkedin" />
                  </a>
                  <a
                    className='email'
                    href='mailto: jeffrey940421@gmail.com'
                  >
                    <i className="fa-solid fa-envelope" />
                  </a>
                  <a
                    className='portfolio'
                    href='https://portfolio.jeffreyzhang.codes/'
                  >
                    <i className="fa-solid fa-laptop-code" />
                  </a>
                </div>
            </div>
          </div>
        ) :
          null
      }
    </>
  );
}
