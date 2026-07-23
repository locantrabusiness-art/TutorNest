import { db } from "./firebase.js";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const teachersContainer = document.getElementById("teachersContainer");

async function loadTeachers() {

    teachersContainer.innerHTML = "<p>Loading Teachers...</p>";

    const q = query(
        collection(db, "tutors"),
        where("status", "==", "approved"),
        where("visibleOnWebsite", "==", true),
        orderBy("homepageOrder")
    );

    const snapshot = await getDocs(q);

    teachersContainer.innerHTML = "";

    if (snapshot.empty) {
        teachersContainer.innerHTML = "<h3>No Teachers Available</h3>";
        return;
    }

    snapshot.forEach((doc) => {

        const t = doc.data();

        teachersContainer.innerHTML += `

        <div class="teacher-card">

            <img src="${t.photo || 'images/default-user.png'}" class="teacher-photo">

            <h3>${t.name}</h3>

            <p>${t.subjects?.join(", ") || ""}</p>

            <p>${t.area || ""}</p>

            <p>₹${t.fees || 0}/hr</p>

            ${t.featured ? '<span class="featured-badge">⭐ Featured Tutor</span>' : ""}

            <a href="teacher.html?id=${doc.id}">
                <button>View Profile</button>
            </a>

        </div>

        `;

    });

}

loadTeachers();