import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBtpTvieDq1ATn9ypcDuGrMkpB_Ha0mzfU",
  authDomain: "globetrotter-1795b.firebaseapp.com",
  projectId: "globetrotter-1795b",
  storageBucket: "globetrotter-1795b.appspot.com",
  messagingSenderId: "282165445055",
  appId: "1:282165445055:web:f3bfeedc2452fd4070210a",
  measurementId: "G-QQ2Q440RQV"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1 className='logo'>GlobeTrotter Community Chat</h1>
        <SignOut />
      </header>
      <Rules/>
      <section className='chatroom'>
        {user ? <ChatRoom />: <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button className='formbutton' type="submit" disabled={!formValue}>Send</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://i.pinimg.com/originals/da/96/78/da96780e1b54f46d6ddb13c3e14cec83.jpg'} />
      <div className="displayMessage">
        <h6 className='displayName'>{displayName}</h6> 
        <p className='displayText'>{text}</p>
      </div>
      
    </div>
  </>)
}

function Rules(){
  return(<>
    <div className="rules">
      <h4>By joining this chat,</h4>
      <p className="rulesDesc"> you agree to be kind and respectful towards other members.</p>
        <ui className="rulesList">
          <li className="rulesListItem">No nudity, sexual acts or sexual harassment.</li>
          <li className="rulesListItem">No threats, violence, or harm.</li>
          <li className="rulesListItem">No hateful conduct or harassment.</li>
          <li className="rulesListItem">No inappropriate comments.</li>
          <li className="rulesListItem">No selling or spamming</li>
        </ui>
      <p className="rulesDesc">You must also be at least 13 years of age to enter.</p>
      <p className="rulesDesc">By joining this chat, you are confirming that you accept and agree to these terms. 
      Any violation of these terms may result in your account's access being limited.</p>
      

    </div>
    </>
  )
}


export default App;
