import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Check Login
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "tutor-login.html";
        return;
    }

    // Firestore se tutor data lao
    const docRef = doc(db, "tutors", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

        const data = docSnap.data();

        document.getElementById("name").innerText = data.name || "Tutor";
        document.getElementById("email").innerText = data.email || "";

    }

});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "tutor-login.html";

});