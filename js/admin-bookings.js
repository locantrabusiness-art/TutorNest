import { db } from "../firebase.js";

import {

collection,
getDocs,
orderBy,
query

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const table=document.getElementById("bookingTable");

async function loadBookings(){

table.innerHTML="<tr><td colspan='7'>Loading...</td></tr>";

const q=query(

collection(db,"bookings"),

orderBy("createdAt","desc")

);

const snapshot=await getDocs(q);

table.innerHTML="";

if(snapshot.empty){

table.innerHTML=`

<tr>

<td colspan="7">

No Demo Requests

</td>

</tr>

`;

return;

}

snapshot.forEach(doc=>{

const booking=doc.data();

table.innerHTML+=`

<tr>

<td>${booking.studentName}</td>

<td>${booking.phone}</td>

<td>${booking.class}</td>

<td>${booking.subject}</td>

<td>${booking.area}</td>

<td>${booking.status}</td>

<td>

<button

onclick="window.location='assign-tutor.html?id=${doc.id}'">

Assign

</button>

</td>

</tr>

`;

});

}

loadBookings();