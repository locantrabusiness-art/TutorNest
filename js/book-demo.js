import { db } from "../firebase.js";


import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// URL Parameters
const params = new URLSearchParams(location.search);

const tutorId = params.get("tutor");

const tutorName = params.get("name");


const form = document.getElementById("demoForm");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    await addDoc(collection(db, "demoBookings"), {

      studentName: document.getElementById("studentName").value.trim(),

      parentName: document.getElementById("parentName").value.trim(),

      phone: document.getElementById("phone").value.trim(),

      class: document.getElementById("class").value,

area: document.getElementById("city").value.trim(),

subject: document.getElementById("subject").value.trim(),

remarks: document.getElementById("message").value.trim(),
      requestedTutor: tutorId,

requestedTutorName: tutorName,

      tutorId: tutorId,

      tutorName: tutorName,

      status: "Pending",

      createdAt: serverTimestamp()
      

    });

    alert("✅ Demo booked successfully!");

    form.reset();

  } catch (err) {

    console.error(err);

    alert("❌ Something went wrong.");
  }

});