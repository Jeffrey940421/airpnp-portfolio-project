import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useDispatch } from "react-redux";
import "./ConfirmDelete.css";

export function ConfirmDelete({ spot, review }) {
  const { closeModal } = useModal();
  const dispatch = useDispatch();
  const history = useHistory();

  const handleDelete = (spotId) => {
    return dispatch(sessionActions.removeSpot(spotId))
      .then(closeModal)
      .catch(async (res) => {
        history.push(`/error/${res.status}`);
      })
  }

  return (
    <div className="deleteModal">
      <h1>Confirm Delete</h1>
      <p>Are you sure you want to remove <b>{spot.name}</b> from the listings?</p>
      <button onClick={() => handleDelete(spot.id)}>Yes (Remove Spot)</button>
      <button onClick={closeModal}>No (Keep Spot)</button>
    </div>
  )
}
