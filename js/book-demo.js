import { db } from "../firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const tutorId = params.get("tutor") || "";
const tutorName = params.get("name") || "";

const form = document.getElementById("demoForm");

if(form){

form.addEventListener("submit", async(e)=>{

e.preventDefault();

try{

await addDoc(collection(db,"demoBookings"),{

studentName:
document.getElementById("studentName").value.trim(),

phone:
document.getElementById("phone").value.trim(),

class:
document.getElementById("class").value,

subject:
document.getElementById("subject").value.trim(),

area:
document.getElementById("area").value.trim(),

preferredTime:
document.getElementById("preferredTime").value.trim(),

remarks:
document.getElementById("message").value.trim(),

requestedTutor:tutorId,

requestedTutorName:tutorName,

status:"Pending",

assignedTeacher:"",

teacherId:"",

createdAt:serverTimestamp()

});

alert("✅ Demo booked successfully!");

form.reset();

window.location.href="index.html";

}catch(err){

console.error(err);

alert("❌ Something went wrong.");

}

});

}