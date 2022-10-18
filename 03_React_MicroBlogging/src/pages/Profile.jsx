/** PROFILE
 * ITC Full-Stack Bootcamp
 * React Micro Blogging assignment
 * 26/07/2022
 * Asaf Gilboa
*/

import React, { useState, useContext } from 'react';
import TweetListContext from '../context/TweetListContext';
import FirebaseContext from '../context/FirebaseContext';
import { setDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes } from "firebase/storage";

export default function Profile(props) {

  const {profilePic} = useContext(TweetListContext);
  const { db, auth, storage } = useContext(FirebaseContext);
  const [profileName, setProfileName] = useState('');
  const [fileChosen, setFileChosen] = useState(false);


  function saveClick() {
    if (profileName) {
      props.changeUserName(profileName, true);
      props.setUserRef();
    }
    setProfileName('');
  }

  function uploadImg(e) {
    setFileChosen(true);
    if (e.target.files[0]) {
      setUserImg(e.target.files[0]);
    }
    setFileChosen(false);
  }

  async function setUserImg(imgSrc) {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const imgRef = ref(storage, user.uid + '.png');
      uploadBytes(imgRef, imgSrc).then((snapshot) => {
        console.log('uploaded img ', snapshot);
      }).catch(err => {
        console.error("Caught error: ", err.message);
      });
      setDoc(doc(db, "userList", user.uid), {
        userImg: user.uid + '.png'
      }, { merge: true });
      props.getUserImg(user);
    });
    unsubAuth();
  }


  return (
    <div>
      <div className="profileContainer">
        <div className="profileBody">
          <div className="profileNameDiv">
            <div className="profileHeader">Profile</div>
            <div className="inputTitle">User Name</div>
            <input onChange={(e) => setProfileName(e.target.value)} value={profileName}
              type="text" id="profileInput" placeholder={props.profileName} autoComplete="off" />
            <div className="profileBtnWrap">
              <button onClick={saveClick} className="submitBtn profileBtn btn btn-primary">Save Name</button>
            </div>
          </div>
          <div className="profilePicDiv">
            <img src={profilePic} className="profilePic" alt="Profile Picture"
                onError={e => e.target.src='https://icon-library.com/images/default-profile-icon/default-profile-icon-6.jpg'} />
            <label disabled={fileChosen} htmlFor="imgInput" className="impInputLabel">
              <span disabled={fileChosen} className="uploadImgBtn profileBtn btn btn-primary">Upload New Image</span>
              <input disabled={fileChosen} type="file" onChange={uploadImg} id="imgInput" />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}