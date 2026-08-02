import { db } from "../firebase.js";

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const container = document.getElementById("featuredTutorsContainer");
const founderContainer = document.getElementById("founderContainer");

// ========================
// LOAD FOUNDER
// ========================

async function loadFounder() {
    if (!founderContainer) return;

    try {
        const q = query(
            collection(db, "tutors"),
            where("status", "==", "Approved"),
            where("founder", "==", true),
            limit(1)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
            founderContainer.style.display = "none";
            return;
        }

        founderContainer.innerHTML = "";
        snap.forEach(doc => {
            createTutorCard(doc.id, doc.data(), founderContainer);
        });

    } catch (error) {
        console.error("Error loading founder:", error);
    }
}

// ========================
// LOAD FEATURED TUTORS
// ========================

async function loadFeaturedTutors() {
    if (!container) return;

    container.innerHTML = `
        <div class="loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading Featured Tutors...</p>
        </div>
    `;

    try {
        const q = query(
            collection(db, "tutors"),
            where("status", "==", "Approved"),
            where("featured", "==", true),
            where("founder", "==", false),
            orderBy("homepageOrder"),
            limit(6)
        );

        const snapshot = await getDocs(q);

        container.innerHTML = "";

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-user-slash"></i>
                    <h3>No Featured Tutors</h3>
                    <p>Featured tutors will appear here once added by the admin.</p>
                </div>
            `;
            return;
        }

        snapshot.forEach(doc => {
            createTutorCard(doc.id, doc.data());
        });

    } catch (error) {
        console.error("Error loading featured tutors:", error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-exclamation"></i>
                <h3>Unable to load tutors</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// ========================
// CREATE TUTOR CARD
// ========================

function createTutorCard(id, tutor, parent = null) {
    const card = document.createElement("div");
    card.className = tutor.founder ? "featured-card founder-card" : "featured-card";

    const image = tutor.photoURL || tutor.photo || "assets/images/default-user.png";
    const name = tutor.name || "Tutor";
    const qualification = tutor.qualification || "Qualification Not Added";
    const experience = tutor.experience || "0";
    const area = tutor.area || tutor.city || "Location Not Available";

    const fees = Array.isArray(tutor.teaching) && tutor.teaching.length
        ? tutor.teaching[0].monthlyFee
        : "Contact";

    const subjects = Array.isArray(tutor.teaching)
        ? tutor.teaching.map(item => item.subject).join(", ")
        : "Not Specified";

    card.innerHTML = `
        ${tutor.founder ? `
            <div class="founder-ribbon">
                👑 Golden Founder
            </div>
        ` : ""}

        ${tutor.verified ? `
            <div class="verified-tag">
                <i class="fa-solid fa-circle-check"></i>
                Verified
            </div>
        ` : ""}

        <div class="featured-image">
            <img
                src="${image}"
                alt="${name}"
                onerror="this.src='assets/images/default-user.png'">
        </div>

        <div class="featured-content">
            <h3>${name}</h3>

            ${tutor.founder ? `
                <p class="founder-subtitle">
                    Founder of TutorNest
                </p>
            ` : ""}

            <p class="qualification">
                ${qualification}
            </p>

            <p>
                <i class="fa-solid fa-book"></i>
                ${subjects}
            </p>

            <p>
                <i class="fa-solid fa-briefcase"></i>
                ${experience} Years Experience
            </p>

            <p>
                <i class="fa-solid fa-location-dot"></i>
                ${area}
            </p>

            <h4>₹${fees}/Month</h4>

            <a href="teacher.html?id=${id}" class="primary-btn">
                View Profile
            </a>
        </div>
    `;

    (parent || container).appendChild(card);
}

// ========================
// INIT
// ========================

loadFounder();
loadFeaturedTutors();
