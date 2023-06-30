import React, { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import "./SignupForm.css";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [onchangeEmail, setOnchangeEmail] = useState("");
  const [username, setUsername] = useState("");
  const [onchangeUsername, setOnchangeUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [onchangeFirstName, setOnchangeFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [onchangeLastName, setOnchangeLastName] = useState("");
  const [password, setPassword] = useState("");
  const [onchangePassword, setOnchangePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [onchangeConfirmPassword, setOnchangeConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const user = useSelector(state => state.session.user);
  const dispatch = useDispatch();

  const capitalize = (str) => {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  }

  useEffect(() => {
    const errors = { email: [], username: [], firstName: [], lastName: [], password: [] }

    if (email && email.length < 3) errors.email.push("Email must be at least 3 characters long");
    if (email && email.length > 256) errors.email.push("Email must be at most 256 characters long");
    if (email && !email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) errors.email.push("Email is invalid");

    if (onchangeEmail) {
      setAvailabilityErrors((prev) => {
        delete prev.email;
        return prev;
      });
    }

    if (username && username.length < 4) errors.username.push("Username must be at least 4 characters long");
    if (username && username.length > 30) errors.username.push("Username must be at most 30 characters long");
    if (username && username.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) errors.username.push("Username must not be an email");

    if (onchangeUsername) {
      setAvailabilityErrors((prev) => {
        delete prev.username;
        return prev;
      });
    }

    if (firstName && firstName.length > 30) errors.firstName.push("First name must be at most 30 characters long");
    if (firstName && !firstName.match(/^[a-zA-Z]+$/)) errors.firstName.push("First name must contain alphabetic characters only");

    if (onchangeFirstName) {
      setAvailabilityErrors((prev) => {
        delete prev.firstName;
        return prev;
      });
    }

    if (lastName && lastName.length > 30) errors.lastName.push("Last name must be at most 30 characters long");
    if (lastName && !lastName.match(/^[a-zA-Z]+$/)) errors.lastName.push("Last name must contain alphabetic characters only");

    if (onchangeLastName) {
      setAvailabilityErrors((prev) => {
        delete prev.lastName;
        return prev;
      });
    }

    if (password && password.length < 6) errors.password.push("Password must be at least 6 characters long");
    if (password && ((firstName && password.toLowerCase().includes(firstName.toLowerCase())) || (lastName && password.toLowerCase().includes(lastName.toLowerCase())) || (email && password.toLowerCase().includes(email.split("@")[0].toLowerCase())))) errors.password.push("Password must not contain first name, last name, or email");

    if (onchangePassword) {
      setAvailabilityErrors((prev) => {
        delete prev.password;
        return prev;
      });
    }

    if (confirmPassword && confirmPassword !== password) errors.confirmPassword = "Confirm password must match password";

    if (onchangeConfirmPassword) {
      setAvailabilityErrors((prev) => {
        delete prev.confirmPassword;
        return prev;
      });
    }

    setValidationErrors(errors);
  }, [email, username, firstName, lastName, password, confirmPassword, onchangeEmail, onchangeUsername, onchangeFirstName, onchangeLastName, onchangePassword, onchangeConfirmPassword])

  if (user) {
    return <Redirect to="/" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAvailabilityErrors({});
    setServerErrors({});

    const errors = {};

    if (!email) errors.email = "Email is required";
    if (!username) errors.username = "Username is required";
    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!password) errors.lastName = "Password is required";
    if (!confirmPassword) errors.confirmPassword = "Confirm password is required";

    if (Object.values(errors).length) {
      setAvailabilityErrors(errors);
    } else {
      if (!Object.values(validationErrors).flat().length) {
        return dispatch(sessionActions.signup({
          email,
          username,
          firstName: capitalize(firstName),
          lastName: capitalize(lastName),
          password
        })).catch(
          async (res) => {
            const data = await res.json();
            if (data && data.errors) {
              setServerErrors(data.errors);
            }
          }
        );
      }
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
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">
            Email
          </label>
          <input
            name="email"
            type="text"
            value={onchangeEmail}
            onChange={(e) => setOnchangeEmail(e.target.value)}
            onBlur={(e) => setEmail(e.target.value)}
          />
          {validationErrors.email && validationErrors.email.length > 0 && validationErrors.email.map(error => (
            <p className="validationError">{error}</p>
          ))}
          {availabilityErrors.email && <p className="availabilityError">{availabilityErrors.email}</p>}
          {serverErrors.email && <p className="serverError">{serverErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="username">
            Username
          </label>
          <input
            name="username"
            type="text"
            value={onchangeUsername}
            onChange={(e) => setOnchangeUsername(e.target.value)}
            onBlur={(e) => setUsername(e.target.value)}
          />
          {validationErrors.username && validationErrors.username.length > 0 && validationErrors.username.map(error => (
            <p className="validationError">{error}</p>
          ))}
          {availabilityErrors.username && <p className="availabilityError">{availabilityErrors.username}</p>}
          {serverErrors.username && <p className="serverError">{serverErrors.username}</p>}
        </div>
        <div>
          <label htmlFor="firstName">
            First Name
          </label>
          <input
            name="firstName"
            type="text"
            value={onchangeFirstName}
            onChange={(e) => setOnchangeFirstName(e.target.value)}
            onBlur={(e) => setFirstName(e.target.value)}
          />
          {validationErrors.firstName && validationErrors.firstName.length > 0 && validationErrors.firstName.map(error => (
            <p className="validationError">{error}</p>
          ))}
          {availabilityErrors.firstName && <p className="availabilityError">{availabilityErrors.firstName}</p>}
          {serverErrors.firstName && <p className="serverError">{serverErrors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName">
            Last Name
          </label>
          <input
            name="lastName"
            type="text"
            value={onchangeLastName}
            onChange={(e) => setOnchangeLastName(e.target.value)}
            onBlur={(e) => setLastName(e.target.value)}
          />
          {validationErrors.lastName && validationErrors.lastName.length > 0 && validationErrors.lastName.map(error => (
            <p className="validationError">{error}</p>
          ))}
          {availabilityErrors.lastName && <p className="availabilityError">{availabilityErrors.lastName}</p>}
          {serverErrors.lastName && <p className="serverError">{serverErrors.lastName}</p>}
        </div>
        <div>
          <label htmlFor="password">
            Password
          </label>
          <input
            name="password"
            type={hidePassword ? "password" : "text"}
            value={onchangePassword}
            onChange={(e) => setOnchangePassword(e.target.value)}
            onBlur={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleHidePassword}>{hidePassword ? "Show" : "Hide"}</button>
          {validationErrors.password && validationErrors.password.length > 0 && validationErrors.password.map(error => (
            <p className="validationError">{error}</p>
          ))}
          {availabilityErrors.password && <p className="availabilityError">{availabilityErrors.password}</p>}
          {serverErrors.password && <p className="serverError">{serverErrors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            name="confirmPassword"
            type={hideConfirmPassword ? "password" : "text"}
            value={onchangeConfirmPassword}
            onChange={(e) => setOnchangeConfirmPassword(e.target.value)}
            onBlur={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handleHideConfirmPassword}>{hideConfirmPassword ? "Show" : "Hide"}</button>
          {validationErrors.confirmPassword && <p className="validationError">{validationErrors.confirmPassword}</p>}
          {availabilityErrors.confirmPassword && <p className="availabilityError">{availabilityErrors.confirmPassword}</p>}
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </>
  )
}
