import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavComponent.css";
import {RiArrowDropDownLine} from 'react-icons/ri'

const NavComponent = ({ user, setUser, setToken, setAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser('')
    setToken('')
    setAuthenticated(false)
    navigate('/')
  }
  return (
    <div className="navbar">
      <label onClick={()=> {navigate('/images')}}>Images</label>
      <label onClick={()=> {navigate('/upload')}}>Upload</label>
      <div className="dropdown">
        <button className="dropbtn">
          {user}
          <RiArrowDropDownLine />
        </button>
        <div className="dropdown-content">
          <label onClick={() => handleLogout()}>Logout</label>
        </div>
      </div>
    </div>
  );
};

export default NavComponent;
