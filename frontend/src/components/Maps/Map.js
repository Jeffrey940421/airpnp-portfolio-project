import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
import { getGeocode, updateGeocode } from '../../store/maps';
import { useDispatch, useSelector } from 'react-redux';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const Maps = ({ apiKey, address, city, state, country, exactLocation }) => {
  const geocode = useSelector((state) => state.maps.geocode);
  const lat = geocode ? geocode.coord.lat : "";
  const lng = geocode ? geocode.coord.lng : "";

  const [position, setPosition] = useState({});
  const dispatch = useDispatch();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    setPosition({ lat, lng })
  }, [lat, lng]);

  useEffect(() => {
    dispatch(getGeocode(address, city, state, country, apiKey));
  }, [address, city, state, country]);

  useEffect(() => {
    if (lat && lng) {
      dispatch(updateGeocode(lat, lng, apiKey))
    }
  }, [lat, lng])

  return (
    <>
      {exactLocation ? null : (
        <p className='warningMessage'><i className="fa-sharp fa-solid fa-circle-exclamation" /> Cannot find the exact location of your place. Please check the address or locate your place on map </p>
      )}
      {isLoaded && lat && lng && (
        <GoogleMap
          mapContainerClassName='googleMap'
          mapContainerStyle={containerStyle}
          center={position}
          zoom={17}
        >
          <Marker
            position={position}
            draggable={!exactLocation}
            onDragEnd={async (coord) => {
              const { latLng } = coord;
              const newLat = latLng.lat();
              const newLng = latLng.lng();
              setPosition({ lat: newLat, lng: newLng });
              await dispatch(updateGeocode(newLat, newLng, apiKey));
            }}
          />
          <OverlayView
            position={position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={(x, y) => { return { x: -70, y: -100 } }} >
            <div
              style={{
                background: `white`,
                fontSize: '11px',
                color: `black`,
                borderRadius: '4px',
                padding: "10px"
              }}
            >
              Latitude: {lat.toFixed(7)}
              <br></br>
              Longitude: {lng.toFixed(7)}
            </div>
          </OverlayView>
        </GoogleMap>
      )}
    </>
  );
};

export default React.memo(Maps);
