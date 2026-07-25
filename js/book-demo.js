import { db } from "../firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// URL Parameters
const params = new URLSearchParams(window.location.search);

const tutorId = params.get("id") || "";
const tutorName = decodeURIComponent(params.get("name") || "");

const form = document.getElementById("demoForm");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  try {

    await addDoc(collection(db, "demoBookings"), {

      studentName: document.getElementById("studentName").value.trim(),

      parentName: document.getElementById("parentName").value.trim(),

      phone: document.getElementById("phone").value.trim(),

      city: document.getElementById("city").value.trim(),

      className: document.getElementById("class").value,

      subject: document.getElementById("subject").value.trim(),

      message: document.getElementById("message").value.trim(),

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