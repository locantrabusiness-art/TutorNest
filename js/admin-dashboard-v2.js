// ===============================
// PART 1
// Replace the TOP of admin-dashboard-v2.js
// From line 1 until before loadBookings()
// ===============================

import { auth, db } from "../firebase.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import{
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc,
getDoc,
serverTimestamp
}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ===============================
// ARRAYS
// ===============================

let bookings=[];
let teachers=[];
let selectedBooking=null;
let editingBooking=null;


// ===============================
// STUDENT ELEMENTS
// ===============================

const bookingTable=document.getElementById("bookingTable");

const searchInput=document.getElementById("searchInput");

const statusFilter=document.getElementById("statusFilter");

const totalEnquiries=document.getElementById("totalEnquiries");

const pendingCount=document.getElementById("pendingCount");

const assignedCount=document.getElementById("assignedCount");

const admissionCount=document.getElementById("admissionCount");


// ===============================
// ENQUIRY MODAL
// ===============================

const addEnquiryBtn=document.getElementById("addEnquiryBtn");

const enquiryModal=document.getElementById("enquiryModal");

const closeEnquiry=document.getElementById("closeEnquiry");

const saveEnquiry=document.getElementById("saveEnquiry");

const studentName=document.getElementById("studentName");

const studentPhone=document.getElementById("studentPhone");

const parentName=document.getElementById("parentName");

const parentPhone=document.getElementById("parentPhone");

const studentClass=document.getElementById("studentClass");

const studentSubject=document.getElementById("studentSubject");

const studentArea=document.getElementById("studentArea");

const studentMode=document.getElementById("studentMode");

const studentRemarks=document.getElementById("studentRemarks");


// ===============================
// TEACHERS
// ===============================

const teacherTable=document.getElementById("teacherTable");

const addTeacherBtn=document.getElementById("addTeacherBtn");

const teacherModal=document.getElementById("teacherModal");

const teacherName=document.getElementById("teacherName");

const teacherPhone=document.getElementById("teacherPhone");

const teacherSubjects=document.getElementById("teacherSubjects");

const teacherAreas=document.getElementById("teacherAreas");

const saveTeacher=document.getElementById("saveTeacher");


// ===============================
// ASSIGN MODAL
// ===============================

const assignModal=document.getElementById("assignModal");

const teacherSelect=document.getElementById("teacherSelect");

const demoDate=document.getElementById("demoDate");

const demoTime=document.getElementById("demoTime");

const remarks=document.getElementById("remarks");

const saveAssign=document.getElementById("saveAssign");

const closeAssign=document.getElementById("closeAssign");


// ===============================
// STUDENT DETAILS
// ===============================

const studentModal=document.getElementById("studentModal");

const studentDetails=document.getElementById("studentDetails");

const closeStudentModal=document.getElementById("closeStudentModal");


// ===============================
// DEMO DETAILS
// ===============================

const demoModal=document.getElementById("demoModal");

const demoDetails=document.getElementById("demoDetails");

const closeDemoModal=document.getElementById("closeDemoModal");


// ===============================
// SIDEBAR
// ===============================

const menuItems=document.querySelectorAll("#sidebarMenu li");

menuItems.forEach(item=>{

item.onclick=()=>{

menuItems.forEach(x=>x.classList.remove("active"));

item.classList.add("active");

};

});


// ===============================
// LOGOUT
// ===============================

document.getElementById("logoutBtn").onclick=async()=>{

await signOut(auth);

location.href="admin-login.html";

};


// ===============================
// ROLE AUTH
// ===============================

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="admin-login.html";

return;

}

const userRef=doc(db,"users",user.uid);

const snap=await getDoc(userRef);

if(!snap.exists()){

await signOut(auth);

location.href="admin-login.html";

return;

}

const role=snap.data().role;

if(role!=="admin"){

await signOut(auth);

location.href="admin-login.html";

return;

}

await loadTeachers();

await loadBookings();

});
/* ==========================
PART 2
Replace your loadBookings(), updateDashboard() and renderBookings()
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

bookings.sort((a,b)=>{

const x=a.createdAt?.seconds||0;

const y=b.createdAt?.seconds||0;

return y-x;

});

updateDashboard();

renderBookings();

}catch(err){

console.error(err);

bookingTable.innerHTML=`
<tr>
<td colspan="8">Unable to load enquiries.</td>
</tr>
`;

}

}


/* ==========================
DASHBOARD
========================== */

function updateDashboard(){

totalEnquiries.textContent=bookings.length;

pendingCount.textContent=bookings.filter(x=>

(x.status||"Pending")==="Pending"

).length;

assignedCount.textContent=bookings.filter(x=>

x.status==="Assigned"

).length;

admissionCount.textContent=bookings.filter(x=>

x.status==="Admitted"

).length;

}


/* ==========================
RENDER BOOKINGS
========================== */

function renderBookings(){

bookingTable.innerHTML="";

const keyword=searchInput.value.toLowerCase().trim();

const status=statusFilter.value;

const filtered=bookings.filter(b=>{

const name=(b.studentName||"").toLowerCase();

const phone=(b.phone||"").toLowerCase();

const area=(b.area||"").toLowerCase();

const subject=(b.subject||"").toLowerCase();

const matchSearch=

name.includes(keyword) ||

phone.includes(keyword) ||

area.includes(keyword) ||

subject.includes(keyword);

const matchStatus=

status==="" ||

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

<td>${b.studentName||"-"}</td>

<td>${b.phone||"-"}</td>

<td>${b.class||"-"}</td>

<td>${b.subject||"-"}</td>

<td>${b.area||"-"}</td>

<td>${b.requestedTutorName || "-"}</td>

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

📞

</button>

<button
class="whatsapp"
onclick="whatsappStudent('${b.phone}')">

💬

</button>

<button
class="assign"
onclick="assignTeacher('${b.id}')">

Assign

</button>

<button
class="edit"
onclick="editBooking('${b.id}')">

Edit

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

searchInput.oninput=renderBookings;

statusFilter.onchange=renderBookings;

setInterval(loadBookings,30000);
/* ==========================
PART 3
NEW ENQUIRY + EDIT ENQUIRY
Paste BELOW renderBookings()
========================== */


/* ==========================
OPEN NEW ENQUIRY
========================== */

if(addEnquiryBtn){

addEnquiryBtn.onclick=()=>{

editingBooking=null;

studentName.value="";
studentPhone.value="";
parentName.value="";
parentPhone.value="";
studentClass.value="";
studentSubject.value="";
studentArea.value="";
studentMode.selectedIndex=0;
studentRemarks.value="";

saveEnquiry.textContent="Save Enquiry";

enquiryModal.classList.add("show");

};

}


/* ==========================
CLOSE MODAL
========================== */

if(closeEnquiry){

closeEnquiry.onclick=()=>{

enquiryModal.classList.remove("show");

};

}

window.addEventListener("click",e=>{

if(e.target===enquiryModal){

enquiryModal.classList.remove("show");

}

});


/* ==========================
SAVE / UPDATE
========================== */

saveEnquiry.onclick=async()=>{

if(studentName.value.trim()===""){

alert("Student Name Required");

return;

}

if(studentPhone.value.trim()===""){

alert("Phone Required");

return;

}

const data={

studentName:studentName.value.trim(),

phone:studentPhone.value.trim(),

parentName:parentName.value.trim(),

parentPhone:parentPhone.value.trim(),

class:studentClass.value.trim(),

subject:studentSubject.value.trim(),

area:studentArea.value.trim(),

mode:studentMode.value,

remarks:studentRemarks.value.trim()

};

try{

if(editingBooking){

await updateDoc(

doc(db,"demoBookings",editingBooking),

data

);

alert("Enquiry Updated");

}else{

await addDoc(

collection(db,"demoBookings"),

{

...data,

status:"Pending",

assignedTeacher:"",

teacherId:"",

createdAt:serverTimestamp()

}

);

alert("Enquiry Added");

}

editingBooking=null;

enquiryModal.classList.remove("show");

await loadBookings();

}catch(err){

console.error(err);

alert("Unable to Save");

}

};


/* ==========================
EDIT ENQUIRY
========================== */

window.editBooking=function(id){

const b=bookings.find(x=>x.id===id);

if(!b)return;

editingBooking=id;

studentName.value=b.studentName||"";

studentPhone.value=b.phone||"";

parentName.value=b.parentName||"";

parentPhone.value=b.parentPhone||"";

studentClass.value=b.class||"";

studentSubject.value=b.subject||"";

studentArea.value=b.area||"";

studentMode.value=b.mode||"Home Tuition";

studentRemarks.value=b.remarks||"";

saveEnquiry.textContent="Update Enquiry";

enquiryModal.classList.add("show");

};
/* ==========================
PART 4
TEACHERS + ASSIGN TEACHER
Replace your Teacher Section
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

teachers.sort((a,b)=>{

return (a.name||"").localeCompare(b.name||"");

});

renderTeachers();

}catch(err){

console.error(err);

}

}



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

${t.available===false

?'<span class="badge assigned">Busy</span>'

:'<span class="badge admitted">Available</span>'}

</td>

<td>

<button

class="assign"

onclick="toggleTeacher('${t.id}')">

${t.available===false

?"Make Available"

:"Make Busy"}

</button>

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

createdAt:serverTimestamp()

});

teacherName.value="";

teacherPhone.value="";

teacherSubjects.value="";

teacherAreas.value="";

teacherModal.classList.remove("show");

await loadTeachers();

alert("Teacher Added");

}catch(err){

console.error(err);

alert("Unable to Add");

}

};



/* ==========================
DELETE TEACHER
========================== */

window.deleteTeacher=async(id)=>{

if(!confirm("Delete Teacher?")) return;

try{

await deleteDoc(doc(db,"teachers",id));

await loadTeachers();

}catch(err){

console.error(err);

alert("Delete Failed");

}

};



/* ==========================
BUSY / AVAILABLE
========================== */

window.toggleTeacher=async(id)=>{

const teacher=teachers.find(t=>t.id===id);

if(!teacher) return;

try{

await updateDoc(

doc(db,"teachers",id),

{

available:!teacher.available

}

);

await loadTeachers();

}catch(err){

console.error(err);

}

};



/* ==========================
ASSIGN TEACHER
========================== */

window.assignTeacher=function(id){

selectedBooking=id;

teacherSelect.innerHTML=

`<option value="">Select Teacher</option>`;

teachers

.filter(t=>t.available!==false)

.forEach(t=>{

teacherSelect.innerHTML+=`

<option value="${t.id}">

${t.name}

</option>

`;

});

assignModal.classList.add("show");

};



closeAssign.onclick=()=>{

assignModal.classList.remove("show");

};



saveAssign.onclick=async()=>{

if(!selectedBooking){

alert("No Student Selected");

return;

}

if(teacherSelect.value===""){

alert("Select Teacher");

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

alert("Teacher Assigned");

}catch(err){

console.error(err);

alert("Assignment Failed");

}

};
/* ==========================
PART 5
STUDENT DETAILS + DEMO DETAILS + ADMISSION
Paste below PART 4
========================== */


/* ==========================
STATUS COLOR
========================== */

function getStatusClass(status){

switch(status){

case "Assigned":
return "badge assigned";

case "Admitted":
return "badge admitted";

case "Rejected":
return "badge rejected";

default:
return "badge pending";

}

}


/* ==========================
CALL
========================== */

window.callStudent=function(phone){

if(!phone)return;

window.location.href=`tel:${phone}`;

};


/* ==========================
WHATSAPP
========================== */

window.whatsappStudent=function(phone){

if(!phone)return;

window.open(`https://wa.me/91${phone}`,"_blank");

};


/* ==========================
DELETE ENQUIRY
========================== */

window.deleteBooking=async(id)=>{

if(!confirm("Delete this enquiry?")) return;

try{

await deleteDoc(doc(db,"demoBookings",id));

await loadBookings();

}catch(err){

console.error(err);

alert("Delete Failed");

}

};


/* ==========================
VIEW STUDENT
========================== */

window.viewStudent=function(id){

const b=bookings.find(x=>x.id===id);

if(!b)return;

studentDetails.innerHTML=`

<h3>${b.studentName}</h3>

<p><b>Phone :</b> ${b.phone||"-"}</p>

<p><b>Parent :</b> ${b.parentName||"-"}</p>

<p><b>Parent Phone :</b> ${b.parentPhone||"-"}</p>

<p><b>Class :</b> ${b.class||"-"}</p>

<p><b>Subject :</b> ${b.subject||"-"}</p>

<p><b>Area :</b> ${b.area||"-"}</p>

<p><b>Mode :</b> ${b.mode||"-"}</p>

<p><b>Status :</b> ${b.status||"Pending"}</p>

<p><b>Remarks :</b> ${b.remarks||"-"}</p>

`;

studentModal.classList.add("show");

};


closeStudentModal.onclick=()=>{

studentModal.classList.remove("show");

};


/* ==========================
VIEW DEMO
========================== */

window.viewDemo=function(id){

const b=bookings.find(x=>x.id===id);

if(!b)return;

demoDetails.innerHTML=`

<h3>${b.studentName}</h3>

<p><b>Teacher :</b> ${b.assignedTeacher||"-"}</p>

<p><b>Teacher Phone :</b> ${b.teacherPhone||"-"}</p>

<p><b>Demo Date :</b> ${b.demoDate||"-"}</p>

<p><b>Demo Time :</b> ${b.demoTime||"-"}</p>

<p><b>Status :</b> ${b.status||"-"}</p>

<p><b>Remarks :</b> ${b.remarks||"-"}</p>

`;

demoModal.classList.add("show");

};


closeDemoModal.onclick=()=>{

demoModal.classList.remove("show");

};


/* ==========================
ADMISSION
========================== */

window.markAdmitted=async(id)=>{

if(!confirm("Convert to Admission?")) return;

try{

await updateDoc(

doc(db,"demoBookings",id),

{

status:"Admitted",

admissionDate:new Date().toLocaleDateString()

}

);

await loadBookings();

alert("Admission Completed");

}catch(err){

console.error(err);

alert("Unable to Update");

}

};


/* ==========================
REJECT
========================== */

window.markRejected=async(id)=>{

if(!confirm("Reject this enquiry?")) return;

try{

await updateDoc(

doc(db,"demoBookings",id),

{

status:"Rejected"

}

);

await loadBookings();

}catch(err){

console.error(err);

}

};


/* ==========================
MODAL OUTSIDE CLICK
========================== */

window.onclick=(e)=>{

if(e.target===studentModal){

studentModal.classList.remove("show");

}

if(e.target===demoModal){

demoModal.classList.remove("show");

}

if(e.target===assignModal){

assignModal.classList.remove("show");

}

if(e.target===teacherModal){

teacherModal.classList.remove("show");

}

if(e.target===enquiryModal){

enquiryModal.classList.remove("show");

}

};
/* =========================================================
PART 6
FINAL CLEANUP + INITIALIZATION
Paste at the END of admin-dashboard-v2.js
========================================================= */


/* ---------- Close Teacher Modal ---------- */

const closeTeacherModal=document.getElementById("closeTeacherModal");

if(closeTeacherModal){

closeTeacherModal.onclick=()=>{

teacherModal.classList.remove("show");

};

}


/* ---------- ESC Close ---------- */

document.addEventListener("keydown",(e)=>{

if(e.key!=="Escape") return;

enquiryModal?.classList.remove("show");
teacherModal?.classList.remove("show");
assignModal?.classList.remove("show");
studentModal?.classList.remove("show");
demoModal?.classList.remove("show");

});


/* ---------- Helpers ---------- */

function formatDate(timestamp){

if(!timestamp) return "-";

try{

if(timestamp.seconds){

return new Date(timestamp.seconds*1000).toLocaleDateString();

}

return new Date(timestamp).toLocaleDateString();

}catch{

return "-";

}

}

function formatDateTime(timestamp){

if(!timestamp) return "-";

try{

if(timestamp.seconds){

return new Date(timestamp.seconds*1000).toLocaleString();

}

return new Date(timestamp).toLocaleString();

}catch{

return "-";

}

}


/* ---------- Refresh Dashboard ---------- */

async function refreshDashboard(){

await loadTeachers();

await loadBookings();

}


/* ---------- Auto Refresh ---------- */

setInterval(async()=>{

try{

await refreshDashboard();

}catch(e){

console.error(e);

}

},60000);


/* ---------- Network Status ---------- */

window.addEventListener("offline",()=>{

console.warn("Internet Disconnected");

});

window.addEventListener("online",()=>{

refreshDashboard();

});


/* ---------- Firestore Error ---------- */

window.addEventListener("unhandledrejection",(e)=>{

console.error(e.reason);

});


/* ---------- Make Functions Global ---------- */

window.loadBookings=loadBookings;
window.loadTeachers=loadTeachers;
window.refreshDashboard=refreshDashboard;
window.renderBookings=renderBookings;
window.renderTeachers=renderTeachers;
window.updateDashboard=updateDashboard;


/* ---------- Initial UI ---------- */

searchInput.value="";
statusFilter.value="";


/* ---------- Default Modal State ---------- */

[
enquiryModal,
teacherModal,
assignModal,
studentModal,
demoModal
].forEach(modal=>{

if(modal){

modal.classList.remove("show");

}

});


console.log("TutorNest Admin CRM Loaded Successfully");