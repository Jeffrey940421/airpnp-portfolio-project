import { useModal } from "../../context/Modal";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import "./TripList.css";
import * as sessionActions from "../../store/session";
import { ConfirmDelete } from "../ConfirmDelete";
import { useHistory } from "react-router-dom";
import { ModifyReservation } from "../ModifyReservation";
import newTrip from "../../assets/newTrip.webp";

export function TripList({ bookings }) {
  const user = useSelector(state => state.session.user);
  const dispatch = useDispatch();

  const timeOffset = new Date().getTimezoneOffset();
  const upcomingBookings = bookings
    .filter(booking => {
      return new Date(booking.startDate) > new Date(new Date().setHours(0, -timeOffset, 0, 0));
    })
    .sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });
  const ongoingBookings = bookings
    .filter(booking => {
      return new Date(booking.startDate) <= new Date(new Date().setHours(0, -timeOffset, 0, 0)) && new Date(booking.endDate) > new Date(new Date().setHours(0, -timeOffset, 0, 0));
    })
    .sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });
  const pastBookings = bookings
    .filter(booking => {
      return new Date(booking.endDate) <= new Date(new Date().setHours(0, -timeOffset, 0, 0));
    })
    .sort((a, b) => {
      return new Date(b.startDate) - new Date(a.startDate);
    });

  useEffect(() => {
    const spotBookingImages = document.querySelectorAll(".spotBookingImage");
    if (spotBookingImages.length) {
      spotBookingImages.forEach(image => {
        image.addEventListener("error", (e) => {
          e.target.src = "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/public/imageNotFound-svg.png"
          e.onerror = null
        })
      })
    }
  });


  return (
    <div className="tripList">
      {upcomingBookings.length ?
        <div className="upcomingTrips">
          <h2>Upcoming Trips</h2>
          <TripDetail bookings={upcomingBookings} type="upcoming" />
        </div> :
        <div className="upcomingTrips">
          <h2>Upcoming Trips</h2>
          <NoTrips />
        </div>
      }
      {ongoingBookings.length ?
        <div className="ongoingTrips">
          <h2>Ongoing Trips</h2>
          <TripDetail bookings={ongoingBookings} type="ongoing" />
        </div> :
        null
      }
      {pastBookings.length ?
        <div className="pastTrips">
          <h2>Past Trips</h2>
          <TripDetail bookings={pastBookings} type="past" />
        </div> :
        null
      }
    </div>
  )
}

function TripDetail({ bookings, type }) {
  const { setModalContent, setOnModalClose } = useModal();

  const months = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
  };

  return (
    <div className="upcomingTripsList">
      {bookings.map(booking => {
        return (
          <div className="upcomingTrip" key={booking.id}>
            <img className="spotBookingImage" src={booking.Spot.previewImage} alt={booking.Spot.name} />
            <div className="spotBookingInfo">
              <p className="spotBookingName">{booking.Spot.name}</p>
              <p className="spotBookingDate">
                {months[+booking.startDate.split("-")[1]]}
                {" "}
                {booking.startDate.split("-")[2]}
                {
                  booking.startDate.split("-")[0] === booking.endDate.split("-")[0] ?
                    null :
                    `, ${booking.startDate.split("-")[0]}`
                }
                {" - "}
                {booking.startDate.split("-")[1] === booking.endDate.split("-")[1] && booking.startDate.split("-")[0] === booking.endDate.split("-")[0] ?
                  null :
                  `${months[+booking.endDate.split("-")[1]]} `
                }
                {booking.endDate.split("-")[2]}
                , {+booking.endDate.split("-")[0]}
              </p>
              <p className="spotBookingLocation">{booking.Spot.city}, {booking.Spot.state}, {booking.Spot.country}</p>
              <div className="spotBookingButtons">
                {
                  type === "upcoming" || type === "ongoing" ?
                    <button
                      onClick={() => {
                        setModalContent(<ModifyReservation booking={booking} bookingStatus={type}/>);
                      }}
                    >
                      Modify
                    </button> :
                    null
                }
                {
                  type === "upcoming" ?
                    <button
                      onClick={() => {
                        setModalContent(<ConfirmDelete booking={booking} type="booking" />);
                      }}
                    >
                      Cancel
                    </button> :
                    null
                }
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function NoTrips() {
  const history = useHistory();

  return (
    <div className="noTrips">
      <div className="noTripsText">
        <i className="fa-solid fa-suitcase-rolling" />
        <h3>No Upcoming Trips</h3>
        <p>Time to dust off your bags and start planning your next adventure.</p>
        <button
          onClick={() => {
            history.push("/")
          }}
        >
          Start Browsing
        </button>
      </div>
      <img src={newTrip} />
    </div>
  )
}
