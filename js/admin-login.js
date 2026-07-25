import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const ADMIN_EMAIL = "shivangsingh0009@gmail.com"; // <-- Isko apne admin email se replace karo

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const error = document.getElementById("error");

// Already logged in?
onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  if (user.email === ADMIN_EMAIL) {

    window.location.href = "admin-dashboard.html";

  } else {

    await signOut(auth);

  }

});

loginBtn.addEventListener("click", async () => {

  error.textContent = "";

  if (!email.value || !password.value) {

    error.textContent = "Please fill all fields.";

    return;

  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {

    const cred = await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );

    if (cred.user.email !== ADMIN_EMAIL) {

      await signOut(auth);

      error.textContent = "Access Denied.";

      loginBtn.disabled = false;
      loginBtn.textContent = "Login";

      return;

    }

    window.location.href = "admin-dashboard.html";

  } catch (err) {

    console.error(err);

    error.textContent = "Invalid email or password.";

    loginBtn.disabled = false;
    loginBtn.textContent = "Login";

  }

});