import { useModal } from "../../context/Modal";
import { useHistory } from "react-router-dom";
import "./ConfirmReservation.css";

export function ConfirmReservation({spot, validStartDate, validEndDate}) {
  const { closeModal } = useModal();
  const history = useHistory();

  const changeDateFormat = (date) => {
    const dateArr = date.split("-");
    return `${dateArr[1]}/${dateArr[2]}/${dateArr[0]}`;
  }

  return (
    <div className="confirmReservation">
      <h1>Reservation Confirmation</h1>
      <p>Congradulations on successfully reserving your stay at <b>{spot.name}</b> from <b>{changeDateFormat(validStartDate)}</b> to <b>{changeDateFormat(validEndDate)}</b>. </p>
      <div className="confirmReservationButtons">
      <button
        onClick={() => {
          closeModal();
          history.push("/bookings/current");
        }}
      >
        Check Upcoming Trips
      </button>
      <button
        onClick={() => {
          closeModal();
        }}
      >
        Close
      </button>
      </div>
    </div>
  )
}
