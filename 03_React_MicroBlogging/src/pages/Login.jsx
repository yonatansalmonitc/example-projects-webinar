/**
 * ITC Full-Stack Bootcamp
 * React Micro Blogging assignment
 * 28/07/2022
 * Asaf Gilboa
*/

import React, { useState, useEffect, useContext } from 'react';
import {signInWithEmailAndPassword, signInWithPopup, 
  createUserWithEmailAndPassword, GoogleAuthProvider} from "firebase/auth";
import FirebaseContext from '../context/FirebaseContext';


export default function Login({connectUser}) {
  
  const {auth}= useContext(FirebaseContext);
  const provider = new GoogleAuthProvider();
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [loginMode, setLoginMode] = useState('Login');
  const [loginMessage1, setLoginMessage1] = useState("First time here? ");
  const [loginMessage2, setLoginMessage2] = useState("Click here to sign up");
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setLoginError("Please log-in/sign-up to proceed.");
  }, []);

  function saveClick(e) {
    e.preventDefault();
    setLoginError('Please login/sign up to proceed.');
    const emailValid = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
    if (!emailValid.test(userEmail)) {
      setLoginError("Invalid email");
      return;
    }
    if (userPassword.length < 6) {
      setLoginError("Password must be at least 6 characters long");
      return;
    }
    if (loginMode === "Sign Up") {
      userSignUp(connectUser);
    } else if (loginMode === "Login") {
      userLogin(connectUser);
    }
    setUserEmail('');
    setUserPassword('');
  }


  function userLogin(connectUser) {
    signInWithEmailAndPassword(auth, userEmail, userPassword)
      .then((cred) => {
        setLoginError('');
        connectUser(cred.user);
      }).catch((err) => {
        if (err.toString() === 'FirebaseError: Firebase: Error (auth/wrong-password).') {
          setLoginError("Wrong password");
        } else if (err.toString() === 'FirebaseError: Firebase: Error (auth/user-not-found).') {
          setLoginError("User not found. Please sign up");
        } else {
          setLoginError(err.toString());
        }
      })
  }

  function userSignUp(connectUser) {
    createUserWithEmailAndPassword(auth, userEmail, userPassword)
      .then((cred) => {
        setLoginError('');
        connectUser(cred.user);
      }).catch((err) => {
        setLoginError(err.toString());
        console.error("Caught error: ", err.message);
      })
  }

  function googleLogin(connectUser) {
    setLoginError('Please login/sign up to proceed.');
    signInWithPopup(auth, provider)
      .then((result) => {
        setLoginError('');
        connectUser(result.user);
      }).catch((err) => {
        setLoginError(err.message);
      });
  }


  function switchMode() {
    if (loginMode === "Login") {
      setLoginMode("Sign Up");
      setLoginMessage1("Already signed up? ")
      setLoginMessage2("Click here to login")
    } else {
      setLoginMode("Login");
      setLoginMessage1("First time here? ")
      setLoginMessage2("Click here to sign up")
    }
  }


  return (
    <>
      <form className='loginContainer'>
        <div className="loginHeader">
          <span className="loginTitle">{loginMode}</span>
          <span className="loginError">{loginError}</span>
        </div>
        <div className="emailLogin">
          <div className="inputTitle">Email</div>
          <input onChange={(e) => setUserEmail(e.target.value)} value={userEmail} type="email" className="loginInput" placeholder="Email ..." required />
        </div>
        <div className="emailLogin">
          <div className="inputTitle">Password</div>
          <input onChange={(e) => setUserPassword(e.target.value)} value={userPassword} type="password" className="loginInput" placeholder="Password ..." required />
        </div>
        <div className="profileBtnWrap">
          <button type='submit' onClick={saveClick} className="submitBtn profileBtn btn btn-primary">{loginMode}</button>
          <span className="loginMode">{loginMessage1}<span onClick={switchMode} className="loginModeClick">{loginMessage2}</span></span>
        </div>
      </form>
      <div className="googleLogin">
        <button onClick={e => googleLogin(connectUser)} className="googleLoginBtn">
          <img src="https://cdn.iconscout.com/icon/free/png-256/google-2981831-2476479.png" alt="G" className='googleIcon' />
          &nbsp; Sign in with Google
        </button>
      </div>
    </>
  )
}
