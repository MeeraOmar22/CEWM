// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrxEs6CDdFmto0TChUatIsetAaSd1l4wQ",
  authDomain: "user-profile-c375f.firebaseapp.com",
  projectId: "user-profile-c375f",
  storageBucket: "user-profile-c375f.appspot.com",
  messagingSenderId: "920000217938",
  appId: "1:920000217938:web:50e143f46603200fbff08b",
  measurementId: "G-TEDYVN7BD7"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
console.log('Firebase Initialized:', app);
// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
