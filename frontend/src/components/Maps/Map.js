import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getGeocode } from '../../store/maps';
import { useDispatch } from 'react-redux';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const Maps = ({ apiKey, address, city, state, country, latitude, longitude }) => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const dispatch = useDispatch();

  console.log(address, city, state, country, latitude, longitude)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    (async () => {
      if (address && city && state && country) {
        const result = await dispatch(getGeocode(address, city, state, country, apiKey));
        const geometry = result.geocode.geometry.location;
        setLat(geometry.lat);
        setLng(geometry.lng);
      }
    })()
  }, [address, city, state, country]);


  useEffect(() => {
    if (latitude && longitude) {
      setLat(+latitude);
      setLng(+longitude);
    }
  }, [latitude, longitude]);

  return (
    <>
      {isLoaded && lng && lat && (
        <GoogleMap
          mapContainerClassName='googleMap'
          mapContainerStyle={containerStyle}
          center={{ lat, lng }}
          zoom={17}
        >
          <Marker
            position={{ lat, lng }}
            draggable={true}
            onDragEnd={(coord, index) => {
              const {latLng} = coord;
              const lat = latLng.lat;
              const lng = latLng.lng;
              setLat(lat);
              setLng(lng);
              console.log(coord);
            }}
          />
        </GoogleMap>
      )}
    </>
  );
};

export default React.memo(Maps);
