import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import * as sessionActions from "./store/session";
import { Navigation } from "./components/Navigation";
import { SpotList } from "./components/SpotList";
import { CreateSpotContainer } from "./components/CreateSpot";
import { SpotDetail } from "./components/SpotDetail";
import { ManageReviews } from "./components/ManageReviews";
import { ManageTrips } from "./components/ManageTrips";
import { Error } from "./components/Error";
import { Reserve } from "./components/Reserve";
import { Footer } from "./components/Footer";
import { ManageReservations } from "./components/ManageReservations";
import { ScrollToTop } from "./components/ScrollToTop";


function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const user = useSelector(state => state.session.user);

  useEffect(() => {
    dispatch(sessionActions.restoreUser())
      .then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    isLoaded && (
      <>
        <ScrollToTop />
        <main>
          <Navigation isLoaded={isLoaded} />
          <Switch>
            <Route exact path="/">
              <SpotList />
            </Route>
            <Route exact path="/spots/new">
              <CreateSpotContainer />
            </Route>
            <Route exact path="/spots/current">
              <SpotList type="current" key={user ? user.id : 0} />
            </Route>
            <Route exact path="/spots/:spotId/edit">
              <CreateSpotContainer type="edit" />
            </Route>
            <Route exact path="/spots/:spotId">
              <SpotDetail />
            </Route>
            <Route exact path="/reviews/current">
              <ManageReviews key={user ? user.id : 0} />
            </Route>
            <Route exact path="/bookings/current">
              <ManageTrips key={user ? user.id : 0} />
            </Route>
            <Route exact path="/error/:status">
              <Error />
            </Route>
            <Route exact path="/reservations/current">
              <ManageReservations key={user ? user.id : 0}/>
            </Route>
            <Route>
              <Error status="404" />
            </Route>
          </Switch>
        </main >
        <Footer />
      </>
    )
  );
}

export default App;
