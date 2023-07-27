import { useParams } from "react-router-dom";
import { CreateSpot } from "./CreateSpot";
import { useDispatch, useSelector } from "react-redux";
import * as spotActions from "../../store/spots";
import React, { useEffect } from "react";

export function CreateSpotContainer({ type }) {
  const params = useParams();
  const spotId = params.spotId;
  const dispatch = useDispatch();

  useEffect(() => {
    if (type === "edit" && spotId) {
      dispatch(spotActions.loadSingleSpot(spotId));
    }
  }, [type, spotId])

  const spot = useSelector((state) => state.spots.singleSpot);

  if (type === "edit") {
    if (spot && +spotId === spot.id) {
      return <CreateSpot key={spotId} type={type} spot={spot} spotId={spotId}/>
    } else {
      return null;
    }
  } else {
    return <CreateSpot key={0} />
  }
}
