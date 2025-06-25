console.log("firebaseauth.js script loaded");

import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { 
  setDoc, 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// ✅ DO NOT put <script> tags inside this file!

function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  const signUp = document.getElementById("submitSignUp");

  if (signUp) {
    signUp.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("Sign Up button clicked");

      const email = document.getElementById("rEmail").value;
      const password = document.getElementById("rPassword").value;
      const firstName = document.getElementById("fName").value;
      const lastName = document.getElementById("lName").value;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
        });

        await setDoc(doc(db, "users", user.uid), {
          email,
          firstName,
          lastName,
          role: "employee",
          displayName: `${firstName} ${lastName}`
        });

        showMessage("Account Created Successfully", "signUpMessage");
        window.location.href = "index.html";
      } catch (error) {
        console.log("Error creating user:", error);
        const message = error.code === "auth/email-already-in-use"
          ? "Email Address Already Exists !!!"
          : "Unable to create User";
        showMessage(message, "signUpMessage");
      }
    });
  }

  const signIn = document.getElementById("submitSignIn");

  if (signIn) {
    signIn.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("Sign In button clicked");

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem("loggedInUserId", user.uid);

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const role = docSnap.data().role;
          if (role === "admin") {
            window.location.href = "homepage.html";
          } else if (role === "employee") {
            window.location.href = "employeeDashboard.html";
          } else {
            alert("No role assigned. Contact system admin.");
          }
        } else {
          console.error("No user document found!");
          showMessage("User data missing in database", "signInMessage");
        }
      } catch (error) {
        console.log("Sign In Error:", error);
        const message = error.code === "auth/invalid-credential"
          ? "Incorrect Email or Password"
          : "Account does not Exist";
        showMessage(message, "signInMessage");
      }
    });
  }
});
