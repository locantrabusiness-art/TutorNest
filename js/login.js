import { auth, googleProvider, db } from "../firebase.js";

import {
  signInWithEmailAndPassword,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================
// Email Login
// ======================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        alert("User profile not found.");
        return;
      }

      const data = userDoc.data();

      switch (data.role) {

        case "admin":
          window.location.href = "admin-dashboard-v2.html";
          break;

        case "teacher":
          window.location.href = "teacher-dashboard.html";
          break;

        case "student":
          window.location.href = "student-dashboard.html";
          break;

        default:
          alert("Access Denied");
      }

    } catch (error) {

      alert(error.message);

    }

  });

}

// ======================
// Google Login
// ======================

const googleBtn = document.getElementById("googleLogin");

if (googleBtn) {

  googleBtn.addEventListener("click", async () => {

    try {

      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {

        alert("Your account is not authorized.");

        return;

      }

      const data = userDoc.data();

      switch (data.role) {

        case "admin":
          window.location.href = "admin-dashboard-v2.html";
          break;

        case "teacher":
          window.location.href = "teacher-dashboard.html";
          break;

        case "student":
          window.location.href = "student-dashboard.html";
          break;

        default:
          alert("Access Denied");

      }

    } catch (error) {

      alert(error.message);

    }

  });

}