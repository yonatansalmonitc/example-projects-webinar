/**
 * ITC Full-Stack Bootcamp
 * React Micro Blogging assignment
 * 24/07/2022
 * Asaf Gilboa
*/

import React, { useState, useContext, useEffect } from 'react';
import FirebaseContext from '../context/FirebaseContext';
import { getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

export default function Tweet(props) {

  const {usersColRef, storage} = useContext(FirebaseContext);
  const [userName, setUserName] = useState("N/A");
  const [profilePic, setProfilePic] = useState('https://icon-library.com/images/default-profile-icon/default-profile-icon-6.jpg');

  useEffect(() => {
    getDocs(usersColRef).then((snapshot) => {
      snapshot.docs.forEach((document) => {
        let data = { ...document.data() };
        if (data.userID === props.tweet.userID) {
          setUserName(data.userName);
          getDownloadURL(ref(storage, data.userImg))
          .then((url) => {
            setProfilePic(url);
          }).catch((err) => {
            setProfilePic('https://icon-library.com/images/default-profile-icon/default-profile-icon-6.jpg');
            console.error("Caught error: ", err.message);
          });
          // break;
        }
      })
    }).catch(err => {
      console.error("Caught error: ", err.message);
    });
  }, []);

  return (
    <div className='tweetContainer'>
      <div className="tweetHead">
        <span className="userName">{userName}</span>
        <span className="tweetDate">
          {`${(new Date(props.tweet.date)).toTimeString().slice(0, 8)} 
                ${(new Date(props.tweet.date)).toDateString()}`}
        </span>
      </div>
      <div className="tweetBody">
        <img src={profilePic} className="tweetAvatar" alt="Profile Picture"
          onError={e => e.target.src = 'https://icon-library.com/images/default-profile-icon/default-profile-icon-6.jpg'} />
        <div className="tweetContent">{props.tweet.content}</div>
      </div>
    </div>
  )
}
