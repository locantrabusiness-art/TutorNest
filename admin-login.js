console.log("Admin Login JS Loaded - v2");
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

// ===============================
// Already Logged In
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) return;

    try {

        const snap = await getDoc(doc(db, "admins", user.uid));

        if (snap.exists()) {

            window.location.href = "admin.html";

        } else {

            await signOut(auth);

        }

    } catch (err) {

        console.error(err);

    }

});

// ===============================
// Login
// ===============================

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

            error.textContent = "Access Denied.";

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

            return;

        }

        window.location.href = "admin.html";

    } catch (err) {

        console.error(err);

        error.textContent = err.message;

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";

    }

});