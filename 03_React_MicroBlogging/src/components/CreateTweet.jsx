/**
 * ITC Full-Stack Bootcamp
 * React Micro Blogging assignment
 * 24/07/2022
 * Asaf Gilboa
*/

import React, { useEffect, useState, useContext } from 'react';
import TweetListContext from '../context/TweetListContext';
import FirebaseContext from '../context/FirebaseContext';
import uuid from 'react-uuid';
import { addDoc } from "firebase/firestore";


export default function CreateTweet() {

  const [formText, setFormText] = useState('');
  const [formBtn, setFormBtn] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [showOnlyUser, setShowOnlyUser] = useState(false);
  const [filterDisabled, setFilterDisabled] = useState(false);
  const { auth, tweetColRef } = useContext(FirebaseContext);
  const {getNextTweets, updateBG} = useContext(TweetListContext);

  useEffect(() => {
    if (formText.length > 140) {
      setFormBtn(true);
      setFormMessage("The tweet can't contain more than 140 characters.");
    } else {
      setFormBtn(false);
      setFormMessage("");
    }
  }, [formText]);


  async function publishClick(e) {
    if (formText === '') {
      return;
    }
    e.target.style.pointerEvents = "none";
    setFilterDisabled(true);
    const newTweet = {
      content: formText,
      userName: JSON.parse(localStorage.getItem('profileName')),
      date: new Date().toISOString(),
      userID: auth.currentUser.uid,
      id: uuid()
    };
    setFormText('');
    addTweet(newTweet);
    setTimeout(() => {
      e.target.style.pointerEvents = "initial";
      setFilterDisabled(false);
    }, 1000);
  }

  async function addTweet(tweet) {
    addDoc(tweetColRef, {
      content: tweet.content,
      userID: tweet.userID,
      date: tweet.date,
      id: tweet.id
    }).then(() => {
      console.log("added tweet: ", tweet);
    }).catch(err => {
      console.error("Caught error: ", err.message);
    })
  }

  function displayChange(e) {
    e.target.style.pointerEvents = "none";
    setTimeout(() => {
      e.target.style.pointerEvents = "initial";
    }, 2000);
    setShowOnlyUser(showOnlyUser => !showOnlyUser);
    const displayUserOnly = JSON.parse(localStorage.getItem('displayUserOnly'));
    localStorage.setItem('displayUserOnly', JSON.stringify(!displayUserOnly));
    localStorage.setItem('scrollCount', JSON.stringify(1));
    updateBG();
    getNextTweets();
  }


  return (
    <>
      <div className="createTweetForm">
        <textarea onChange={(e) => setFormText(e.target.value)} value={formText}
          className="createTweetInput" placeholder="What do you have in mind..." ></textarea>
        <div className="formBottomBar">
          <span className="formMessage">{formMessage}</span>
          <button onClick={publishClick} disabled={formBtn} className="submitBtn btn btn-primary">
            Tweet
          </button>
        </div>
      </div>
  
    </>
  )
}
