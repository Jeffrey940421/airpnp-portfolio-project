import "./ManageReviews.css";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { ReviewList } from "../ReviewList";
import { NoContent } from "../NoContent";

export function ManageReviews() {
  const dispatch = useDispatch();
  const history = useHistory();
  const reviews = useSelector((state) => state.session.reviews);
  const user = useSelector(state => state.session.user);
  const [hasFetched, setHasFetched] = useState(false);

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
    11: "Novc:\Users\Jeffrey Zhang\AppData\Local\Postman\app-10.15.0\resources\app.asar\html\scratchpad.htmlember",
    12: "December"
  };

  useEffect(() => {
    dispatch(sessionActions.listReviews())
    .then(() => setHasFetched(true))
      .catch(async (res) => {
        if (res.status === 401) {
          return history.replace("/unauthorized")
        }
      })
  }, [])

  if (!user) {
    return history.replace("/unauthorized");
  } else if (!hasFetched) {
    return null;
  }

  return (
    <>
      <h1>Manage Reviews</h1>
      {
        Object.values(reviews).length ?
          <ReviewList reviews={reviews} type="current" /> :
          <NoContent text="You haven't posted any review yet" />
      }
    </>
  )
}
