import React, { useEffect, useState, useRef } from "react";
import { Loader } from "../Loader/Loader";
import { usePopup } from "../../context/Popup";
import { useDispatch, useSelector } from "react-redux";
import * as reviewActions from "../../store/reviews";
import * as sessionActions from "../../store/session";
import { useHistory } from "react-router-dom";
import { useModal } from "../../context/Modal";

export function CreateReview({ spot, formType, type, existingReview }) {
  const [review, setReview] = useState(existingReview ? existingReview.review : "");
  const [onchangeReview, setOnchangeReview] = useState(existingReview ? existingReview.review : "");
  const [reviewEdited, setReviewEdited] = useState(existingReview ? true : false);
  const [stars, setStars] = useState(existingReview ? existingReview.stars : 0);
  const [onchangeStars, setOnchangeStars] = useState(existingReview ? existingReview.stars : 0);
  const [starsEdited, setStarsEdited] = useState(existingReview ? true : false);
  const [images, setImages] = useState([]);
  const [imagesToKeep, setImagesToKeep] = useState(existingReview ? existingReview.ReviewImages : []);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const { setPopupContent } = usePopup();
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector(state => state.session.user);
  const { setModalContent } = useModal();
  const ref = React.useRef(null);
  const imagesNum = Array.from(images).filter(file => file.type.startsWith("image")).length + imagesToKeep.length;

  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const dataTransfer = new DataTransfer();
    Array.from(images).forEach(image => dataTransfer.items.add(image));
    Array.from(e.dataTransfer.files).forEach(image => dataTransfer.items.add(image));
    const input = document.querySelector(".dropBox input");
    input.files = dataTransfer.files;
    setImages(dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});

    const newReview = { review, stars }

    if (!Object.values(availabilityErrors).length && !Object.values(validationErrors).flat().length) {
      if (formType === "edit") {
        setPopupContent(<Loader text={"Review is being updated"} />);
        if (type === "current") {
          return dispatch(sessionActions.updateReview(existingReview.id, newReview))
            .then(() => dispatch(sessionActions.removeReviewImages(existingReview.id, imagesToDelete)))
            .then(() => {
              if (images.length) {
                return dispatch(sessionActions.addReviewImages(existingReview.id, images))
              }
            })
            .then(() => {
              setModalContent(null);
              setPopupContent(null);
            })
            .catch(async (res) => {
              const data = await res.json();
              setPopupContent(null);
              if (data && data.errors) {
                setServerErrors(data.errors);
              } else {
                setModalContent(null);
                history.replace(`/error/${res.status}`);
              }
              // TO DO: Restore the spot
            })
        } else {
          return dispatch(reviewActions.updateReview(spot.id, existingReview.id, newReview))
            .then(() => dispatch(reviewActions.removeReviewImages(spot.id, existingReview.id, imagesToDelete)))
            .then(() => {
              if (images.length) {
                return dispatch(reviewActions.addReviewImages(spot.id, existingReview.id, images))
              }
            })
            .then(() => {
              setModalContent(null);
              setPopupContent(null);
            })
            .catch(async (res) => {
              setPopupContent(null);
              const data = await res.json();
              if (data && data.errors) {
                setServerErrors(data.errors);
              } else {
                setModalContent(null);
                history.replace(`/error/${res.status}`);
              }
              // TO DO: Restore the spot
            })
        }
      } else {
        setPopupContent(<Loader text={"Review is being submitted"} />);
        return dispatch(reviewActions.createReview(spot.id, newReview, user))
          .then((review) => {
            if (images.length) {
              return dispatch(reviewActions.addReviewImages(spot.id, review.id, images))
            }
          })
          .then(() => {
            setModalContent(null);
            setPopupContent(null);
          })
          .catch(async (res) => {
            setPopupContent(null);
            const data = await res.json();
            if (data && data.errors) {
              setServerErrors(data.errors);
            } else {
              setModalContent(null);
              history.replace(`/error/${res.status}`);
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
    const errors = { review: [], stars: [], images: [] };

    if (review && review.length < 10) errors.review.push("Review must be at least 10 characters long");

    if (stars && (stars < 1 || stars > 5)) errors.stars.push("Rating must be between 1 star and 5 stars")

    if (images && Array.from(images).find(image => !image.type.startsWith("image"))) errors.images.push("Only image files are accepted")
    if (imagesNum > 10) errors.images.push("Maximum of 10 images are allowed for each review");

    setValidationErrors(errors);
  }, [review, stars, images]);

  useEffect(() => {
    const reviewImages = document.querySelectorAll(".previewBox img");
    if (reviewImages.length) {
      reviewImages.forEach(image => {
        image.addEventListener("error", (e) => {
          e.target.src = "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/public/imageNotFound-svg.png"
          e.onerror = null
        })
      })
    }
  })

  return (
    <form className="reviewModal" onSubmit={handleSubmit}>
      <div>
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
                <div
                  onMouseEnter={() => setOnchangeStars(i + 1)}
                  onMouseLeave={() => {
                    setOnchangeStars(stars);
                    setStarsEdited(true);
                  }}
                  onClick={() => setStars(i + 1)}
                  key={i}
                >
                  <i
                    className={`fa-star ${onchangeStars >= i + 1 ? "fa-solid" : "fa-regular"}`}
                  />
                </div>
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
        <div
          className={`dropBox ${availabilityErrors.images || (validationErrors.images && validationErrors.images.length) || serverErrors.images ? "error" : ""}`}
          onDragEnter={handleDrag}
        >
          <span>Images (Optional)</span>
          <input
            ref={ref}
            type="file"
            className="fileUpload"
            accept="image/*"
            multiple={true}
            name="images"
            onChange={(e) => {
              const dataTransfer = new DataTransfer();
              Array.from(images).forEach(image => dataTransfer.items.add(image));
              Array.from(e.target.files).forEach(image => dataTransfer.items.add(image));
              e.target.files = dataTransfer.files;
              setImages(e.target.files);
            }}
          />
          <label htmlFor="images" className={`fileUpload ${dragActive ? "dragActive" : ""}`}>
            <span>Drag your photos here to start uploading</span>
            <span>— OR —</span>
            <button
              className="uploadButton"
              onClick={(e) => {
                e.preventDefault();
                ref.current.click();
              }}>
              Browse photos
            </button>
          </label>
          {dragActive && <div id="dragFileElement" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
        </div>
        <div className="errorMessage">
          {serverErrors.images && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.images}</p>}
          {availabilityErrors.images && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.images}</p>}
          {validationErrors.images && validationErrors.images.length > 0 && validationErrors.images.map(error => (
            <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
          ))}
        </div>
        {imagesNum ? <span className="previewTitle">Selected Photos:</span> : null}
        <div className="previewSection">
          {imagesToKeep.map((image, i) => {
            const imageUrl = image.url.split("/");
            const imageName = imageUrl[imageUrl.length - 1];
            return (
              <div className="previewBox" key={-i - 1}>
                <img
                  className="preview"
                  src={image.url}
                  alt={imageName}
                />
                <div className="previewButtons">
                  <span className="fileName">{imageName}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setImagesToKeep((prev) => {
                        const imageList = [...prev];
                        imageList.splice(i, 1);
                        return imageList;
                      });
                      setImagesToDelete((prev) => {
                        let imageList = [...prev];
                        imageList.push(image.id);
                        return imageList;
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
          {Array.from(images).map((image, i) => {
            return (
              <div className="previewBox" key={i}>
                <img
                  className="preview"
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                />
                <div className="previewButtons">
                  <span className="fileName">{image.name}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const dataTransfer = new DataTransfer();
                      Array.from(images).forEach(file => {
                        if (file.name !== image.name) {
                          dataTransfer.items.add(file)
                        }
                      });
                      const input = document.querySelector(".dropBox input");
                      input.files = dataTransfer.files;
                      setImages(input.files);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="submitButtons">
          <button
            type="submit"
            disabled={Object.values(availabilityErrors).length || Object.values(validationErrors).flat().length || !reviewEdited || !starsEdited}
          >
            {formType === "edit" ? "Update Review" : "Submit Review"}
          </button>
        </div>
      </div>
    </form>
  )
}
