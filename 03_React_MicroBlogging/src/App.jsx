/**
 * ITC Full-Stack Bootcamp
 * React Micro Blogging assignment
 * 24/07/2022
 * Asaf Gilboa
*/

import './App.css';
import React, { useEffect, useState } from 'react';
import CreateTweet from './components/CreateTweet';
import TweetsList from './components/TweetsList';
import NavBar from './components/NavBar';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { Routes, Route, useNavigate } from 'react-router-dom';
import TweetListContext from './context/TweetListContext';
import FirebaseContext from './context/FirebaseContext';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, onSnapshot, 
  where, setDoc, doc, query, orderBy, limit } from "firebase/firestore";
import { getAuth, signOut, updateProfile, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDMLotcQCHmlupPPXVy0dQFR4TSvPBxBzU",
  authDomain: "twitter-fd605.firebaseapp.com",
  projectId: "twitter-fd605",
  storageBucket: "gs://twitter-fd605.appspot.com",
  messagingSenderId: "148654532122",
  appId: "1:148654532122:web:5a8e987cac920c58da53a3"
};
//*** backup firebase user for quota issues ***
// const firebaseConfig = {
//   apiKey: "AIzaSyD9xElHz_e0-Ks2W7t5rZkVPHnOLjUVtQA",
//   authDomain: "micro-blogging-d5804.firebaseapp.com",
//   projectId: "micro-blogging-d5804",
//   storageBucket: "micro-blogging-d5804.appspot.com",
//   messagingSenderId: "1024241032717",
//   appId: "1:1024241032717:web:3b41386c9f26b046c83f44",
//   measurementId: "G-MMNHPE90GP"
// };


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();
const storage = getStorage();
const tweetColRef = collection(db, "tweetList");
const usersColRef = collection(db, "userList");

function App() {
  const navigate = useNavigate();
  const [tweetList, setTweetList] = useState([]);
  const [loaderToggle, setLoaderToggle] = useState('none');
  const [profileName, setProfileName] = useState(
    localStorage.getItem('profileName') !== null ?
      JSON.parse(localStorage.getItem('profileName')) : "No-User");
  const [profilePic, setProfilePic] = useState('');
  const [bgControl, setBgControl] = useState('main');



  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        getNextTweets();
        getUserImg(user)
      } else {
        navigate('/login');
      }
    });
    unsubAuth();
    localStorage.setItem('scrollCount', JSON.stringify(1));
    localStorage.setItem('displayUserOnly', JSON.stringify(false));
    localStorage.setItem('userSearchQuery', JSON.stringify(''));

    document.addEventListener('scroll', scrollHandler);

    // disable when not necessary, high usage of firebase quota
    onSnapshot(tweetColRef, () => {
      getNextTweets();
    });
  }, []);

  function updateBG() {
    if (JSON.parse(localStorage.getItem('displayUserOnly'))) {
      setBgControl('main userTweetsMode');
    } else {
      setBgControl('main');
    }
  }


  async function getNextTweets() {
    const scrollCount = Number(JSON.parse(localStorage.getItem('scrollCount')));
    const displayUserOnly = JSON.parse(localStorage.getItem('displayUserOnly'));
    const userSearchQuery = JSON.parse(localStorage.getItem('userSearchQuery'));

    let next = query(
      tweetColRef,
      orderBy('date', 'desc'),
      limit(10 * scrollCount));
    if (displayUserOnly) {
      next = query(
        tweetColRef,
        where("userID", "==", auth.currentUser.uid),
        orderBy('date', 'desc'),
        limit(10 * scrollCount));
    } else if (userSearchQuery) {
      next = query(
        tweetColRef,
        where("userName", "==", userSearchQuery),
        orderBy('date', 'desc'),
        limit(10 * scrollCount));
    }

    loading(true);
    getDocs(next).then((nextBatch) => {
      const nextTweets = [];
      nextBatch.docs.forEach((doc) => {
        nextTweets.push({ ...doc.data(), id: doc.id });
      });
      setTweetList(nextTweets);
    }).catch((err) => {
      console.error("Caught error: ", err.message);
    });
    loading(false);
  }


  function navClick(toPage) {
    localStorage.setItem('scrollCount', JSON.stringify(1));
    if (toPage === "logout") {
      signOut(auth).then(() => {
        changeUserName("No-User");
      }).catch(err => {
        console.error("Caught error: ", err.message);
      })
    }
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
    });
    unsubAuth();
    if (toPage === "home") {
      navigate('/');
      getNextTweets();
    }
  }


  function changeUserName(newName, updateDB = false) {
    let goodName = newName;
    if (!newName || updateDB) {
      if (!updateDB) {
        goodName = auth.currentUser.email.toString();
        goodName = goodName.slice(0, goodName.indexOf('@'));
      }
      updateProfile(auth.currentUser, {
        displayName: goodName
      }).then(() => {
        console.log('User display name updated to ' + goodName);
      }).catch(err => {
        console.error("Caught error: ", err.message);
      })
    }
    setProfileName(goodName);
    localStorage.setItem('profileName', JSON.stringify(goodName));
  }


  function connectUser(userCred) {
    changeUserName(userCred.displayName);
    navClick('home');
    setUserRef();
    getUserImg(userCred);
  }


  async function setUserRef() {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setDoc(doc(db, "userList", user.uid), {
        userName: JSON.parse(localStorage.getItem('profileName')),
        userID: user.uid
      }, { merge: true })
    });
    unsubAuth();
  }


  function getUserImg(userCred) {
    if (!userCred) {
      setProfilePic('https://icon-library.com/images/default-profile-icon/default-profile-icon-6.jpg');
      return;
    }
    const imgPath = userCred.uid + '.png';
    getDownloadURL(ref(storage, imgPath))
      .then((url) => {
        setProfilePic(url);
      }).catch((err) => {
        setProfilePic('https://icon-library.com/images/default-profile-icon/default-profile-icon-6.jpg');
        console.error("Caught error: ", err.message);
      });
  }


  function scrollHandler() {
    const e = document.documentElement;
    let scrollPosition = Math.ceil(e.scrollTop + e.offsetHeight);
    if (scrollPosition >= e.scrollHeight) {
      let scrollCount = Number(JSON.parse(localStorage.getItem('scrollCount'))) + 1;
      localStorage.setItem('scrollCount', JSON.stringify(scrollCount));
      getNextTweets();
    }
  }


  function loading(on) {
    on ? setLoaderToggle('initial') : setLoaderToggle('none');
  }


  const homePage =
    <div className="feed">
      <CreateTweet />
      <div className="spinner-grow text-info m-auto mt-5 loader" style={{ display: loaderToggle }} role="status"></div>
      <TweetsList />
    </div>;
  const profilePage = <Profile changeUserName={changeUserName}
    profileName={profileName} setUserRef={setUserRef} getUserImg={getUserImg} />
  const loginPage = <Login connectUser={connectUser} />


  return (
    <div className={bgControl}>
      <FirebaseContext.Provider value={{ db, auth, usersColRef, tweetColRef, storage }}>
        <TweetListContext.Provider value={{ tweetList, getNextTweets, profilePic, updateBG }}>
          <NavBar navClick={navClick} profileName={profileName} />
          <Routes >
            <Route path="/" element={homePage} />
            <Route path="/profile" element={profilePage} />
            <Route path="/login" element={loginPage} />
          </Routes>
        </TweetListContext.Provider>
      </FirebaseContext.Provider>
    </div>
  );
}

export default App;
