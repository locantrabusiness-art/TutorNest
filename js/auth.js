import { auth, googleProvider } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Email Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);

      alert("Login Successful!");

      window.location.href = "tutor-dashboard.html";

    } catch (error) {
      alert(error.message);
    }
  });
}

// Google Login
const googleBtn = document.getElementById("googleLogin");

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {

    try {

      await signInWithPopup(auth, googleProvider);

      window.location.href = "tutor-dashboard.html";

    } catch (error) {

      alert(error.message);

    }

  });
}