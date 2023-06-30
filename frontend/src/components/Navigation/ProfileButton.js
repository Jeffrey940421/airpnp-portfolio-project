import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import { OpenModalMenuItem } from "../OpenModalMenuItem";
import { LoginForm } from '../LoginForm';
import { SignupForm } from '../SignupForm';

export function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef();

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
  };

  let content;
  if (user) {
    content = (
      <>
        <li>{user.username}</li>
        <li>{user.firstName} {user.lastName}</li>
        <li>{user.email}</li>
        <li onClick={handleLogout}>Log Out</li>
      </>
    )
  } else {
    content = (
      <>
        <li>
          <OpenModalMenuItem
            itemText="Log In"
            modalComponent={<LoginForm />}
            onItemClick={closeMenu}
          />
        </li>
        <li>
          <OpenModalMenuItem
            itemText="Sign Up"
            modalComponent={<SignupForm />}
            onItemClick={closeMenu}
          />
        </li>
      </>
    )
  }

  return (
    <>
      <button onClick={openMenu}>
        <i className="fa-solid fa-user fa-bounce" />
      </button>
      <ul className={"profile-dropdown" + (showMenu ? "" : " hidden")} ref={ref}>
        {content}
      </ul>
    </>
  );
}
