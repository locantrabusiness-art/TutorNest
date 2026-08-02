import { auth, db } from "../firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ========================
// DOM ELEMENTS
// ========================

const logoutBtn = document.getElementById("logoutBtn");
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const statusEl = document.getElementById("status");
const profilePhoto = document.getElementById("profilePhoto");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const previewBtn = document.getElementById("previewBtn");
const editProfileBtn = document.getElementById("editProfileBtn");

// ========================
// AUTH & LOAD
// ========================

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "tutor-login.html";
        return;
    }

    try {
        const tutorRef = doc(db, "tutors", user.uid);
        const tutorSnap = await getDoc(tutorRef);

        if (!tutorSnap.exists()) {
            await signOut(auth);
            window.location.href = "tutor-login.html";
            return;
        }

        const tutor = tutorSnap.data();

        // ========================
        // DISPLAY PROFILE
        // ========================

        nameEl.textContent = tutor.name || "Tutor";
        emailEl.textContent = tutor.email || user.email;
        profilePhoto.src = tutor.photoURL || tutor.photo || "assets/logo/logo.png";

        // ========================
        // STATUS
        // ========================

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

        // ========================
        // PROFILE COMPLETION
        // ========================

        let filled = 0;
        const total = 10;

        if (tutor.name) filled++;
        if (tutor.photoURL || tutor.photo) filled++;
        if (tutor.phone) filled++;
        if (tutor.qualification) filled++;
        if (tutor.about) filled++;
        if (tutor.area || tutor.city) filled++;
        if (Array.isArray(tutor.teaching) && tutor.teaching.length) filled++;
        if (Array.isArray(tutor.classes) && tutor.classes.length) filled++;
        if (Array.isArray(tutor.mode) && tutor.mode.length) filled++;
        if (tutor.fees || (Array.isArray(tutor.teaching) && tutor.teaching[0]?.monthlyFee)) filled++;

        const percent = Math.round((filled / total) * 100);
        progressBar.style.width = percent + "%";
        progressText.textContent = percent + "% Complete";

        // ========================
        // BUTTONS
        // ========================

        previewBtn?.addEventListener("click", () => {
            window.open(`teacher.html?id=${user.uid}`, "_blank");
        });

        editProfileBtn?.addEventListener("click", () => {
            window.location.href = "tutor-profile.html";
        });

        // ========================
        // LIVE UPDATES
        // ========================

        onSnapshot(tutorRef, (snap) => {
            if (!snap.exists()) return;

            const updatedTutor = snap.data();
            nameEl.textContent = updatedTutor.name || "Tutor";
            profilePhoto.src = updatedTutor.photoURL || updatedTutor.photo || "assets/logo/logo.png";

            let newFilled = 0;
            if (updatedTutor.name) newFilled++;
            if (updatedTutor.photoURL || updatedTutor.photo) newFilled++;
            if (updatedTutor.phone) newFilled++;
            if (updatedTutor.qualification) newFilled++;
            if (updatedTutor.about) newFilled++;
            if (updatedTutor.area || updatedTutor.city) newFilled++;
            if (Array.isArray(updatedTutor.teaching) && updatedTutor.teaching.length) newFilled++;
            if (Array.isArray(updatedTutor.classes) && updatedTutor.classes.length) newFilled++;
            if (Array.isArray(updatedTutor.mode) && updatedTutor.mode.length) newFilled++;
            if (updatedTutor.fees || (Array.isArray(updatedTutor.teaching) && updatedTutor.teaching[0]?.monthlyFee)) newFilled++;

            const newPercent = Math.round((newFilled / total) * 100);
            progressBar.style.width = newPercent + "%";
            progressText.textContent = newPercent + "% Complete";
        });

    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Error loading profile: " + error.message);
    }
});

// ========================
// LOGOUT
// ========================

logoutBtn?.addEventListener("click", async () => {
    if (!confirm("Do you want to logout?")) return;

    try {
        await signOut(auth);
        window.location.href = "tutor-login.html";
    } catch (error) {
        alert("Error logging out: " + error.message);
    }
});