import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import * as sessionActions from "./store/session";
import { Navigation } from "./components/Navigation";
import { SpotList } from "./components/SpotList";
import { CreateSpot } from "./components/CreateSpot";

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
            <CreateSpot />
          </Route>
        </Switch>
      </main>
    )
  );
}

export default App;
