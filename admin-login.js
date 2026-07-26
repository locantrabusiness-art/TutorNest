import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const error = document.getElementById("error");

// Already Logged In
onAuthStateChanged(auth, async (user) => {

  if (!user) return;

const snap = await getDoc(doc(db, "admins", user.uid));
  if (!snap.exists()) {
    await signOut(auth);
    return;
  }

  const data = snap.data();

if (snap.exists()) {
    window.location.href = "admin.html";
} else {
    await signOut(auth);
}
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

const snap = await getDoc(doc(db, "admins", cred.user.uid));
    if (!snap.exists()) {

      await signOut(auth);

      error.textContent = "User profile not found.";

      loginBtn.disabled = false;
      loginBtn.textContent = "Login";

      return;

    }

    if (!snap.exists()) {

    await signOut(auth);

    error.textContent = "Access Denied.";

    loginBtn.disabled = false;
    loginBtn.textContent = "Login";

    return;

}

window.location.href = "admin.html";
  } catch (err) {

    console.error(err);

    error.textContent = "Invalid email or password.";

    loginBtn.disabled = false;
    loginBtn.textContent = "Login";

  }

});