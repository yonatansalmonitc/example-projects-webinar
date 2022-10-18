/**
 * ITC Full-Stack Bootcamp
 * React Micro Blogging assignment
 * 26/07/2022
 * Asaf Gilboa
*/

import React, {useContext, useState, useEffect} from 'react';
import {NavLink} from 'react-router-dom';
import FirebaseContext from '../context/FirebaseContext';
import TweetListContext from '../context/TweetListContext';

export default function NavBar(props) {

    const {auth} = useContext(FirebaseContext);
    const {getNextTweets} = useContext(TweetListContext);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        localStorage.setItem('userSearchQuery', JSON.stringify(searchValue));
        if (!searchValue) {
            localStorage.setItem('scrollCount', JSON.stringify(1));
            getNextTweets();
        }
      }, [searchValue]);

    function handleClick(e) {
        props.navClick(e.target.innerHTML.toLowerCase());
    }

    function searchClick() {
        localStorage.setItem('scrollCount', JSON.stringify(1));
        const displayUserOnly = JSON.parse(localStorage.getItem('displayUserOnly'));
        if (displayUserOnly) return;
        getNextTweets(searchValue);
    }
    

  return (
    <div className="navBar">
        <NavLink to={auth.currentUser ? "/" : "/login"}
        className={ isActive => "navItem" + (!isActive ? ' activeLink' : ' noneActiveLink')}>
            <span onClick={handleClick} >Home</span>
        </NavLink>
        <NavLink to={auth.currentUser ? "/profile" : "/login"}
                className={ isActive => "navItem" + (!isActive ? ' activeLink' : ' noneActiveLink')}>
            <span onClick={handleClick} >Profile</span>
        </NavLink>
        <div className="searchBar">
            <input value={searchValue} onChange={e=>setSearchValue(e.target.value)} type="search" name="searchBar" id="searchBar" placeholder='Search users'/>
            <span className="searchIcon" onClick={searchClick}>🔍</span>
        </div>
        <div className="navItem loggedUser">
            Welcome <b>{props.profileName}</b>
        </div>
        <NavLink to="/login"
                className={ isActive => "navItem" + (!isActive ? ' activeLink' : ' noneActiveLink')}>
            <span onClick={handleClick} >Log Out</span>
        </NavLink>
    </div>
  )
}
