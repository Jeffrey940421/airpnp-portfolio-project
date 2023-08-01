import React, { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import "./SignupForm.css";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [onchangeEmail, setOnchangeEmail] = useState("");
  const [emailEdited, setEmailEdited] = useState(false);
  const [username, setUsername] = useState("");
  const [onchangeUsername, setOnchangeUsername] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [onchangeFirstName, setOnchangeFirstName] = useState("");
  const [firstNameEdited, setFirstNameEdited] = useState(false);
  const [lastName, setLastName] = useState("");
  const [onchangeLastName, setOnchangeLastName] = useState("");
  const [lastNameEdited, setLastNameEdited] = useState(false);
  const [password, setPassword] = useState("");
  const [onchangePassword, setOnchangePassword] = useState("");
  const [passwordEdited, setPasswordEdited] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("");
  const [onchangeConfirmPassword, setOnchangeConfirmPassword] = useState("");
  const [confirmPasswordEdited, setConfirmPasswordEdited] = useState(false)
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const capitalize = (str) => {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  }

  useEffect(() => {
    const errors = {};

    if (emailEdited && !email) errors.email = "Email is required";
    if (usernameEdited && !username) errors.username = "Username is required";
    if (firstNameEdited && !firstName) errors.firstName = "First name is required";
    if (lastNameEdited && !lastName) errors.lastName = "Last name is required";
    if (passwordEdited && !password) errors.password = "Password is required";
    if (confirmPasswordEdited && !confirmPassword) errors.confirmPassword = "Confirm password is required";

    setAvailabilityErrors(errors);
  }, [emailEdited, email, usernameEdited, username, firstNameEdited, firstName, lastNameEdited, lastName, passwordEdited, password, confirmPasswordEdited, confirmPassword])

  useEffect(() => {
    const errors = { email: [], username: [], firstName: [], lastName: [], password: [] };

    if (email && email.length > 255) errors.email.push("Email must be at most 255 characters long");
    if (email && !email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) errors.email.push("Email is invalid");

    if (username && username.length < 4) errors.username.push("Username must be at least 4 characters long");
    if (username && username.length > 30) errors.username.push("Username must be at most 30 characters long");
    if (username && username.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) errors.username.push("Username must not be an email");

    if (firstName && firstName.length > 30) errors.firstName.push("First name must be at most 30 characters long");
    if (firstName && !firstName.match(/^[a-zA-Z]+$/)) errors.firstName.push("First name must contain alphabetic characters only");

    if (lastName && lastName.length > 30) errors.lastName.push("Last name must be at most 30 characters long");
    if (lastName && !lastName.match(/^[a-zA-Z]+$/)) errors.lastName.push("Last name must contain alphabetic characters only");

    if (password && password.length < 6) errors.password.push("Password must be at least 6 characters long");
    if (password && ((firstName && password.toLowerCase().includes(firstName.toLowerCase())) || (lastName && password.toLowerCase().includes(lastName.toLowerCase())) || (email && password.toLowerCase().includes(email.split("@")[0].toLowerCase())))) errors.password.push("Password must not contain first name, last name, or email");

    if (confirmPassword && confirmPassword !== password) errors.confirmPassword = "Confirm password must match password";

    setValidationErrors(errors);
  }, [email, username, firstName, lastName, password, confirmPassword])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});


    if (!Object.values(availabilityErrors).length && !Object.values(validationErrors).flat().length) {
      return dispatch(sessionActions.signup({
        email,
        username,
        firstName: capitalize(firstName),
        lastName: capitalize(lastName),
        password
      }))
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


  const handleHidePassword = (e) => {
    e.preventDefault();
    setHidePassword(!hidePassword);
  }

  const handleHideConfirmPassword = (e) => {
    e.preventDefault();
    setHideConfirmPassword(!hideConfirmPassword);
  }

  return (
    <>
      <h1 className="signupTitle">Sign Up</h1>
      <form className="signupForm" onSubmit={handleSubmit}>
        <div className={`inputBox ${availabilityErrors.email || (validationErrors.email && validationErrors.email.length) || serverErrors.email ? "error" : ""}`}>
          <label htmlFor="email">
            Email
          </label>
          <input
            name="email"
            type="text"
            value={onchangeEmail}
            onChange={(e) => setOnchangeEmail(e.target.value)}
            onBlur={(e) => {
              setEmail(e.target.value);
              setEmailEdited(true);
            }}
            autoComplete="one-time-code"
          />
        </div>
        <div className="errorMessage">
          {serverErrors.email && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.email}</p>}
          {availabilityErrors.email && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.email}</p>}
          {validationErrors.email && validationErrors.email.length > 0 && validationErrors.email.map(error => (
            <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error} </p>
          ))}
        </div>
        <div className={`inputBox ${availabilityErrors.username || (validationErrors.username && validationErrors.username.length) || serverErrors.username ? "error" : ""}`}>
          <label htmlFor="username">
            Username
          </label>
          <input
            name="username"
            type="text"
            value={onchangeUsername}
            onChange={(e) => setOnchangeUsername(e.target.value)}
            onBlur={(e) => {
              setUsername(e.target.value);
              setUsernameEdited(true);
            }}
            autoComplete="one-time-code"
          />
        </div>
        <div className="errorMessage">
          {serverErrors.username && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.username}</p>}
          {availabilityErrors.username && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.username}</p>}
          {validationErrors.username && validationErrors.username.length > 0 && validationErrors.username.map(error => (
            <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error}</p>
          ))}
        </div>
        <div className={`inputBox ${availabilityErrors.firstName || (validationErrors.firstName && validationErrors.firstName.length) || serverErrors.firstName ? "error" : ""}`}>
          <label htmlFor="firstName">
            First Name
          </label>
          <input
            name="firstName"
            type="text"
            value={onchangeFirstName}
            onChange={(e) => setOnchangeFirstName(e.target.value)}
            onBlur={(e) => {
              setFirstName(e.target.value);
              setFirstNameEdited(true);
            }}
            autoComplete="one-time-code"
          />
        </div>
        <div className="errorMessage">
          {serverErrors.firstName && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.firstName}</p>}
          {availabilityErrors.firstName && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.firstName}</p>}
          {validationErrors.firstName && validationErrors.firstName.length > 0 && validationErrors.firstName.map(error => (
            <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error}</p>
          ))}
        </div>
        <div className={`inputBox ${availabilityErrors.lastName || (validationErrors.lastName && validationErrors.lastName.length) || serverErrors.lastName ? "error" : ""}`}>
          <label htmlFor="lastName">
            Last Name
          </label>
          <input
            name="lastName"
            type="text"
            value={onchangeLastName}
            onChange={(e) => setOnchangeLastName(e.target.value)}
            onBlur={(e) => {
              setLastName(e.target.value);
              setLastNameEdited(true);
            }}
            autoComplete="one-time-code"
          />
        </div>
        <div className="errorMessage">
          {serverErrors.lastName && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.lastName}</p>}
          {availabilityErrors.lastName && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.lastName}</p>}
          {validationErrors.lastName && validationErrors.lastName.length > 0 && validationErrors.lastName.map(error => (
            <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error}</p>
          ))}
        </div>
        <div className={`inputBox ${availabilityErrors.password || (validationErrors.password && validationErrors.password.length) || serverErrors.password ? "error" : ""}`}>
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
            autoComplete="one-time-code"
          />
          <button onClick={handleHidePassword}>{hidePassword ? "Show" : "Hide"}</button>
        </div>
        <div className="errorMessage">
          {serverErrors.password && <p className="serverError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {serverErrors.password}</p>}
          {availabilityErrors.password && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.password}</p>}
          {validationErrors.password && validationErrors.password.length > 0 && validationErrors.password.map(error => (
            <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {error}</p>
          ))}
        </div>
        <div className={`inputBox ${availabilityErrors.confirmPassword || (validationErrors.confirmPassword && validationErrors.confirmPassword.length) || serverErrors.confirmPassword ? "error" : ""}`}>
          <label htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            name="confirmPassword"
            type={hideConfirmPassword ? "password" : "text"}
            value={onchangeConfirmPassword}
            onChange={(e) => setOnchangeConfirmPassword(e.target.value)}
            onBlur={(e) => {
              setConfirmPassword(e.target.value);
              setConfirmPasswordEdited(true);
            }}
            autoComplete="one-time-code"
          />
          <button onClick={handleHideConfirmPassword}>{hideConfirmPassword ? "Show" : "Hide"}</button>
        </div>
        <div className="errorMessage">
          {availabilityErrors.confirmPassword && <p className="availabilityError"><i className="fa-sharp fa-solid fa-circle-exclamation" /> {availabilityErrors.confirmPassword}</p>}
          {validationErrors.confirmPassword && <p className="validationError"><i className="fa-solid fa-circle-xmark" /> {validationErrors.confirmPassword}</p>}
        </div>
        <div className="submitButtons">
          <button
            type="submit"
            disabled={Object.values(availabilityErrors).length || Object.values(validationErrors).flat().length || (!emailEdited && !email) || (!usernameEdited && !username) || (!firstNameEdited && !firstName) || (!lastNameEdited && !lastName) || (!passwordEdited && !password) || (!confirmPasswordEdited && !confirmPassword) }
          >
            Sign Up
          </button>
        </div>
      </form>
    </>
  )
}
