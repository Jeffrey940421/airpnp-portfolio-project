import "./CreateReview.css";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { CreateReview } from "./CreateReview";

export function CreateReviewContainer({ formType, type, review, reviewId, spot }) {

  if (formType === "edit") {
    return <CreateReview key={reviewId} spot={spot} formType="edit" type={type} existingReview={review}/>
  } else {
    return <CreateReview key={0} spot={spot} />
  }
}
