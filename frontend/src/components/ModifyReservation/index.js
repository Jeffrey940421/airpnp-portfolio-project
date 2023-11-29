import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import { Reserve } from "../Reserve";
import * as spotActions from "../../store/spots";
import * as sessionActions from "../../store/session";
import { useHistory } from "react-router-dom";
import "./ModifyReservation.css";

export function ModifyReservation({ booking, bookingStatus }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { closeModal } = useModal();
  const spotId = booking.spotId;
  const spot = useSelector(state => state.spots.singleSpot);
  const [validStartDate, setValidStartDate] = useState(booking.startDate);
  const [validEndDate, setValidEndDate] = useState(booking.endDate);
  const [serverErrors, setServerErrors] = useState({});
  const disabledDates = spot.id === spotId && spot.Bookings ? spot.Bookings
    .filter(otherBooking => otherBooking.id !== booking.id)
    .map(booking => {
      return [booking.startDate, booking.endDate]
    }) :
    [];

  useEffect(() => {
    dispatch(spotActions.loadSingleSpot(spotId))
      .catch(async (res) => {
        return history.replace(`/error/${res.status}`)
      });
  }, [dispatch, spotId]);

  return (
    <div className="modifyReservation">
      <h1>Modify Reservation</h1>
      <div className="datePickerContainer">
        <Reserve dates={[disabledDates, validStartDate, setValidStartDate, validEndDate, setValidEndDate]} serverErrors={serverErrors} bookingStatus={bookingStatus} />
      </div>
      <div className="modifyReservationButtons">
        <button
          disabled={!validStartDate || !validEndDate}
          onClick={() => {
            dispatch(sessionActions.updateBooking(booking.id, {"startDate": validStartDate, "endDate": validEndDate}))
              .then(closeModal)
              .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                  setServerErrors(data.errors);
                }
              })
            }
          }
        >
          Modify
        </button>
        <button onClick={closeModal}>Cancel</button>
      </div>
    </div>
  )
}
