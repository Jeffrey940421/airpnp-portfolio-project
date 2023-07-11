import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import { listSpots } from "../../store/spots";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "./SpotList.css";

export function SpotList() {
  const dispatch = useDispatch();
  const history = useHistory();
  const spots = useSelector(state => state.spots.spotList);

  useEffect(() => {
    dispatch(listSpots({}));
  }, []);

  return (
    <div className="spotList">
      {Object.values(spots).map((spot, i) => {
        return (
          <div className="spot" key={spot.id} onClick={() => history.push(`/spots/${spot.id}`)}>
            <img className="previewImage" src={spot.previewImage} alt={spot.name} />
            <div className="spotLocation">
              <span className="address">{spot.city}, {spot.state}</span>
              <span className="starts"><i className="fa-solid fa-star" /> {spot.avgRating ? (Number.isInteger(spot.avgRating) ? spot.avgRating.toFixed(1) : spot.avgRating.toFixed(2)) : "New"}</span>
            </div>
            <span className="spotName">{spot.name}</span>
            <div className="spotPrice"><span>${spot.price}</span> night</div>
          </div>
        )
      })}
    </div>
  )
}
