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
const editProfileBtn = document.getElementById("editProfileBtn");

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

        // Basic Details
        nameEl.innerText = tutor.name || "Tutor";
        emailEl.innerText = tutor.email || user.email;

        // Profile Photo
        profilePhoto.src = tutor.photo || "assets/logo/logo.png";

        // Status
        if (tutor.status === "Approved") {

            statusEl.innerHTML = "✅ Verified Tutor";
            statusEl.style.background = "#d4edda";
            statusEl.style.color = "#155724";

        } else if (tutor.status === "Rejected") {

            statusEl.innerHTML = "❌ Rejected - Contact Admin";
            statusEl.style.background = "#f8d7da";
            statusEl.style.color = "#721c24";

        } else {

            statusEl.innerHTML = "🟡 Under Review - Complete your profile for approval";
            statusEl.style.background = "#fff3cd";
            statusEl.style.color = "#856404";

        }

        // Profile Completion
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

        progressBar.style.width = percent + "%";
        progressText.innerText = percent + "% Complete";

        // Preview Profile
        previewBtn.addEventListener("click", () => {
            window.open(`teacher.html?id=${user.uid}`, "_blank");
        });

        // Edit Profile
        editProfileBtn.addEventListener("click", () => {
            window.location.href = "tutor-profile.html";
        });

    } catch (error) {

        console.error(error);
        alert("Something went wrong while loading your profile.");

    }

});

// Logout

logoutBtn.addEventListener("click", async () => {

    if (!confirm("Do you want to logout?")) return;

    try {

        await signOut(auth);

        window.location.href = "tutor-login.html";

    } catch (error) {

        alert(error.message);

    }

});