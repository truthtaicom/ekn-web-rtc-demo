import firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCC-tvtS52JGYxCh8KzE93nV-Uz1_4-j_M",
  authDomain: "ekinovn-webrtc-demo.firebaseapp.com",
  databaseURL: "https://ekinovn-webrtc-demo.firebaseio.com",
  projectId: "ekinovn-webrtc-demo",
  storageBucket: "ekinovn-webrtc-demo.appspot.com",
  messagingSenderId: "854528521452",
  appId: "1:854528521452:web:634ecfa8ad42241dafa1c9"
};

export default firebase.initializeApp(firebaseConfig);