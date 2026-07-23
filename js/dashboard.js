import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const logoutBtn = document.getElementById("logoutBtn");
const statusEl = document.querySelector(".status");

// Check if tutor is logged in
onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "tutor-login.html";
        return;

    }

    try {

        const tutorRef = doc(db, "tutors", user.uid);
        const tutorSnap = await getDoc(tutorRef);

        if (!tutorSnap.exists()) {

            alert("Tutor profile not found.");
            await signOut(auth);
            window.location.href = "tutor-login.html";
            return;

        }

        const tutor = tutorSnap.data();

        nameEl.innerText = tutor.name || "Tutor";
        emailEl.innerText = tutor.email || user.email;

        // Status
        if (tutor.status === "approved") {

            statusEl.innerText = "✅ Verified Tutor";
            statusEl.style.background = "#d4edda";
            statusEl.style.color = "#155724";

        }

        else if (tutor.status === "rejected") {

            statusEl.innerText = "❌ Rejected";
            statusEl.style.background = "#f8d7da";
            statusEl.style.color = "#721c24";

        }

        else {

            statusEl.innerText = "🟡 Pending Verification";
            statusEl.style.background = "#fff3cd";
            statusEl.style.color = "#856404";

        }

    }

    catch (error) {

        console.error(error);
        alert("Something went wrong while loading profile.");

    }

});

// Logout
logoutBtn.addEventListener("click", async () => {

    const confirmLogout = confirm("Do you want to logout?");

    if (!confirmLogout) return;

    try {

        await signOut(auth);

        window.location.href = "tutor-login.html";

    }

    catch (error) {

        alert(error.message);

    }

});