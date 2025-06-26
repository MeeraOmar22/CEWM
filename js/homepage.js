import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

console.log("Setting up onAuthStateChanged listener");

// Use the `onAuthStateChanged` listener to handle login state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user); // Log the user object

    // Fetch user data from Firestore using the UID
    const docRef = doc(db, "users", user.uid);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("User data found:", userData);

          // Update the UI with the fetched user data
          document.getElementById('loggedUserFName').innerText = userData.firstName;
          document.getElementById('loggedUserEmail').innerText = userData.email;
          document.getElementById('loggedUserLName').innerText = userData.lastName;
        } else {
          console.log("No document found matching ID");
        }
      })
      .catch((error) => {
        console.error("Error getting document:", error);
      });
  } else {
    console.log("No user logged in");
    window.location.href = "index.html"; // Redirect to login page if no user is logged in
  }
});

