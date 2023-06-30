import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ProfileButton } from './ProfileButton';
import { OpenModalButton } from "../OpenModalButton";
import { LoginForm } from '../LoginForm';
import { SignupForm } from '../SignupForm';
import './Navigation.css';


export function Navigation({ isLoaded }) {
  const user = useSelector(state => state.session.user);

  return (
    <ul>
      <li>
        <NavLink exact to="/">Home</NavLink>
      </li>
      {isLoaded && (
        <li>
          <ProfileButton user={user} />
        </li>
      )}
    </ul>
  );
}
