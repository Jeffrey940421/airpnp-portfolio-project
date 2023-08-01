import "./CreateReview.css";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { CreateReview } from "./CreateReview";

export function CreateReviewContainer({ type, reviewId, spot }) {

  if (type === "edit") {
    return <CreateReview key={reviewId} spot={spot} type="edit"/>
  } else {
    return <CreateReview key={0} spot={spot} />
  }
}
