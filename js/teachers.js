import { db } from "../firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================
// Get Tutor ID
// ==========================

const params = new URLSearchParams(window.location.search);
const tutorId = params.get("id");

if (!tutorId) {

    alert("Tutor not found.");
    window.location.href = "search.html";

}

// ==========================
// Elements
// ==========================

const profileImage = document.getElementById("profileImage");
const teacherName = document.getElementById("teacherName");
const qualification = document.getElementById("qualification");
const experience = document.getElementById("experience");
const locationText = document.getElementById("location");
const about = document.getElementById("about");
const mode = document.getElementById("mode");
const languages = document.getElementById("languages");

const subjectContainer =
document.getElementById("subjectContainer");

const classContainer =
document.getElementById("classContainer");

const whatsappBtn =
document.getElementById("whatsappBtn");

// ==========================
// Load Tutor
// ==========================

async function loadTutor() {

    try {

        const docRef = doc(db, "tutors", tutorId);

        const snap = await getDoc(docRef);

        if (!snap.exists()) {

            alert("Tutor not found.");

            window.location.href = "search.html";

            return;

        }

        const tutor = snap.data();

        profileImage.src =
            tutor.photoURL ||
            "assets/images/default-user.png";

        teacherName.textContent =
            tutor.name || "Tutor";

        qualification.textContent =
            tutor.qualification || "-";

        experience.textContent =
            `${tutor.experience || 0} Years Experience`;

        locationText.textContent =
            "📍 " + (tutor.area || "Lucknow");

        about.textContent =
            tutor.about ||
            "No description available.";

        mode.textContent =
            tutor.teachingMode ||
            "Home Tuition";

        languages.textContent =
            tutor.languages || "Hindi";

        // =====================
        // Subjects
        // =====================

        subjectContainer.innerHTML = "";

        if (Array.isArray(tutor.subjects)) {

            tutor.subjects.forEach(subject => {

                const row =
                document.createElement("div");

                row.className = "subject-row";

                row.innerHTML = `

                    <span>${subject}</span>

                    <strong>

                    ₹${tutor.monthlyFee || "-"}/Month

                    </strong>

                `;

                subjectContainer.appendChild(row);

            });

        }

        // =====================
        // Classes
        // =====================

        classContainer.innerHTML = "";

        if (Array.isArray(tutor.classes)) {

            tutor.classes.forEach(cls => {

                const badge =
                document.createElement("span");

                badge.className = "class-badge";

                badge.textContent = cls;

                classContainer.appendChild(badge);

            });

        }

        // =====================
        // WhatsApp
        // =====================

        whatsappBtn.onclick = () => {

            if (!tutor.phone) {

                alert("Phone number unavailable.");

                return;

            }

            window.open(

                `https://wa.me/91${tutor.phone}`,

                "_blank"

            );

        };

    }

    catch (err) {

        console.error(err);

        alert("Failed to load tutor.");

    }

}

loadTutor();