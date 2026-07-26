import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const featuredContainer = document.getElementById("featuredTutors");
const totalTutorsEl = document.getElementById("totalTutorsCount");

loadHomepage();

async function loadHomepage() {

  const q = query(
    collection(db, "tutors"),
    where("status", "==", "Approved"),
    limit(6)
  );

  const snap = await getDocs(q);

  let total = 0;

  featuredContainer.innerHTML = "";

  snap.forEach(doc => {

    total++;

    const tutor = doc.data();

    const firstFee =
      tutor.teaching?.length
        ? tutor.teaching[0].monthlyFee
        : "-";

    featuredContainer.innerHTML += `
      <div class="card">

        <img src="${tutor.photoURL || "assets/images/default-user.png"}"
             class="tutor-img">

        <h3>${tutor.name}</h3>

        <p><strong>${tutor.qualification || ""}</strong></p>

        <p>📍 ${tutor.area || ""}</p>

        <p>₹${firstFee}/Month</p>

        <a href="teacher.html?id=${doc.id}"
           class="primary-btn">
           View Profile
        </a>

      </div>
    `;

  });

  totalTutorsEl.textContent = total;

}