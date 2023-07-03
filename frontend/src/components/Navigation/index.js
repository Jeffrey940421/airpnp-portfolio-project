import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ProfileButton } from './ProfileButton';
import logo from "../../assets/logo/logo.svg";
import './Navigation.css';


export function Navigation({ isLoaded }) {
  const user = useSelector(state => state.session.user);

  return (
    <ul className='navigationBar'>
      <li>
        <NavLink exact to="/"><img className="logo" src={logo} alt="logo" /></NavLink>
      </li>
      {isLoaded && (
        <li className='profileSection'>
          <ProfileButton user={user} />
        </li>
      )}
    </ul>
  );
}
