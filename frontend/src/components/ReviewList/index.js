import { useModal } from "../../context/Modal";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import * as reviewActions from "../../store/reviews";
import * as sessionActions from "../../store/session";
import { ConfirmDelete } from "../ConfirmDelete";

export function ReviewList({ reviews, type }) {
  const { setModalContent, setOnModalClose } = useModal();
  const user = useSelector(state => state.session.user);
  const dispatch = useDispatch();

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
      <div className="reviewDetails">
        {Object.values(reviews).slice(0).reverse().map(review => {
          const date = review.createdAt;
          const year = date.split("-")[0];
          const month = date.split("-")[1]
          return (
            <div key={review.id}>
              <span className="reviewTitle">{type === "current" ? review.Spot.name : review.User.firstName}</span>
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
              {
                user && review.userId === user.id ?
                  <div className="reviewButtons">
                    <button
                      className="updateReview"
                    >
                      Update
                    </button>
                    <button
                      className="deleteReview"
                      onClick={async (e) => {
                        e.preventDefault();
                        setModalContent(<ConfirmDelete review={review} type={type} />)
                      }}
                    >
                      Delete
                    </button>
                  </div> :
                  null
              }
            </div>
          )
        })}
      </div>
    </>
  )
}
