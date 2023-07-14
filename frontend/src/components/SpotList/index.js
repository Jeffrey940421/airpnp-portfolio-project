import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { listSpots } from "../../store/spots";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "./SpotList.css";

export function SpotList() {
  const dispatch = useDispatch();
  const history = useHistory();
  const spots = useSelector(state => state.spots.spotList);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false);

  const fetchSpots = async () => {
    if (page <= 10 && hasMore) {
      setIsLoading(true);
      const data = await dispatch(listSpots({ page: page }));
      if (data.Spots.length === 20) {
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSpots();
  }, []);

  const handleScroll = () => {
    const bottom = window.innerHeight + document.documentElement.scrollTop > document.body.offsetHeight;
    if (bottom) {
      fetchSpots();
    }
  };

  useEffect(() => {
    if (!isLoading) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isLoading]);


  useEffect(() => {
    const reviewImages = document.querySelectorAll(".spot .previewImage");
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
    <div className="spotList">
      {Object.values(spots).map((spot, i) => {
        return (
          <div className="spot" key={spot.id} onClick={() => history.push(`/spots/${spot.id}`)}>
            <img className="previewImage" src={spot.previewImage} alt={spot.name} />
            <div className="spotLocation">
              <span className="address">{spot.city}, {spot.state}</span>
              <span className="starts"><i className="fa-solid fa-star" /> {spot.avgRating ? (Number.isInteger(spot.avgRating) ? spot.avgRating.toFixed(1) : spot.avgRating.toFixed(2)) : "New"}</span>
            </div>
            <span className="spotName">{spot.name}</span>
            <div className="spotPrice"><span>${spot.price.toLocaleString("en-US")}</span> night</div>
          </div>
        )
      })}
    </div>
  )
}
