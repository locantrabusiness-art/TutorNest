import { auth, db } from "../firebase.js";

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
const statusEl = document.getElementById("status");
const profilePhoto = document.getElementById("profilePhoto");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const previewBtn = document.getElementById("previewBtn");

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

        // -----------------------------
        // Basic Details
        // -----------------------------

        nameEl.innerText = tutor.name || "Tutor";

        emailEl.innerText = tutor.email || user.email;

        // -----------------------------
        // Profile Photo
        // -----------------------------

        if (tutor.photo) {

            profilePhoto.src = tutor.photo;

        } else {

            profilePhoto.src = "assets/logo/logo.png";

        }

        // -----------------------------
        // Status
        // -----------------------------

        if (statusEl) {

            if (tutor.status === "Approved") {

                statusEl.innerText = "✅ Verified Tutor";
                statusEl.style.background = "#d4edda";
                statusEl.style.color = "#155724";

            }

            else if (tutor.status === "Rejected") {

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

        // -----------------------------
        // Profile Completion
        // -----------------------------

        let total = 10;

        let filled = 0;

        if (tutor.name) filled++;
        if (tutor.photo) filled++;
        if (tutor.phone) filled++;
        if (tutor.qualification) filled++;
        if (tutor.about) filled++;
        if (tutor.area) filled++;
        if (tutor.subjects?.length) filled++;
        if (tutor.classes?.length) filled++;
        if (tutor.mode?.length) filled++;
        if (tutor.fees) filled++;

        const percent = Math.round((filled / total) * 100);

        if (progressBar) {

            progressBar.style.width = percent + "%";

        }

        if (progressText) {

            progressText.innerText = percent + "% Complete";

        }

        // -----------------------------
        // Preview Button
        // -----------------------------

        if (previewBtn) {

            previewBtn.onclick = () => {

                window.open(
                    `teacher.html?id=${user.uid}`,
                    "_blank"
                );

            };

        }

    }

    catch (error) {

        console.error(error);

        alert("Something went wrong while loading your profile.");

    }

});

// -----------------------------
// Logout
// -----------------------------

logoutBtn.addEventListener("click", async () => {

    const ok = confirm("Do you want to logout?");

    if (!ok) return;

    try {

        await signOut(auth);

        window.location.href = "tutor-login.html";

    }

    catch (error) {

        alert(error.message);

    }

});