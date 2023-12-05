import React from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';
import { useModal } from '../../context/Modal';
import "./Filter.css";

export function Filter({ filters, searchQuery, sort, order }) {
  const minSpotPrice = useSelector(state => +(state.spots.spotPrices.minPrice));
  const maxSpotPrice = useSelector(state => +(state.spots.spotPrices.maxPrice));
  const { minPrice, setMinPrice, maxPrice, setMaxPrice, minLat, setMinLat, maxLat, setMaxLat, minLng, setMinLng, maxLng, setMaxLng } = filters;
  const priceRangeMin = minPrice ? Math.min(+minSpotPrice, +minPrice, Math.max(+maxPrice - 50, 0), Math.max(+maxSpotPrice - 50, 0)) : Math.min(+minSpotPrice, Math.max(+maxSpotPrice - 50, 0));
  const priceRangeMax = maxPrice ? Math.max(+maxSpotPrice, +maxPrice, +minPrice + 50) : Math.max(+maxSpotPrice, +minSpotPrice + 50);
  const [onchangeMinPrice, setOnchangeMinPrice] = useState(minPrice ? +minPrice : priceRangeMin);
  const [onchangeMaxPrice, setOnchangeMaxPrice] = useState(maxPrice ? +maxPrice : priceRangeMax);
  const [onchangeMinLat, setOnchangeMinLat] = useState(minLat ? +minLat : -90);
  const [onchangeMaxLat, setOnchangeMaxLat] = useState(maxLat ? +maxLat : 90);
  const [onchangeMinLng, setOnchangeMinLng] = useState(minLng ? +minLng : -180);
  const [onchangeMaxLng, setOnchangeMaxLng] = useState(maxLng ? +maxLng : 180);
  const history = useHistory();
  const { closeModal } = useModal();
  const getFilterQuery = () => {
    return `&minPrice=${onchangeMinPrice == priceRangeMin && onchangeMaxPrice === priceRangeMax ? "" : onchangeMinPrice}&maxPrice=${onchangeMinPrice == priceRangeMin && onchangeMaxPrice === priceRangeMax ? "" : onchangeMaxPrice}&minLat=${onchangeMinLat == -90 ? "" : onchangeMinLat}&maxLat=${onchangeMaxLat == 90 ? "" : onchangeMaxLat}&minLng=${onchangeMinLng == -180 ? "" : onchangeMinLng}&maxLng=${onchangeMaxLng == 180 ? "" : onchangeMaxLng}`
  }

  return (
    <div className="filterContainer">
      <h2>Filters</h2>
      <div className='filterOptions'>
        <div className='priceFilter'>
          <h3>Price Range</h3>
          <p>Nightly prices before fees and taxes</p>
          <div className="filterRange">
            <div className='minValue'>
              <h4>Minimum Price</h4>
              <p>${onchangeMinPrice}</p>
            </div>
            <div className='hyphen'></div>
            <div className='maxValue'>
              <h4>Maximum Price</h4>
              <p>${onchangeMaxPrice}</p>
            </div>
          </div>
          <ReactSlider
            className="doubleSlider"
            thumbClassName="doubleSliderThumb"
            trackClassName="doubleSliderTrack"
            ariaLabel={['minThumb', 'maxThumb']}
            max={priceRangeMax}
            min={priceRangeMin}
            value={[onchangeMinPrice, onchangeMaxPrice]}
            renderThumb={(props, state) => <div {...props}></div>}
            onChange={(value, index) => {
              if (index === 0) {
                setOnchangeMinPrice(value[0]);
              } else {
                setOnchangeMaxPrice(value[1]);
              }
            }}
            pearling
            minDistance={1}
            step={1}
          />
        </div>
        <div className='latFilter'>
          <h3>Latitude Range</h3>
          <div className="filterRange">
            <div className='minValue'>
              <h4>Minimum Latitude</h4>
              <p>{onchangeMinLat}°</p>
            </div>
            <div className='hyphen'></div>
            <div className='maxValue'>
              <h4>Maximum Latitude</h4>
              <p>{onchangeMaxLat}°</p>
            </div>
          </div>
          <ReactSlider
            className="doubleSlider"
            thumbClassName="doubleSliderThumb"
            trackClassName="doubleSliderTrack"
            defaultValue={[minLat ? minLat : -90, maxLat ? maxLat : 90]}
            ariaLabel={['minThumb', 'maxThumb']}
            max={90}
            min={-90}
            value={[onchangeMinLat, onchangeMaxLat]}
            renderThumb={(props, state) => <div {...props}></div>}
            onChange={(value, index) => {
              if (index === 0) {
                setOnchangeMinLat(value[0]);
              } else {
                setOnchangeMaxLat(value[1]);
              }
            }}
            pearling
            minDistance={1}
          />
        </div>
        <div className='lngFilter'>
          <h3>Longitude Range</h3>
          <div className="filterRange">
            <div className='minValue'>
              <h4>Minimum Longitude</h4>
              <p>{onchangeMinLng}°</p>
            </div>
            <div className='hyphen'></div>
            <div className='maxValue'>
              <h4>Maximum Longitude</h4>
              <p>{onchangeMaxLng}°</p>
            </div>
          </div>
          <ReactSlider
            className="doubleSlider"
            thumbClassName="doubleSliderThumb"
            trackClassName="doubleSliderTrack"
            defaultValue={[minLng ? minLng : -180, maxLng ? maxLng : 180]}
            ariaLabel={['minThumb', 'maxThumb']}
            max={180}
            min={-180}
            value={[onchangeMinLng, onchangeMaxLng]}
            renderThumb={(props, state) => <div {...props}></div>}
            onChange={(value, index) => {
              if (index === 0) {
                setOnchangeMinLng(value[0]);
              } else {
                setOnchangeMaxLng(value[1]);
              }
            }}
            pearling
            minDistance={1}
          />
        </div>
      </div>
      <div className='filterButtons'>
        <button
          className='clearFilters'
          onClick={() => {
            setMinPrice("");
            setMaxPrice("");
            setMinLat("");
            setMaxLat("");
            setMinLng("");
            setMaxLng("");
            setOnchangeMinPrice(minSpotPrice);
            setOnchangeMaxPrice(maxSpotPrice);
            setOnchangeMinLat(-90);
            setOnchangeMaxLat(90);
            setOnchangeMinLng(-180);
            setOnchangeMaxLng(180);
            closeModal();
            history.push(`${searchQuery}`)
          }}
        >
          Clear Filters
        </button>
        <button
          className='applyFilters'
          onClick={() => {
            setMinPrice(onchangeMinPrice == priceRangeMin && onchangeMaxPrice === priceRangeMax ? "" : onchangeMinPrice);
            setMaxPrice(onchangeMinPrice == priceRangeMin && onchangeMaxPrice === priceRangeMax ? "" : onchangeMaxPrice);
            setMinLat(onchangeMinLat == -90 ? "" : onchangeMinLat);
            setMaxLat(onchangeMaxLat == 90 ? "" : onchangeMaxLat);
            setMinLng(onchangeMinLng == -180 ? "" : onchangeMinLng);
            setMaxLng(onchangeMaxLng == 180 ? "" : onchangeMaxLng);
            closeModal();
            history.push(`${searchQuery}${getFilterQuery()}&sort=${sort}&order=${order}`)
          }}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
