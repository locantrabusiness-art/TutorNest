import { auth, db } from "../firebase.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ==========================
CONFIG
========================== */

const ADMIN_EMAIL="shivangsingh0009@gmail.com";

/* ==========================
ARRAYS
========================== */

let bookings=[];
let teachers=[];

/* ==========================
STUDENT ELEMENTS
========================== */

const bookingTable=document.getElementById("bookingTable");

const searchInput=document.getElementById("searchInput");

const statusFilter=document.getElementById("statusFilter");

/* ==========================
TEACHER ELEMENTS
========================== */

const teacherTable=document.getElementById("teacherTable");

const addTeacherBtn=document.getElementById("addTeacherBtn");

const teacherModal=document.getElementById("teacherModal");

const teacherName=document.getElementById("teacherName");

const teacherPhone=document.getElementById("teacherPhone");

const teacherSubjects=document.getElementById("teacherSubjects");

const teacherAreas=document.getElementById("teacherAreas");

const saveTeacher=document.getElementById("saveTeacher");

/* ==========================
ASSIGN MODAL
========================== */

const assignModal=document.getElementById("assignModal");

const teacherSelect=document.getElementById("teacherSelect");

const demoDate=document.getElementById("demoDate");

const demoTime=document.getElementById("demoTime");

const remarks=document.getElementById("remarks");

const saveAssign=document.getElementById("saveAssign");

const closeAssign=document.getElementById("closeAssign");

let selectedBooking=null;

/* ==========================
DASHBOARD CARDS
========================== */

const totalEnquiries=document.getElementById("totalEnquiries");

const pendingCount=document.getElementById("pendingCount");

const assignedCount=document.getElementById("assignedCount");

const admissionCount=document.getElementById("admissionCount");

/* ==========================
LOGOUT
========================== */

document.getElementById("logoutBtn").onclick=async()=>{

await signOut(auth);

location.href="admin-login.html";

};

/* ==========================
AUTH
========================== */

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="admin-login.html";

return;

}

if(user.email!==ADMIN_EMAIL){

await signOut(auth);

location.href="admin-login.html";

return;

}

await loadTeachers();

await loadBookings();

});
/* ==========================
LOAD BOOKINGS
========================== */

async function loadBookings(){

bookingTable.innerHTML=`
<tr>
<td colspan="8">Loading...</td>
</tr>
`;

try{

const snap=await getDocs(collection(db,"demoBookings"));

bookings=[];

snap.forEach(docSnap=>{

bookings.push({

id:docSnap.id,

...docSnap.data()

});

});

updateDashboard();

renderBookings();

}

catch(err){

console.error(err);

bookingTable.innerHTML=`
<tr>
<td colspan="8">Unable to load data.</td>
</tr>
`;

}

}

/* ==========================
LOAD TEACHERS
========================== */

async function loadTeachers(){

try{

const snap=await getDocs(collection(db,"teachers"));

teachers=[];

snap.forEach(docSnap=>{

teachers.push({

id:docSnap.id,

...docSnap.data()

});

});

renderTeachers();

}

catch(err){

console.error(err);

}

}

/* ==========================
DASHBOARD STATS
========================== */

function updateDashboard(){

totalEnquiries.textContent=bookings.length;

pendingCount.textContent=

bookings.filter(x=>

(x.status||"Pending")==="Pending"

).length;

assignedCount.textContent=

bookings.filter(x=>

x.status==="Assigned"

).length;

admissionCount.textContent=

bookings.filter(x=>

x.status==="Admitted"

).length;

}

/* ==========================
AUTO REFRESH
========================== */

setInterval(()=>{

loadBookings();

},30000);
/* ==========================
RENDER BOOKINGS
========================== */

function renderBookings(){

bookingTable.innerHTML="";

const keyword=searchInput.value.toLowerCase().trim();

const status=statusFilter.value;

const filtered=bookings.filter(b=>{

const name=(b.studentName||b.name||"").toLowerCase();

const phone=(b.phone||"").toLowerCase();

const matchSearch=

name.includes(keyword)||

phone.includes(keyword);

const matchStatus=

status===""||

(b.status||"Pending")===status;

return matchSearch && matchStatus;

});

if(filtered.length===0){

bookingTable.innerHTML=`
<tr>
<td colspan="8">
No Student Found
</td>
</tr>
`;

return;

}

filtered.forEach(b=>{

bookingTable.innerHTML+=`

<tr>

<td>${b.studentName||b.name||"-"}</td>

<td>${b.phone||"-"}</td>

<td>${b.class||"-"}</td>

<td>${b.subject||"-"}</td>

<td>${b.area||"-"}</td>

<td>${b.assignedTeacher||"-"}</td>

<td>

<span class="${getStatusClass(b.status)}">

${b.status||"Pending"}

</span>

</td>

<td>

<button
class="call"
onclick="callStudent('${b.phone}')">

Call

</button>

<button
class="whatsapp"
onclick="whatsappStudent('${b.phone}')">

WhatsApp

</button>

<button
class="assign"
onclick="assignTeacher('${b.id}')">

Assign

</button>

<button
class="delete"
onclick="deleteBooking('${b.id}')">

Delete

</button>

</td>

</tr>

`;

});

}

/* ==========================
STATUS BADGE
========================== */

function getStatusClass(status){

switch(status){

case "Assigned":

return "badge assigned";

case "Demo Scheduled":

return "badge demo";

case "Completed":

return "badge completed";

case "Admitted":

return "badge admitted";

default:

return "badge pending";

}

}

/* ==========================
SEARCH
========================== */

searchInput.addEventListener(

"input",

renderBookings

);

statusFilter.addEventListener(

"change",

renderBookings

);

/* ==========================
CALL
========================== */

window.callStudent=function(phone){

if(!phone){

alert("Phone Number Not Available");

return;

}

window.location.href=`tel:${phone}`;

};

/* ==========================
WHATSAPP
========================== */

window.whatsappStudent=function(phone){

if(!phone){

alert("Phone Number Not Available");

return;

}

window.open(

`https://wa.me/91${phone}`,

"_blank"

);

};

/* ==========================
DELETE BOOKING
========================== */

window.deleteBooking=async(id)=>{

const ok=confirm(

"Delete this enquiry?"

);

if(!ok)return;

try{

await deleteDoc(

doc(db,"demoBookings",id)

);

await loadBookings();

}

catch(err){

console.error(err);

alert("Unable to delete enquiry.");

}

};
/* ==========================
RENDER TEACHERS
========================== */

function renderTeachers(){

teacherTable.innerHTML="";

if(teachers.length===0){

teacherTable.innerHTML=`
<tr>
<td colspan="6">
No Teachers Found
</td>
</tr>
`;

return;

}

teachers.forEach(t=>{

teacherTable.innerHTML+=`

<tr>

<td>${t.name}</td>

<td>${t.phone}</td>

<td>${(t.subjects||[]).join(", ")}</td>

<td>${(t.areas||[]).join(", ")}</td>

<td>

${t.available===false?"Busy":"Available"}

</td>

<td>

<button
class="delete"
onclick="deleteTeacher('${t.id}')">

Delete

</button>

</td>

</tr>

`;

});

}

/* ==========================
ADD TEACHER
========================== */

addTeacherBtn.onclick=()=>{

teacherModal.classList.add("show");

};

saveTeacher.onclick=async()=>{

if(teacherName.value.trim()===""){

alert("Teacher Name Required");

return;

}

try{

await addDoc(collection(db,"teachers"),{

name:teacherName.value.trim(),

phone:teacherPhone.value.trim(),

subjects:teacherSubjects.value
.split(",")
.map(x=>x.trim())
.filter(Boolean),

areas:teacherAreas.value
.split(",")
.map(x=>x.trim())
.filter(Boolean),

available:true,

createdAt:new Date()

});

teacherName.value="";
teacherPhone.value="";
teacherSubjects.value="";
teacherAreas.value="";

teacherModal.classList.remove("show");

await loadTeachers();

alert("Teacher Added Successfully.");

}

catch(err){

console.error(err);

alert("Unable to add teacher.");

}

};

/* ==========================
DELETE TEACHER
========================== */

window.deleteTeacher=async(id)=>{

const ok=confirm("Delete Teacher?");

if(!ok)return;

try{

await deleteDoc(doc(db,"teachers",id));

await loadTeachers();

}

catch(err){

console.error(err);

alert("Unable to delete teacher.");

}

};

/* ==========================
ASSIGN TEACHER
========================== */

window.assignTeacher=function(id){

selectedBooking=id;

teacherSelect.innerHTML=`
<option value="">
Select Teacher
</option>
`;

teachers.forEach(t=>{

if(t.available!==false){

teacherSelect.innerHTML+=`
<option value="${t.id}">
${t.name}
</option>
`;

}

});

assignModal.classList.add("show");

};

closeAssign.onclick=()=>{

assignModal.classList.remove("show");

};

window.addEventListener("click",e=>{

if(e.target===assignModal){

assignModal.classList.remove("show");

}

if(e.target===teacherModal){

teacherModal.classList.remove("show");

}

});

saveAssign.onclick=async()=>{

if(!selectedBooking){

alert("No Student Selected");

return;

}

if(teacherSelect.value===""){

alert("Please Select Teacher");

return;

}

const teacher=teachers.find(

t=>t.id===teacherSelect.value

);

try{

await updateDoc(

doc(db,"demoBookings",selectedBooking),

{

assignedTeacher:teacher.name,

teacherPhone:teacher.phone,

teacherId:teacher.id,

demoDate:demoDate.value,

demoTime:demoTime.value,

remarks:remarks.value,

status:"Assigned"

}

);

assignModal.classList.remove("show");

teacherSelect.value="";

demoDate.value="";

demoTime.value="";

remarks.value="";

selectedBooking=null;

await loadBookings();

alert("Teacher Assigned Successfully.");

}

catch(err){

console.error(err);

alert("Unable to assign teacher.");

}

};
/* ==========================
STUDENT DETAILS MODAL
========================== */

const studentModal=document.getElementById("studentModal");
const studentDetails=document.getElementById("studentDetails");
const closeStudentModal=document.getElementById("closeStudentModal");

if(closeStudentModal){

closeStudentModal.onclick=()=>{

studentModal.classList.remove("show");

};

}

window.viewStudent=function(id){

const student=bookings.find(x=>x.id===id);

if(!student)return;

studentDetails.innerHTML=`

<p><b>Name:</b> ${student.studentName||student.name||"-"}</p>

<p><b>Phone:</b> ${student.phone||"-"}</p>

<p><b>Class:</b> ${student.class||"-"}</p>

<p><b>Subject:</b> ${student.subject||"-"}</p>

<p><b>Area:</b> ${student.area||"-"}</p>

<p><b>Teacher:</b> ${student.assignedTeacher||"Not Assigned"}</p>

<p><b>Status:</b> ${student.status||"Pending"}</p>

<p><b>Demo Date:</b> ${student.demoDate||"-"}</p>

<p><b>Demo Time:</b> ${student.demoTime||"-"}</p>

<p><b>Remarks:</b> ${student.remarks||"-"}</p>

`;

studentModal.classList.add("show");

};

/* ==========================
DEMO DETAILS MODAL
========================== */

const demoModal=document.getElementById("demoModal");
const demoDetails=document.getElementById("demoDetails");
const closeDemoModal=document.getElementById("closeDemoModal");

if(closeDemoModal){

closeDemoModal.onclick=()=>{

demoModal.classList.remove("show");

};

}

window.viewDemo=function(id){

const student=bookings.find(x=>x.id===id);

if(!student)return;

demoDetails.innerHTML=`

<p><b>Teacher:</b> ${student.assignedTeacher||"-"}</p>

<p><b>Teacher Phone:</b> ${student.teacherPhone||"-"}</p>

<p><b>Date:</b> ${student.demoDate||"-"}</p>

<p><b>Time:</b> ${student.demoTime||"-"}</p>

<p><b>Remarks:</b> ${student.remarks||"-"}</p>

`;

demoModal.classList.add("show");

};

/* ==========================
STATUS UPDATE
========================== */

window.changeStatus=async(id,status)=>{

try{

await updateDoc(

doc(db,"demoBookings",id),

{

status:status

}

);

await loadBookings();

}

catch(err){

console.error(err);

}

};

/* ==========================
MARK ADMISSION
========================== */

window.markAdmitted=async(id)=>{

const ok=confirm("Mark this student as admitted?");

if(!ok)return;

try{

await updateDoc(

doc(db,"demoBookings",id),

{

status:"Admitted",

admissionDate:new Date().toISOString()

}

);

await loadBookings();

alert("Admission Updated Successfully");

}

catch(err){

console.error(err);

}

};

/* ==========================
ESC KEY CLOSE
========================== */

window.addEventListener("keydown",e=>{

if(e.key==="Escape"){

document.querySelectorAll(".modal").forEach(m=>{

m.classList.remove("show");

});

}

});

/* ==========================
INITIAL EVENTS
========================== */

window.addEventListener("load",()=>{

if(searchInput){

searchInput.focus();

}

});

console.log("TutorNest CRM Loaded Successfully");