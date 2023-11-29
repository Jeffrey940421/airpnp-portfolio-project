import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import * as spotActions from "../../store/spots";
import * as reviewActions from "../../store/reviews";
import "./SpotDetail.css"
import { OpenModalButton } from "../OpenModalButton";
import { SpotIntroduction } from "../SpotIntroduction";
import { useModal } from "../../context/Modal";
import MapContainer from "../Maps";
import { ReviewList } from "../ReviewList";
import { CreateReviewContainer } from "../CreateReview";
import { Reserve } from "../Reserve";
import { LoginForm } from "../LoginForm";
import { ConfirmReservation } from "../ConfirmReservation";

export function SpotDetail() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spot = useSelector((state) => state.spots.singleSpot);
  const reviews = useSelector((state) => state.reviews[spotId]);
  const user = useSelector(state => state.session.user);
  const [hasMore, setHasMore] = useState(false);
  const [circleRadius, setCircleRadius] = useState(150);
  const [showNote, setShowNote] = useState(false);
  const [validStartDate, setValidStartDate] = useState("");
  const [validEndDate, setValidEndDate] = useState("");
  const [serverErrors, setServerErrors] = useState({});
  const [key, setKey] = useState(0);
  const { setModalContent, setOnModalClose } = useModal();
  const history = useHistory();
  const disabledDates = spot.Bookings ? spot.Bookings.map(booking => {
    return [booking.startDate, booking.endDate]
  }) : [];

  const changeRadius = (currentZoom) => setCircleRadius(150 * (1.8 ** (currentZoom - 16)))
  const nights = validStartDate && validEndDate ? Math.ceil((new Date(validEndDate) - new Date(validStartDate)) / (1000 * 60 * 60 * 24)) : "";

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

  const reviewsNum = reviews ? Object.values(reviews).length : null;
  const reviewsAvg = reviewsNum ? Object.values(reviews).reduce((acc, review) => acc + review.stars, 0) / reviewsNum : null;

  const showAllImages = (e) => {
    e.preventDefault();
    setModalContent(
      <div className="allImages">
        <div>
          {spot.SpotImages.map(image => {
            return (
              <img src={image.url} key={image.id} />
            )
          })}
        </div>
      </div>
    )
  }

  const handleReserve = (e) => {
    e.preventDefault();
    setServerErrors({});

    const booking = {
      startDate: validStartDate,
      endDate: validEndDate,
    }

    if (validStartDate && validEndDate) {
      return dispatch(spotActions.addBooking(booking, spot.id))
        .then(() => {
          setModalContent(<ConfirmReservation spot={spot} validStartDate={validStartDate} validEndDate={validEndDate} />)
          setValidStartDate("");
          setValidEndDate("");
          setKey((prev) => prev + 1);
        })
        .catch(
          async (res) => {
            const data = await res.json();
            if (data && data.errors) {
              setServerErrors(data.errors);
            }
          }
        )
    }
  }


  useEffect(() => {
    dispatch(spotActions.loadSingleSpot(spotId))
      .then(() => dispatch(reviewActions.loadReviews(spotId)))
      .catch(async (res) => {
        return history.replace(`/error/${res.status}`)
      })
  }, [spotId]);

  useEffect(() => {
    const introduction = document.querySelector(".details .introduction p");
    if (introduction) {
      const lines = introduction.offsetHeight / 24;
      if (lines > 5) {
        setHasMore(true);
      }
    }
  }, [spot]);

  return (
    <>
      {spot.id === +spotId && spot.Owner ? (
        <>
          <div className="spotDetail">
            <h1 className="spotTitle">{spot.name}</h1>
            <p className="spotLocation">{spot.city}, {spot.state}, {spot.country}</p>
            <div className="spotImages">
              <img src={spot.SpotImages.find(image => image.preview).url} className="bigImage" onClick={showAllImages}></img>
              <div className="smallImages">
                {spot.SpotImages.filter(image => !image.preview).slice(0, 4).map(image => {
                  return (
                    <img src={image.url} className="smallImages" key={image.id} onClick={showAllImages} />
                  )
                })}
              </div>
              <button onClick={showAllImages}>
                <i className="fa-solid fa-grip" />Show All Photos
              </button>
            </div>
            <div className="details">
              <div className="introduction">
                <h2 className="spotHost">Hosted by {spot.Owner.firstName} {spot.Owner.lastName}</h2>
                <p className={hasMore ? "hiddenText" : ""} style={{ "whiteSpace": "pre-line" }}>{spot.description}</p>
                {hasMore ? <OpenModalButton buttonText="Show More >" modalComponent={<SpotIntroduction text={spot.description} />} /> : null}
              </div>
              <div className="reserve">
                <div>
                  <span className="spotPrice">
                    ${(+spot.price).toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="night">night</span>
                  </span>
                  <span>
                    <i className="fa-solid fa-star" /> {reviewsAvg ? (Number.isInteger(reviewsAvg) ? reviewsAvg.toFixed(1) : reviewsAvg.toFixed(2)) : "New"} {reviewsNum ? reviewsNum === 1 ? `· ${reviewsNum} review` : `· ${reviewsNum} reviews` : null}
                  </span>
                </div>
                {
                  user ?
                    user.id !== spot.Owner.id ?
                      <>
                        <div className="datePickerContainer" key={key}>
                          <Reserve dates={[disabledDates, validStartDate, setValidStartDate, validEndDate, setValidEndDate]} serverErrors={serverErrors}></Reserve>
                        </div>
                        <button
                          disabled={!validStartDate || !validEndDate}
                          onClick={handleReserve}
                        >
                          Reserve
                        </button>
                        {
                          validStartDate && validEndDate ?
                            <>
                              <span className="priceNote">You won't be charged yet</span>
                              <div className="priceDetail">
                                <span>${(+spot.price).toLocaleString("en-US", { minimumFractionDigits: 2 })} x {nights} Nights</span>
                                <span className="priceNum">${(+spot.price * nights).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                <span>Cleaning Fee</span>
                                <span className="priceNum">${(+spot.price * 0.2).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                <span>Airpnp Service Fee</span>
                                <span className="priceNum">${(+spot.price * nights * 0.1).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="totalPrice">
                                <span>Total</span>
                                <span className="priceNum">${(+spot.price * nights * 1.1 + +spot.price * 0.2).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                              </div>
                            </> :
                            null
                        }
                      </> :
                      <button
                        onClick={() => history.push({pathname: "/reservations/current", state: {defaultSpotId: spot.id} })}
                      >
                        Manage Reservations
                      </button> :
                    <button
                      onClick={() => setModalContent(<LoginForm />)}
                    >
                      Login to Reserve
                    </button>
                }
              </div>
            </div>
          </div>
          <div className="spotMap">
            <h4>Where you'll be</h4>
            <p>{spot.city}, {spot.state}, {spot.country}</p>
            <MapContainer
              exactLocation={true}
              options={{
                setLat: +(+spot.lat).toFixed(3),
                setLng: +(+spot.lng).toFixed(3),
                width: "100%",
                height: "600px",
                zoom: 16,
                draggable: false,
                overlay: true,
                marker: false,
                onZoomChange: changeRadius,
                offsetX: true,
                offsetY: true,
                overlayStyle: {
                  background: "transparent"
                },
                overlayContent: (
                  <>
                    <div
                      className="bigCircle"
                      style={{
                        "width": `${circleRadius > 60 ? circleRadius : 60}px`,
                        "borderRadius": `${circleRadius > 60 ? circleRadius : 60}px`
                      }}
                    >
                      <div
                        className={`smallCircle ${showNote ? "show" : ""}`}
                        onMouseEnter={(e) => setShowNote(true)}
                        onMouseLeave={(e) => setShowNote(false)}
                      >
                        <i className="fa-solid fa-house fa-bounce" style={{ "color": "white" }} />
                        <div className="note">
                          <span>Exact location provided after booking</span>
                          <div className="arrow-down"></div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              }} />
          </div>
          <div className="spotReviews">
            <h4>
              <i className="fa-solid fa-star" /> {reviewsAvg ? (Number.isInteger(reviewsAvg) ? reviewsAvg.toFixed(1) : reviewsAvg.toFixed(2)) : "New"} {reviewsNum ? reviewsNum === 1 ? `· ${reviewsNum} review` : `· ${reviewsNum} reviews` : null}
            </h4>
            {
              user && user.id !== spot.Owner.id && reviews && !Object.values(reviews).find(review => review.userId === user.id) ?
                <button
                  className="createReview"
                  onClick={() => setModalContent(<CreateReviewContainer spot={spot} />)}
                >
                  Post a Review
                </button> :
                null
            }
            {
              !reviewsNum && user && user.id !== spot.Owner.id ?
                <span>Be the first one to post a review!</span> :
                reviews && <ReviewList reviews={reviews} spot={spot} />
            }
          </div>
        </>
      ) : null}
    </>
  )
}
