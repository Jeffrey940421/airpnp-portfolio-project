import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import * as spotActions from "../../store/spots";
import * as reviewActions from "../../store/reviews";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useDispatch } from "react-redux";
import "./ConfirmDelete.css";

export function ConfirmDelete({ spot, review, type }) {
  const { closeModal } = useModal();
  const dispatch = useDispatch();
  const history = useHistory();

  const handleDelete = ({ spotId, review, type }) => {
    if (spotId) {
      return dispatch(sessionActions.removeSpot(spotId))
        .then(() => dispatch(spotActions.removeSpot(spotId)))
        .then(closeModal)
        .catch(async (res) => {
          history.push(`/error/${res.status}`);
        })
    } else if (review) {
      if (type === "current") {
        return dispatch(sessionActions.deleteReview(review.id))
          .then(closeModal)
          .catch(async (res) => {
            history.push(`/error/${res.status}`);
          });
      } else {
        return dispatch(reviewActions.deleteReview(review.spotId, review.id))
          .then(closeModal)
          .catch(async (res) => {
            history.push(`/error/${res.status}`);
          });
      }
    }
  }

  return (
    <div className="deleteModal">
      <h1>Confirm Delete</h1>
      {
        spot ?
          <>
            <p>Are you sure you want to remove <b>{spot.name}</b> from the listings?</p>
            <button onClick={() => handleDelete({ spotId: spot.id })}>Yes (Remove Spot)</button>
            <button onClick={closeModal}>No (Keep Spot)</button>
          </> :
          <>
            <p>Are you sure your want to delete this review?</p>
            <button onClick={() => handleDelete({ review, type })}>Yes (Delete Review)</button>
            <button onClick={closeModal}>No (Keep Review)</button>
          </>
      }

    </div>
  )
}
