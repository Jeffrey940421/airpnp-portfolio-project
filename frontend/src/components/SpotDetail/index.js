import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import * as spotActions from "../../store/spots";
import * as reviewActions from "../../store/reviews";
import "./SpotDetail.css"
import { OpenModalButton } from "../OpenModalButton";
import { SpotIntroduction } from "../SpotIntroduction";
import { useModal } from "../../context/Modal";
import MapContainer from "../Maps";

export function SpotDetail() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spot = useSelector((state) => state.spots.singleSpot);
  const reviews = useSelector((state) => state.reviews[spotId]);
  const user = useSelector(state => state.session.user);
  const [hasMore, setHasMore] = useState(false);
  const [circleRadius, setCircleRadius] = useState(150);
  const [showNote, setShowNote] = useState(false);
  const { setModalContent, setOnModalClose } = useModal();

  const changeRadius = (currentZoom) => setCircleRadius(150 * (1.8 ** (currentZoom - 16)))

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

  useEffect(() => {
    dispatch(spotActions.loadSingleSpot(spotId));
    dispatch(reviewActions.loadReviews(spotId));
  }, [spotId]);

  useEffect(() => {
    const introduction = document.querySelector(".details .introduction p");
    if (introduction) {
      const lines = introduction.offsetHeight / 24;
      if (lines > 4) {
        setHasMore(true);
      }
    }
  }, [spot]);

  useEffect(() => {
    const reviewImages = document.querySelectorAll(".reviewImage, img.bigImage, img.smallImages, #modal .allImages img, #modal .bigReviewImage");
    if (reviewImages.length) {
      reviewImages.forEach(image => {
        image.addEventListener("error", (e) => {
          e.target.src = "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/public/imageNotFound-svg.png"
          e.onerror = null
        })
      })
    }
  });

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
                <p className={hasMore ? "hiddenText" : ""}>{spot.description}</p>
                {hasMore ? <OpenModalButton buttonText="Show More >" modalComponent={<SpotIntroduction text={spot.description} />} /> : null}
              </div>
              <div className="reserve">
                <div>
                  <span className="spotPrice">
                    ${spot.price.toLocaleString("en-US")} <span className="night">night</span>
                  </span>
                  <span>
                    <i className="fa-solid fa-star" /> {spot.avgRating ? (Number.isInteger(spot.avgRating) ? spot.avgRating.toFixed(1) : spot.avgRating.toFixed(2)) : "New"} {spot.numReviews ? spot.numReviews === 1 ? `· ${spot.numReviews} review` : `· ${spot.numReviews} reviews` : null}
                  </span>
                </div>
                <button>Reserve</button>
              </div>
            </div>
          </div>
          <div className="spotMap">
            <h4>Where you'll be</h4>
            <p>{spot.city}, {spot.state}, {spot.country}</p>
            <MapContainer
              exactLocation={true}
              options={{
                setLat: +spot.lat.toFixed(3),
                setLng: +spot.lng.toFixed(3),
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
                        "border-radius": `${circleRadius > 60 ? circleRadius : 60}px`
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
                          <div class="arrow-down"></div>
                        </div>

                      </div>
                    </div>
                  </>
                )
              }} />
          </div>
          <div className="spotReviews">
            <h4>
              <i className="fa-solid fa-star" /> {spot.avgRating ? (Number.isInteger(spot.avgRating) ? spot.avgRating.toFixed(1) : spot.avgRating.toFixed(2)) : "New"} {spot.numReviews ? spot.numReviews === 1 ? `· ${spot.numReviews} review` : `· ${spot.numReviews} reviews` : null}
            </h4>
            {user && user.id !== spot.Owner.id && reviews && !Object.values(reviews).find(review => review.userId === user.id) ? <button className="createReview">Post a Review</button> : null}
            {
              !spot.numReviews && user && user.id !== spot.Owner.id ?
                <span>Be the first one to post a review!</span> :
                reviews && <div className="reviewDetails">
                  {Object.values(reviews).slice(0).reverse().map(review => {
                    const date = review.createdAt;
                    const year = date.split("-")[0];
                    const month = date.split("-")[1]
                    return (
                      <div key={review.id}>
                        <span className="reviewer">{review.User.firstName}</span>
                        <span className="reviewDate">{months[+month]} {year}</span>
                        <p className="review">{review.review}</p>
                        {
                          review.ReviewImages.length ?
                            <div className="reviewImages">
                              {review.ReviewImages.map(image => {
                                return (
                                  <img src={image.url} key={image.id} className="reviewImage" onClick={(e) => {
                                    e.preventDefault();
                                    setModalContent(<img className="bigReviewImage" src={image.url} />)
                                  }} />
                                )
                              })}
                            </div> :
                            null
                        }
                      </div>
                    )
                  })}
                </div>
            }
          </div>
        </>
      ) : null}
    </>
  )
}
