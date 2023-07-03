import React, { useEffect, useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import "./LoginForm.css";
import { useModal } from "../../context/Modal";

export function LoginForm() {
  const [credential, setCredential] = useState("");
  const [onchangeCredential, setOnchangeCredential] = useState("");
  const [credentialEdited, setCredentialEdited] = useState(false);
  const [password, setPassword] = useState("");
  const [onchangePassword, setOnchangePassword] = useState("");
  const [passwordEdited, setPasswordEdited] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  useEffect(() => {
    const errors = {};

    if (credentialEdited && !credential) errors.credential = "Username or email is required";
    if (passwordEdited && !password) errors.password = "Password is required";

    setAvailabilityErrors(errors);
  }, [credential, credentialEdited, password, passwordEdited]);

  useEffect(() => {
    const errors = {};

    if (credential && credential.length < 4) errors.credential = "Username or email must be at least 4 characters long";
    if (password && password.length < 6) errors.password = "Password must be at least 6 characters long";

    setValidationErrors(errors);
  }, [credential, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});

    if (!Object.values(availabilityErrors).length && !Object.values(validationErrors).length) {
      return dispatch(sessionActions.login({ credential, password }))
        .then(closeModal)
        .catch(
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
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(
        async (res) => {
          const data = await res.json();
          if (data && data.errors) {
            setServerErrors(data.errors);
          }
        }
      );
  }

  return (
    <>
      <h1 className="loginTitle">Log In</h1>
      <form className="loginForm" onSubmit={handleSubmit}>
        {serverErrors.credential && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.credential}</p>}
        <div className={`inputBox ${availabilityErrors.credential || validationErrors.credential || serverErrors.credential? "error" : ""}`}>
          <label htmlFor="credential">
            Username or Email
          </label>
          <input
            name="credential"
            type="text"
            value={onchangeCredential}
            onChange={(e) => setOnchangeCredential(e.target.value)}
            onBlur={(e) => {
              setCredential(e.target.value);
              setCredentialEdited(true);
            }}
          />
        </div>
        <div className="errorMessage">
          {availabilityErrors.credential && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.credential}</p>}
          {validationErrors.credential && <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {validationErrors.credential}</p>}
        </div>
        <div className={`inputBox ${availabilityErrors.password || validationErrors.password || serverErrors.credential ? "error" : ""}`}>
          <label htmlFor="password">
            Password
          </label>
          <input
            name="password"
            type={hidePassword ? "password" : "text"}
            value={onchangePassword}
            onChange={(e) => setOnchangePassword(e.target.value)}
            onBlur={(e) => {
              setPassword(e.target.value);
              setPasswordEdited(true);
            }}
          />
          <button onClick={handleHide}>{hidePassword ? "Show" : "Hide"}</button>

        </div>
        <div className="errorMessage">
          {availabilityErrors.password && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.password}</p>}
          {validationErrors.password && <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {validationErrors.password}</p>}
        </div>
        <div className="submitButtons">
          <button
            type="submit"
            disabled={Object.values(availabilityErrors).length || Object.values(validationErrors).length || !credentialEdited || !passwordEdited}
          >
            Log In
          </button>
          <button onClick={handleDemo}>Log In as Demo User</button>
        </div>
      </form>
    </>
  )
}
