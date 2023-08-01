import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import { OpenModalMenuItem } from "../OpenModalMenuItem";
import { LoginForm } from '../LoginForm';
import { SignupForm } from '../SignupForm';
import { useHistory, Redirect } from "react-router-dom";

export function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef();
  const history = useHistory();

  useEffect(() => {
    const closeMenu = (e) => {
      if (!ref.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', closeMenu);
    }

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const openMenu = () => {
    if (!showMenu) {
      setShowMenu(true);
    }
  };

  const closeMenu = () => setShowMenu(false);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    history.replace("/");
  };

  const manageSpots = (e) => {
    e.preventDefault();
    history.push("/spots/current");
    setShowMenu(false);
  }

  const manageReviews = (e) => {
    e.preventDefault();
    history.push("/reviews/current");
    setShowMenu(false);
  }

  let content;
  if (user) {
    content = (
      <>
        <li className="textList">
          <div>Hello, {user.firstName}!</div>
          <div>{user.email}</div>
        </li>
        <li className="clickableList">Manage Account</li>
        <li className="clickableList" onClick={manageSpots}>Manage Places</li>
        <li className="clickableList" onClick={manageReviews}>Manage Reviews</li>
        <li className="clickableList" onClick={handleLogout}>Log Out</li>
      </>
    )
  } else {
    content = (
      <>
        <OpenModalMenuItem
          itemText="Log In"
          modalComponent={<LoginForm />}
          onItemClick={closeMenu}
        />
        <OpenModalMenuItem
          itemText="Sign Up"
          modalComponent={<SignupForm />}
          onItemClick={closeMenu}
        />
      </>
    )
  }

  return (
    <>
      {
        user &&
          <li>
            <button className="createSpotButton" onClick={() => history.push("/spots/new")}>Airpnp Your Place</button>
          </li>
      }
      <button className="profile" onClick={openMenu}>
        <div className="barsIcon">
          <i className="fa-solid fa-bars" />
        </div>
        <div className="userIcon">
          <div className="iconBackground">
            <i className="fa-solid fa-user" />
          </div>
        </div>
      </button>
      <ul className={"profileDropdown" + (showMenu ? "" : " hidden")} ref={ref}>
        {content}
      </ul>
    </>
  );
}
