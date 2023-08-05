import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import * as spotActions from "../../store/spots";
import * as sessionActions from "../../store/session";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "./SpotList.css";
import { OpenModalButton } from "../OpenModalButton";
import { ConfirmDelete } from "../ConfirmDelete";
import { NoContent } from "../NoContent";
import { Loader } from "../Loader/Loader";

export function SpotList({ type }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const spots = useSelector(state => type === "current" ? state.session.spots : state.spots.spotList);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const spotList = type === "current" ? Object.values(spots) : Object.values(spots).map(page => Object.values(page)).flat()

  const fetchSpots = async () => {
    if (type === "current") {
      await dispatch(sessionActions.listSpots());
    } else {
      if (page <= 10 && hasMore) {
        setIsLoading(true);
        const data = await dispatch(spotActions.listSpots({ page: page }));
        if (data.Spots.length === 20) {
          setPage(prev => prev + 1);
        } else {
          setHasMore(false);
        }
        setIsLoading(false);
      }
    }
    setHasFetched(true)
  }

  useEffect(() => {
    fetchSpots();
  }, [type]);

  const handleScroll = () => {
    const bottom = window.innerHeight + document.documentElement.scrollTop > document.body.offsetHeight;
    if (bottom) {
      fetchSpots();
    }
  };

  useEffect(() => {
    if (!isLoading && type !== "current") {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isLoading]);


  useEffect(() => {
    const images = document.querySelectorAll("img");
    if (images.length) {
      images.forEach(image => {
        image.addEventListener("error", (e) => {
          e.target.src = "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/public/imageNotFound-svg.png"
          e.onerror = null
        })
      })
    }
  })

  if (!hasFetched) {
    return null;
  }

  return (
    <>
      {type === "current" ?
        <div className="manageSpotsTitle">
          <h1>Manage Places</h1>
          <button onClick={() => history.push("/spots/new")}>Create a New Place</button>
        </div> : null}
      {
        spotList.length ?
          <div className="spotList">
            {
              spotList.map((spot, i) => {
                return (
                  <div key={spot.id}>
                    <div
                      className="spot"
                      onClick={() => history.push(`/spots/${spot.id}`)}
                    >
                      <img
                        className="previewImage"
                        src={spot.previewImage || "https://jeffrey-zhang-resource.s3.us-west-1.amazonaws.com/public/imageNotFound-svg.png"} alt={spot.name}
                        onMouseMove={
                          (e) => {
                            e.stopPropagation();
                            const cursorX = e.clientX;
                            const cursorY = e.clientY;
                            const spotEl = e.target.getBoundingClientRect();
                            const imageX = spotEl.left;
                            const imageY = spotEl.top;
                            document.querySelector(`.tooltip-${spot.id}`).style.left = cursorX - imageX + 20 + "px";
                            document.querySelector(`.tooltip-${spot.id}`).style.top = cursorY - imageY + 20 + "px";
                          }
                        }
                        // onMouseLeave={
                        //   () => {
                        //     document.querySelector(`.tooltip-${spot.id}`).style.left = "0px";
                        //     document.querySelector(`.tooltip-${spot.id}`).style.top = "0px";
                        //   }
                        // }
                        />
                      <div className="spotLocation">
                        <span className="address">{spot.city}, {spot.state}</span>
                        <span className="stars"><i className="fa-solid fa-star" /> {spot.avgRating ? (Number.isInteger(spot.avgRating) ? spot.avgRating.toFixed(1) : spot.avgRating.toFixed(2)) : "New"}</span>
                      </div>
                      <span className="spotName">{spot.name}</span>
                      <div className="spotPrice"><span>${(+spot.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span> night</div>
                      <span className={`tooltip tooltip-${spot.id}`}>{spot.name}</span>
                    </div>
                    {
                      type === "current" ?
                        <div className="spotManagement">
                          <button onClick={() => history.push(`/spots/${spot.id}/edit`)}>Update</button>
                          <OpenModalButton buttonText="Delete" modalComponent={<ConfirmDelete spot={spot} />} />
                        </div> : null
                    }
                  </div>
                )
              })
            }
          </div> :
          type === "current" ? <NoContent text="You haven't created any place yet" /> : null
      }
      {
        isLoading ?
          <div className="spotLoading">
            <span>Loading</span>
            <div className="eclipse">
              <span>·</span>
              <span>·</span>
              <span>·</span>
            </div>
          </div> :
          null
      }
    </>
  )
}
