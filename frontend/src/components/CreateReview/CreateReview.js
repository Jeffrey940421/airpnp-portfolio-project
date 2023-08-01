import { useEffect, useState } from "react";
import { Loader } from "../Loader/Loader";
import { usePopup } from "../../context/Popup";
import { useDispatch, useSelector } from "react-redux";
import * as reviewActions from "../../store/reviews";
import { useHistory } from "react-router-dom";
import { useModal } from "../../context/Modal";

export function CreateReview({ spot, type }) {
  const [review, setReview] = useState("");
  const [onchangeReview, setOnchangeReview] = useState("");
  const [reviewEdited, setReviewEdited] = useState(false);
  const [stars, setStars] = useState(0);
  const [onchangeStars, setOnchangeStars] = useState(0);
  const [starsEdited, setStarsEdited] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const { setPopupContent } = usePopup();
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector(state => state.session.user);
  const { setModalContent} = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});

    const newReview = {review, stars}

    if (!Object.values(availabilityErrors).length && !Object.values(validationErrors).flat().length) {
      if (type === "edit") {

      } else {
        setPopupContent(<Loader text={"Review is being submitted"} />);
        return dispatch(reviewActions.createReview(spot.id, newReview, user))
          .then(() => {
            setPopupContent(null);
            setModalContent(null);
          })
          .catch(async (res) => {
            const data = await res.json();
              if (data && data.errors) {
                setServerErrors(data.errors);
              }
          })
      }
    }
  }

  useEffect(() => {
    const errors = {};

    if (reviewEdited && !review) errors.review = "Review is required";
    if (starsEdited && stars == 0) errors.stars = "Rating is required";

    setAvailabilityErrors(errors);
  }, [review, reviewEdited, stars, starsEdited]);

  useEffect(() => {
    const errors = { review: [], stars: [] };

    if (review && review.length < 10) errors.review.push("Review must be at least 10 characters long");
    if (stars && (stars < 1 || stars > 5)) errors.stars.push("Rating must be between 1 star and 5 stars")

    setValidationErrors(errors);
  }, [review, stars])

  return (
    <form className="reviewModal" onSubmit={handleSubmit}>
      <h1 className="reviewModalTitle1">{`How was your stay at`}</h1>
      <h1 className="reviewModalTitle2">{spot.name}</h1>
      <div className={`inputArea ${availabilityErrors.review || (validationErrors.review && validationErrors.review.length) || serverErrors.review ? "errorTextarea" : ""}`}>
        <label htmlFor="review">Review</label>
        <textarea
          name="review"
          value={onchangeReview}
          onChange={(e) => {
            setOnchangeReview(e.target.value);
          }}
          onBlur={(e) => {
            setReviewEdited(true);
            setReview(e.target.value);
          }}
          placeholder="Leave your review here..."
          autoComplete="one-time-code"
        />
      </div>
      <div className="errorMessage">
        {serverErrors.review && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.review}</p>}
        {availabilityErrors.review && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.review}</p>}
        {validationErrors.review && validationErrors.review.length > 0 && validationErrors.review.map(error => (
          <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
        ))}
      </div>
      <div className={`rating ${availabilityErrors.stars || (validationErrors.stars && validationErrors.stars.length) || serverErrors.stars ? "errorRating" : ""}`}>
        <span>Rating</span>
        <div className="stars">
          {Array(5).fill("").map((el, i) => {
            return (
              <i
                className={`fa-star ${onchangeStars >= i + 1 ? "fa-solid" : "fa-regular"}`}
                onMouseEnter={() => setOnchangeStars(i + 1)}
                onMouseLeave={() => {
                  setOnchangeStars(stars);
                  setStarsEdited(true);
                }}
                onClick={() => setStars(i + 1)}
                key = {i}
              />
            )
          })}
        </div>
      </div>
      <div className="errorMessage">
        {serverErrors.stars && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.stars}</p>}
        {availabilityErrors.stars && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.stars}</p>}
        {validationErrors.stars && validationErrors.stars.length > 0 && validationErrors.stars.map(error => (
          <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
        ))}
      </div>
      <div className="submitButtons">
          <button
            type="submit"
            disabled={Object.values(availabilityErrors).length || Object.values(validationErrors).flat().length || !reviewEdited || !starsEdited}
          >
            {type === "edit" ? "Update Review" : "Submit Review"}
          </button>
        </div>
    </form>
  )
}
