import { auth, db } from "../firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const form = document.getElementById("loginForm");
const googleBtn = document.getElementById("googleLogin");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    const tutorRef = doc(db, "tutors", uid);
    const tutorSnap = await getDoc(tutorRef);

    if (!tutorSnap.exists()) {

      alert("Tutor profile not found.");
      return;

    }

    const tutor = tutorSnap.data();

    if (tutor.status !== "Approved") {

      alert("Your profile is still under admin review.");
      return;

    }

    window.location.href = "tutor-dashboard.html";

  } catch (err) {

    console.error(err);
    alert(err.message);

  }

});

googleBtn.addEventListener("click", async () => {

  try {

    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const uid = result.user.uid;

    const tutorRef = doc(db, "tutors", uid);
    const tutorSnap = await getDoc(tutorRef);

    if (!tutorSnap.exists()) {

      alert("Tutor profile not found.");
      return;

    }

    const tutor = tutorSnap.data();

    if (tutor.status !== "Approved") {

      alert("Your profile is still under admin review.");
      return;

    }

    window.location.href = "tutor-dashboard.html";

  } catch (err) {

    console.error(err);
    alert(err.message);

  }

});