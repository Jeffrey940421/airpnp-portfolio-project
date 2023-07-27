import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import * as sessionActions from "./store/session";
import { Navigation } from "./components/Navigation";
import { SpotList } from "./components/SpotList";
import { CreateSpotContainer } from "./components/CreateSpot";
import { SpotDetail } from "./components/SpotDetail";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    isLoaded && (
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
            <SpotList type="current"/>
          </Route>
          <Route exact path="/spots/:spotId/edit">
            <CreateSpotContainer type="edit" />
          </Route>
          <Route exact path="/spots/:spotId">
            <SpotDetail />
          </Route>
        </Switch>
      </main>
    )
  );
}

export default App;
