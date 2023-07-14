import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
import { getGeocode, updateGeocode } from '../../store/maps';
import { useDispatch, useSelector } from 'react-redux';

const Maps = ({ apiKey, address, city, state, country, exactLocation, options = { overlay: true, marker: true } }) => {
  const { setLat, setLng, width, height, zoom, onZoomChange, draggable, overlay, offsetX, offsetY, overlayStyle, overlayContent, icon, marker } = options;

  const geocode = useSelector((state) => state.maps.geocode);
  const lat = setLat ? setLat : geocode ? geocode.coord.lat : "";
  const lng = setLng ? setLng : geocode ? geocode.coord.lng : "";
  const [map, setMap] = useState(null);

  const containerStyle = {
    width: width || '100%',
    height: height || '400px'
  };

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
    if (address, city, state, country) {
      dispatch(getGeocode(address, city, state, country, apiKey));
    }
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
          onLoad={map => setMap(map)}
          mapContainerClassName='googleMap'
          mapContainerStyle={containerStyle}
          center={position}
          zoom={zoom ? zoom : 17}
          onZoomChanged={() => {
            if (map) {
              const zoom = map.getZoom();
              if (typeof onZoomChange === "function") {
                onZoomChange(zoom);
              }
            }
          }}
        >
          {marker ? <Marker
            position={position}
            icon={icon || null}
            draggable={draggable || !exactLocation}
            onDragEnd={async (coord) => {
              const { latLng } = coord;
              const newLat = latLng.lat();
              const newLng = latLng.lng();
              setPosition({ lat: newLat, lng: newLng });
              await dispatch(updateGeocode(newLat, newLng, apiKey));
            }}
          /> : null
          }
          {overlay ? <OverlayView
            position={position}
            className='overlay'
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={(x, y) => { return { x: offsetX ? - (x / 2) : -70, y: offsetY ? - (y / 2) : -100 } }} >
            <div
              style={overlayStyle ? overlayStyle : {
                background: `white`,
                fontSize: '11px',
                color: `black`,
                borderRadius: '4px',
                padding: "10px"
              }}
            >
              {overlayContent ? overlayContent :
                (
                  <>
                    Latitude: {lat.toFixed(7)}
                    <br></br>
                    Longitude: {lng.toFixed(7)}
                  </>
                )
              }
            </div>
          </OverlayView> : null}
        </GoogleMap>
      )}
    </>
  );
};

export default React.memo(Maps);
