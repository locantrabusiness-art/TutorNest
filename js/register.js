import { auth, db } from "../firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value.trim();
  const qualification = document.getElementById("qualification").value.trim();

  try {

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(
      doc(db, "tutors", userCredential.user.uid),
      {
        uid: userCredential.user.uid,
        name,
        email,
        phone,
        qualification,
        status: "Pending",
        featured: false,
        homepageOrder: 999,
        photo: "",
        experience: "",
        area: "",
        about: "",
        subjects: [],
        classes: [],
        board: [],
        mode: [],
        fees: 0,
        rating: 0,
        students: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );

    alert("Registration successful! Waiting for admin approval.");

    window.location.href = "tutor-login.html";

  } catch (err) {

    console.error(err);
    alert(err.message);

  }

});