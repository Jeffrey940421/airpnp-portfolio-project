import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import "./LoginForm.css";

export function LoginForm() {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const user = useSelector(state => state.session.user);
  const dispatch = useDispatch();

  if (user) {
    return <Redirect to="/" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAvailabilityErrors({});
    setServerErrors({});

    const errors = {};

    if (!credential) errors.credential = "Username or email is required";
    if (!password) errors.password = "Password is required";

    if (Object.values(errors).length) {
      setAvailabilityErrors(errors);
    } else {
      return dispatch(sessionActions.login({ credential, password })).catch(
        async (res) => {
          const data = await res.json();
          if (data && data.errors) {
            setServerErrors(data.errors);
          }
        }
      );
    }
  }

  const handleHide = (e) => {
    e.preventDefault();
    setHidePassword(!hidePassword);
  }

  const handleDemo = async (e) => {
    e.preventDefault();
    const credential = "loui798";
    const password = "password1";
    await dispatch(sessionActions.login({ credential, password }));
  }

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        {serverErrors.credential && <p className="serverError">{serverErrors.credential}</p>}
        <div>
          <label htmlFor="credential">
            Username or Email
          </label>
          <input
            name="credential"
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
          />
          {availabilityErrors.credential && <p className="availabilityError">{availabilityErrors.credential}</p>}
        </div>
        <div>
          <label htmlFor="password">
            Password
          </label>
          <input
            name="password"
            type={hidePassword ? "password" : "text"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleHide}>{hidePassword ? "Show" : "Hide"}</button>
          {availabilityErrors.password && <p className="availabilityError">{availabilityErrors.password}</p>}
        </div>
        <button type="submit">Log In</button>
        <button onClick={handleDemo}>Demo User</button>
      </form>
    </>
  )
}
