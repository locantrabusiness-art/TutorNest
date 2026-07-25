import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const form = document.getElementById("tutorForm");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    await addDoc(collection(db, "demoBookings"), {

      studentName: document.getElementById("studentName").value,

      parentName: document.getElementById("parentName").value,

      phone: document.getElementById("mobile").value,

      age: document.getElementById("age").value,

      className: document.getElementById("class").value,

      tutor: document.getElementById("tutor").value,

      gender: document.getElementById("gender").value,

      subjects: document.getElementById("subjects").value,

      address: document.getElementById("address").value,

      status: "Pending",

      createdAt: serverTimestamp()

    });

    let msg = `*New Tutor Requirement*%0A%0A

Student : ${studentName.value}%0A

Parent : ${parentName.value}%0A

Mobile : ${mobile.value}%0A

Age : ${age.value}%0A

Class : ${document.getElementById("class").value}%0A

Tutor : ${tutor.value}%0A

Gender Preference : ${gender.value}%0A

Subjects : ${subjects.value}%0A

Address : ${address.value}`;

    window.open(`https://wa.me/919511119120?text=${msg}`);

    alert("Demo booked successfully!");

    form.reset();

  } catch (err) {

    console.error(err);

    alert("Something went wrong.");
  }

});

// Navbar shadow
window.addEventListener("scroll", () => {

  const header = document.querySelector("header");

  if (window.scrollY > 30) {

    header.classList.add("active");

  } else {

    header.classList.remove("active");

  }

});

// Search Tutors
const search = document.getElementById("searchTutor");

search.addEventListener("keyup", () => {

  const value = search.value.toLowerCase();

  document.querySelectorAll(".teacher-card").forEach(card => {

    const text = card.innerText.toLowerCase();

    card.style.display = text.includes(value) ? "block" : "none";

  });

});