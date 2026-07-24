import { db } from "./firebase.js";

import {
collection,
addDoc,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const form=document.getElementById("demoForm");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

try{

await addDoc(

collection(db,"demoBookings"),

{

studentName:

studentName.value,

parentName:

parentName.value,

phone:

phone.value,

city:

city.value,

className:

document.getElementById("class").value,

subject:

subject.value,

message:

message.value,

status:"Pending",

createdAt:

serverTimestamp()

}

);

alert("Demo booked successfully!");

form.reset();

}

catch(err){

console.error(err);

alert("Something went wrong.");

}

});