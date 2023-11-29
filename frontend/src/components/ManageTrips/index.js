import "./ManageTrips.css";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { NoContent } from "../NoContent";
import { TripList } from "../TripList";

export function ManageTrips() {
  const dispatch = useDispatch();
  const history = useHistory();
  const bookings = useSelector((state) => state.session.bookings);
  const user = useSelector(state => state.session.user);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.listBookings())
    .then(() => setHasFetched(true))
      .catch(async (res) => {
        return history.replace(`/error/${res.status}`);
      })
  }, [])

  if (!user) {
    return history.replace("/error/401");
  } else if (!hasFetched) {
    return null;
  }

  return (
    <>
      <h1>Manage Trips</h1>
      {
        Object.values(bookings).length ?
          <TripList bookings={Object.values(bookings)} /> :
          <NoContent text="You haven't made any reservations yet" />
      }
    </>
  )
}
