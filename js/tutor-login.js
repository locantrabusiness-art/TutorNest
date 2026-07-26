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

const loginForm = document.getElementById("loginForm");
const googleLogin = document.getElementById("googleLogin");

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

            alert("User record not found.");
            return;

        }

        const data = userDoc.data();

        if (data.role !== "teacher") {

            alert("This account is not a Tutor account.");
            return;

        }

        window.location.href = "tutor-dashboard.html";

    } catch (err) {

        alert(err.message);

    }

});
console.log("UID:", userCredential.user.uid);

const tutorSnap = await getDoc(doc(db, "tutors", userCredential.user.uid));

console.log("Exists:", tutorSnap.exists());

googleLogin.addEventListener("click", async () => {

    try {

        const provider = new GoogleAuthProvider();

        const result = await signInWithPopup(auth, provider);

        const user = result.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists()) {

            alert("User record not found.");
            return;

        }

        const data = userDoc.data();

        if (data.role !== "teacher") {

            alert("This Google account is not registered as a Tutor.");
            return;

        }

        window.location.href = "tutor-dashboard.html";

    } catch (err) {

        alert(err.message);

    }

});