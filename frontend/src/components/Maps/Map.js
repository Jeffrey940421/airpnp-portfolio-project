import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getGeocode } from '../../store/maps';
import { useDispatch } from 'react-redux';
import { set } from 'lodash';

const containerStyle = {
  width: '400px',
  height: '400px',
};

const Maps = ({ apiKey, address, city, state, country, latitude, longitude }) => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const dispatch = useDispatch();

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

      if (latitude && longitude) {
        setLat(+latitude);
        setLng(+longitude);
      }
    })()
  }, [address, city, state, country, latitude, longitude]);

  return (
    <>
      {isLoaded && lng && lat && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat, lng }}
          zoom={17}
        >
          <Marker position={{ lat, lng }} />
        </GoogleMap>
      )}
    </>
  );
};

export default React.memo(Maps);
