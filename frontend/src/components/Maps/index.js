import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getKey } from '../../store/maps';
import Maps from './Map';

const MapContainer = ({ address, city, state, country, exactLocation, options }) => {
  const key = useSelector((state) => state.maps.key);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!key) {
      dispatch(getKey());
    }
  }, [dispatch, key]);

  if (!key) {
    return null;
  }

  return (
    <Maps apiKey={key} address={address} city={city} state={state} country={country} exactLocation={exactLocation} options={options} />
  );
};

export default MapContainer;
