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


export function Navigation({ isLoaded }) {
  const history = useHistory();
  const user = useSelector(state => state.session.user);
  const location = useLocation();
  const [destination, setDestination] = useState("");
  const [onchangeDestination, setOnchangeDestination] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const destinationRef = React.useRef();
  const resultLimit = 10
  const filteredPlaces = places.filter((place) => place.toLowerCase().includes(onchangeDestination.toLowerCase()))

  useEffect(() => {
    if (!onchangeDestination) {
      setShowDropdown(false);
    }
  }, [onchangeDestination]);

  useEffect(() => {
    const closeMenu = (e) => {
      if (!destinationRef.current.contains(e.target)) {
        setShowDropdown(false);
        if (filteredPlaces.length) {
          setDestination(filteredPlaces[0])
        }
      }
    }

    if (showDropdown) {
      document.addEventListener('click', closeMenu);
    }

    return () => document.removeEventListener("click", closeMenu);
  }, [showDropdown]);

  useEffect(() => {
    if (destination) {
      const type = placeData[destination].type
      if (type === "city") {
        setCity(placeData[destination].city)
        setState(placeData[destination].state)
        setCountry(placeData[destination].country)
      } else if (type === "state") {
        setState(placeData[destination].state)
        setCountry(placeData[destination].country)
      } else if (type === "country") {
        setCountry(placeData[destination].country)
      }
    }
  }, [destination]);

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
                placeholder="Where"
                value={onchangeDestination}
                onChange={(e) => {
                  setOnchangeDestination(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => {
                  if (!(onchangeDestination in placeData)) {
                    setShowDropdown(true)
                  }
                }}
              />
              <div className={`dropdownOptions${showDropdown ? "" : " hide"}`}>
                {
                  filteredPlaces.length ?
                    filteredPlaces
                      .slice(0, resultLimit)
                      .map((place) => {
                        return (
                          <div className="dropdownOption" onClick={() => {
                            setOnchangeDestination(place)
                            setDestination(place)
                            setShowDropdown(false)
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
            <button
              onClick={() => {
                history.push(`?country=${country}&state=${state}&city=${city}`)
              }}
            >
              search
            </button>
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
  );
}
