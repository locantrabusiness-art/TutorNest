import { db } from "../firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const tutorContainer = document.getElementById("tutorContainer");
const resultCount = document.getElementById("resultCount");

let tutors = [];

// =============================
// Load Tutors
// =============================

async function loadTutors() {

    tutorContainer.innerHTML = `
        <div class="loading">
            Loading tutors...
        </div>
    `;

    try {

        const q = query(
            collection(db, "tutors"),
            where("status", "==", "Approved")
        );

        const snapshot = await getDocs(q);

        tutors = [];

        snapshot.forEach(doc => {

            tutors.push({
                id: doc.id,
                ...doc.data()
            });

        });

        displayTutors(tutors);

    }

    catch (error) {

        console.error(error);

        tutorContainer.innerHTML = `
            <div class="no-data">
                Failed to load tutors.
            </div>
        `;

    }

}

// =============================
// Display Tutors
// =============================

function displayTutors(data) {

    tutorContainer.innerHTML = "";

    resultCount.textContent = `${data.length} Tutor(s) Found`;

    if (data.length === 0) {

        tutorContainer.innerHTML = `
            <div class="no-data">
                😔 No tutors found.
            </div>
        `;

        return;

    }

    data.forEach(tutor => {

        const card = document.createElement("div");

        card.className = "tutor-card";

        card.innerHTML = `

            <img src="${tutor.photoURL || "assets/images/default-user.png"}">

            <h2>${tutor.name || "Tutor"}</h2>

            <p><strong>${tutor.qualification || ""}</strong></p>

            <p>📚 ${Array.isArray(tutor.subjects)
                ? tutor.subjects.join(", ")
                : tutor.subjects || "-"}</p>

            <p>🎓 ${Array.isArray(tutor.classes)
                ? tutor.classes.join(", ")
                : tutor.classes || "-"}</p>

            <p>📍 ${tutor.area || "-"}</p>

            <div class="price">
                ₹${tutor.monthlyFee || "-"} / Month
            </div>

            <a
                class="view-btn"
                href="teacher.html?id=${tutor.id}">
                View Profile
            </a>

        `;

        tutorContainer.appendChild(card);

    });

}
// =============================
// Search Filters
// =============================

const subjectSelect = document.getElementById("subject");
const classSelect = document.getElementById("class");
const areaSelect = document.getElementById("area");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", () => {

    const subject = subjectSelect.value.trim();
    const studentClass = classSelect.value.trim();
    const area = areaSelect.value.trim();

    const filteredTutors = tutors.filter(tutor => {

        // Subject Filter
        const subjectMatch =
            !subject ||
            (Array.isArray(tutor.subjects)
                ? tutor.subjects.includes(subject)
                : tutor.subjects === subject);

        // Class Filter
        const classMatch =
            !studentClass ||
            (Array.isArray(tutor.classes)
                ? tutor.classes.includes(studentClass)
                : tutor.classes === studentClass);

        // Area Filter
        const areaMatch =
            !area ||
            tutor.area === area;

        return subjectMatch && classMatch && areaMatch;

    });

    displayTutors(filteredTutors);

});

loadTutors();