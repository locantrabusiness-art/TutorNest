import { auth, db }
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
onAuthStateChanged,
signOut
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

doc,
getDoc,

collection,
query,
where,
getDocs,
addDoc,
serverTimestamp,
orderBy

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* =========================================================
ELEMENTS
========================================================= */

const nameEl=document.getElementById("name");
const emailEl=document.getElementById("email");
const logoutBtn=document.getElementById("logoutBtn");
const statusEl=document.getElementById("status");
const profilePhoto=document.getElementById("profilePhoto");

const progressBar=document.getElementById("progressBar");
const progressText=document.getElementById("progressText");

const previewBtn=document.getElementById("previewBtn");
const editProfileBtn=document.getElementById("editProfileBtn");

const assignedStudents=document.getElementById("assignedStudents");
const todayClasses=document.getElementById("todayClasses");
const pendingDemos=document.getElementById("pendingDemos");
const monthlyIncome=document.getElementById("monthlyIncome");

const studentTableBody=document.getElementById("studentTableBody");
const todaySchedule=document.getElementById("todaySchedule");
const timetable=document.getElementById("timetable");

const homeworkText=document.getElementById("homeworkText");
const publishHomework=document.getElementById("publishHomework");
const homeworkList=document.getElementById("homeworkList");

const notesText=document.getElementById("notesText");
const publishNotes=document.getElementById("publishNotes");
const notesList=document.getElementById("notesList");

const analyticsCards=document.getElementById("analyticsCards");

const leaveDate=document.getElementById("leaveDate");
const leaveReason=document.getElementById("leaveReason");
const applyLeave=document.getElementById("applyLeave");
const leaveHistory=document.getElementById("leaveHistory");

let tutorData=null;
let tutorUID=null;

/* =========================================================
LOGIN
========================================================= */

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="tutor-login.html";
return;

}

const q = query(
    collection(db,"tutors"),
    where("email","==",user.email)
);

const tutorSnap = await getDocs(q);

if(tutorSnap.empty){

    alert("Tutor Not Found");
    return;

}

const tutorDoc = tutorSnap.docs[0];

tutorUID = tutorDoc.id;

tutorData = tutorDoc.data();

if(!snap.exists()){

alert("Tutor Not Found");

await signOut(auth);

location.href="tutor-login.html";

return;

}

tutorData=snap.data();

loadProfile(user);

await Promise.all([

loadStudents(),
loadTodaySchedule(),
loadHomework(),
loadNotes(),
loadLeaveHistory(),
loadAnalytics()

]);

});

/* =========================================================
PROFILE
========================================================= */

function loadProfile(user){

nameEl.innerHTML=tutorData.name||"Tutor";

emailEl.innerHTML=tutorData.email||user.email;

profilePhoto.src=tutorData.photo||"assets/logo/logo.png";

let total=10;
let filled=0;

if(tutorData.name)filled++;
if(tutorData.photo)filled++;
if(tutorData.phone)filled++;
if(tutorData.qualification)filled++;
if(tutorData.about)filled++;
if(tutorData.area)filled++;
if(tutorData.subjects?.length)filled++;
if(tutorData.classes?.length)filled++;
if(tutorData.mode?.length)filled++;
if(tutorData.fees)filled++;

const percent=Math.round((filled/total)*100);

progressBar.style.width=percent+"%";

progressText.innerHTML=percent+"% Complete";

switch(tutorData.status){

case "Approved":

statusEl.innerHTML="✅ Verified";

statusEl.style.background="#d4edda";

break;

case "Rejected":

statusEl.innerHTML="❌ Rejected";

statusEl.style.background="#ffd6d6";

break;

default:

statusEl.innerHTML="🟡 Under Review";

statusEl.style.background="#fff3cd";

}

}
/* =========================================================
STUDENTS
========================================================= */

async function loadStudents(){

const q=query(
collection(db,"students"),
where("teacherId","==",tutorUID)
);

const snap=await getDocs(q);

studentTableBody.innerHTML="";

let total=0;

snap.forEach(docSnap=>{

total++;

const s=docSnap.data();

studentTableBody.innerHTML+=`

<tr>

<td>

${s.name || s.studentName || "-"}

</td>

<td>

${s.class||"-"}

</td>

<td>

${s.mode||"-"}

</td>

<td>

<span style="color:green;font-weight:bold;">

${s.status||"Active"}

</span>

</td>

<td>

<button
onclick="window.open('../teacher.html?id=${docSnap.id}')">

View

</button>

</td>

</tr>

`;

});

assignedStudents.innerHTML=total;

}

/* =========================================================
TODAY SCHEDULE
========================================================= */

async function loadTodaySchedule(){

const day=new Date().toLocaleDateString("en-US",{

weekday:"long"

});

const q=query(

collection(db,"timetable"),

where("teacherId","==",tutorUID),

where("day","==",day)

);

const snap=await getDocs(q);

todaySchedule.innerHTML="";
timetable.innerHTML="";

let count=0;

if(snap.empty){

todaySchedule.innerHTML=

`<div class="empty">

No Classes Today

</div>`;

todayClasses.innerHTML=0;

return;

}

snap.forEach(docSnap=>{

count++;

const cls=docSnap.data();

const card=`

<div style="padding:18px;
margin-bottom:15px;
border:1px solid #eee;
border-radius:12px;">

<h3>

${cls.studentName}

</h3>

<p>

${cls.subject}

</p>

<p>

${cls.time}

</p>

<p>

${cls.mode}

</p>

</div>

`;

todaySchedule.innerHTML+=card;

timetable.innerHTML+=card;

});

todayClasses.innerHTML=count;

}

/* =========================================================
HOMEWORK
========================================================= */

publishHomework.addEventListener(

"click",

async()=>{

if(homeworkText.value.trim()==="")return;

await addDoc(

collection(db,"homework"),

{

teacherId:tutorUID,

teacherName:tutorData.name,

homework:homeworkText.value,

createdAt:serverTimestamp()

}

);

homeworkText.value="";

loadHomework();

}

);

async function loadHomework(){

const q=query(

collection(db,"homework"),

where("teacherId","==",tutorUID),

orderBy("createdAt","desc")

);

const snap=await getDocs(q);

homeworkList.innerHTML="";

snap.forEach(docSnap=>{

const hw=docSnap.data();

homeworkList.innerHTML+=`

<div class="card"
style="margin-top:15px;">

<p>

${hw.homework}

</p>

</div>

`;

});

}

/* =========================================================
NOTES
========================================================= */

publishNotes.addEventListener(

"click",

async()=>{

if(notesText.value.trim()==="")return;

await addDoc(

collection(db,"notes"),

{

teacherId:tutorUID,

teacherName:tutorData.name,

notes:notesText.value,

createdAt:serverTimestamp()

}

);

notesText.value="";

loadNotes();

}

);

async function loadNotes(){

const q=query(

collection(db,"notes"),

where("teacherId","==",tutorUID),

orderBy("createdAt","desc")

);

const snap=await getDocs(q);

notesList.innerHTML="";

snap.forEach(docSnap=>{

const n=docSnap.data();

notesList.innerHTML+=`

<div class="card"
style="margin-top:15px;">

<p>

${n.notes}

</p>

</div>

`;

});

}
/* =========================================================
LEAVE REQUEST
========================================================= */

applyLeave.addEventListener(

"click",

async()=>{

if(leaveDate.value===""){

alert("Select Date");

return;

}

if(leaveReason.value.trim()===""){

alert("Enter Reason");

return;

}

await addDoc(

collection(db,"leaveRequests"),

{

teacherId:tutorUID,

teacherName:tutorData.name,

date:leaveDate.value,

reason:leaveReason.value,

status:"Pending",

createdAt:serverTimestamp()

}

);

leaveDate.value="";
leaveReason.value="";

loadLeaveHistory();

alert("Leave Request Submitted");

}

);

async function loadLeaveHistory(){

const q=query(

collection(db,"leaveRequests"),

where("teacherId","==",tutorUID),

orderBy("createdAt","desc")

);

const snap=await getDocs(q);

leaveHistory.innerHTML="";

if(snap.empty){

leaveHistory.innerHTML=`

<div class="empty">

No Leave History

</div>

`;

return;

}

snap.forEach(docSnap=>{

const leave=docSnap.data();

let color="#ffc107";

if(leave.status==="Approved"){

color="#28a745";

}

if(leave.status==="Rejected"){

color="#dc3545";

}

leaveHistory.innerHTML+=`

<div
style="

padding:18px;

border-left:5px solid ${color};

background:#fafafa;

margin-top:15px;

border-radius:10px;

">

<h4>

${leave.date}

</h4>

<p>

${leave.reason}

</p>

<b style="color:${color}">

${leave.status}

</b>

</div>

`;

});

}

/* =========================================================
ANALYTICS
========================================================= */

async function loadAnalytics(){

const studentsSnap=await getDocs(

query(

collection(db,"students"),

where("teacherId","==",tutorUID)

)

);

const homeworkSnap=await getDocs(

query(

collection(db,"homework"),

where("teacherId","==",tutorUID)

)

);

const notesSnap=await getDocs(

query(

collection(db,"notes"),

where("teacherId","==",tutorUID)

)

);

const leaveSnap=await getDocs(

query(

collection(db,"leaveRequests"),

where("teacherId","==",tutorUID)

)

);

analyticsCards.innerHTML=`

<div class="cards">

<div class="card">

<h2>

${studentsSnap.size}

</h2>

<p>

Students

</p>

</div>

<div class="card">

<h2>

${homeworkSnap.size}

</h2>

<p>

Homework

</p>

</div>

<div class="card">

<h2>

${notesSnap.size}

</h2>

<p>

Notes

</p>

</div>

<div class="card">

<h2>

${leaveSnap.size}

</h2>

<p>

Leave Requests

</p>

</div>

</div>

`;

}

/* =========================================================
BUTTONS
========================================================= */

previewBtn.onclick=()=>{

window.open(

`teacher.html?id=${tutorUID}`,

"_blank"

);

};

editProfileBtn.onclick=()=>{

location.href="tutor-profile.html";

};

logoutBtn.onclick=async()=>{

if(!confirm("Logout?"))return;

await signOut(auth);

location.href="tutor-login.html";

};

/* =========================================================
SEARCH STUDENT
========================================================= */

document

.getElementById("studentSearch")

.addEventListener(

"keyup",

function(){

const value=

this.value.toLowerCase();

const rows=

studentTableBody.querySelectorAll("tr");

rows.forEach(row=>{

row.style.display=

row.innerText

.toLowerCase()

.includes(value)

?""

:"none";

});

}

);

/* =========================================================
AUTO REFRESH
========================================================= */

setInterval(()=>{

loadStudents();

loadTodaySchedule();

loadHomework();

loadNotes();

loadLeaveHistory();

loadAnalytics();

},60000);

/* =========================================================
END
========================================================= */
/* =========================================================
MONTHLY SALARY
========================================================= */

async function loadSalary(){

const salaryCard=document.getElementById("monthlyIncome");

if(!salaryCard)return;

const q=query(

collection(db,"payments"),

where("teacherId","==",tutorUID)

);

const snap=await getDocs(q);

let total=0;

snap.forEach(doc=>{

const p=doc.data();

if(p.status==="Paid"){

total+=Number(p.amount||0);

}

});

salaryCard.innerHTML="₹"+total.toLocaleString();

}

/* =========================================================
DEMO CLASSES
========================================================= */

async function loadDemoClasses(){

const table=document.getElementById("demoTable");

if(!table)return;

table.innerHTML="";

const q=query(

collection(db,"demoBookings"),

where("teacherId","==",tutorUID),

orderBy("createdAt","desc")

);

const snap=await getDocs(q);

pendingDemos.innerHTML=snap.size;

if(snap.empty){

table.innerHTML=`

<tr>

<td colspan="4">

No Demo Classes

</td>

</tr>

`;

return;

}

snap.forEach(docSnap=>{

const d=docSnap.data();

table.innerHTML+=`

<tr>

<td>

${d.studentName}

</td>

<td>

${d.date||"-"}

</td>

<td>

${d.time||"-"}

</td>

<td>

<button onclick="window.open('../student.html?id=${d.studentId}')">

View

</button>

</td>

</tr>

`;

});

}

/* =========================================================
NOTIFICATIONS
========================================================= */

async function loadNotifications(){

const container=

document.getElementById("todaySchedule");

const q=query(

collection(db,"notifications"),

where("teacherId","==",tutorUID),

orderBy("createdAt","desc")

);

const snap=await getDocs(q);

if(snap.empty)return;

let html="";

snap.forEach(doc=>{

const n=doc.data();

html+=`

<div style="

padding:12px;

border-left:4px solid #0f4c81;

margin-bottom:12px;

background:#f8f9ff;

">

<b>

${n.title}

</b>

<p>

${n.message}

</p>

</div>

`;

});

container.innerHTML+=html;

}

/* =========================================================
DOCUMENTS
========================================================= */

const documentsBtn=

document.getElementById("documentsBtn");

if(documentsBtn){

documentsBtn.onclick=()=>{

location.href="tutor-documents.html";

};

}

/* =========================================================
SETTINGS
========================================================= */

const settingsBtn=

document.getElementById("settingsBtn");

if(settingsBtn){

settingsBtn.onclick=()=>{

location.href="tutor-settings.html";

};

}

/* =========================================================
SALARY BUTTON
========================================================= */

const salaryBtn=

document.getElementById("salaryBtn");

if(salaryBtn){

salaryBtn.onclick=()=>{

location.href="salary.html";

};

}

/* =========================================================
ATTENDANCE BUTTON
========================================================= */

const attendanceBtn=

document.getElementById("attendanceBtn");

if(attendanceBtn){

attendanceBtn.onclick=()=>{

location.href="attendance.html";

};

}

/* =========================================================
REFRESH
========================================================= */

const refreshBtn=

document.getElementById("refreshSchedule");

if(refreshBtn){

refreshBtn.onclick=async()=>{

await loadStudents();

await loadTodaySchedule();

await loadHomework();

await loadNotes();

await loadDemoClasses();

await loadSalary();

await loadAnalytics();

alert("Dashboard Updated");

};

}

/* =========================================================
INITIAL DASHBOARD LOAD
========================================================= */

async function initializeDashboard(){

await Promise.all([

loadStudents(),

loadTodaySchedule(),

loadHomework(),

loadNotes(),

loadLeaveHistory(),

loadAnalytics(),

loadSalary(),

loadDemoClasses(),

loadNotifications()

]);

}

document.addEventListener(

"DOMContentLoaded",

()=>{

setTimeout(

initializeDashboard,

500

);

});

/* =========================================================
END OF DASHBOARD V1
========================================================= */
/* =========================================================
STUDENT PROFILE MODAL
========================================================= */

const studentModal=document.createElement("div");

studentModal.id="studentModal";

studentModal.style.cssText=`
position:fixed;
left:0;
top:0;
width:100%;
height:100%;
background:rgba(0,0,0,.5);
display:none;
justify-content:center;
align-items:center;
z-index:99999;
`;

studentModal.innerHTML=`

<div style="
width:800px;
max-width:95%;
background:#fff;
padding:30px;
border-radius:15px;
max-height:90vh;
overflow:auto;
">

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:20px;
">

<h2>

Student Profile

</h2>

<button id="closeStudentModal">

✖

</button>

</div>

<div id="studentProfileBody">

Loading...

</div>

</div>

`;

document.body.appendChild(studentModal);

document

.getElementById("closeStudentModal")

.onclick=()=>{

studentModal.style.display="none";

};

window.viewStudent=

async function(id){

studentModal.style.display="flex";

const snap=await getDoc(

doc(db,"students",id)

);

if(!snap.exists()){

document.getElementById(

"studentProfileBody"

).innerHTML=

"Student Not Found";

return;

}

const s=snap.data();

document.getElementById(

"studentProfileBody"

).innerHTML=`

<div style="display:flex;gap:25px;">

<img

src="${s.photo||'assets/logo/logo.png'}"

style="

width:120px;

height:120px;

border-radius:50%;

object-fit:cover;

">

<div>

<h2>

${s.studentName}

</h2>

<p>

Class :

${s.class}

</p>

<p>

Subject :

${s.subject}

</p>

<p>

Mode :

${s.mode}

</p>

<p>

Parent :

${s.parentName||"-"}

</p>

<p>

Phone :

${s.parentPhone||"-"}

</p>

<p>

Address :

${s.address||"-"}

</p>

</div>

</div>

`;

};

/* =========================================================
UPDATE STUDENT TABLE BUTTON
========================================================= */

/*

Replace

onclick="window.open('../teacher.html?id=${docSnap.id}')"

With

onclick="viewStudent('${docSnap.id}')"

*/

/* =========================================================
TODAY ATTENDANCE
========================================================= */

async function loadAttendanceSummary(){

const today=

new Date()

.toISOString()

.split("T")[0];

const q=query(

collection(db,"attendance"),

where("teacherId","==",tutorUID),

where("date","==",today)

);

const snap=

await getDocs(q);

let present=0;

let absent=0;

let leave=0;

snap.forEach(doc=>{

const a=doc.data();

switch(a.status){

case"Present":

present++;

break;

case"Absent":

absent++;

break;

case"Leave":

leave++;

break;

}

});

analyticsCards.innerHTML+=`

<div class="cards">

<div class="card">

<h2>

${present}

</h2>

<p>

Present

</p>

</div>

<div class="card">

<h2>

${absent}

</h2>

<p>

Absent

</p>

</div>

<div class="card">

<h2>

${leave}

</h2>

<p>

Leave

</p>

</div>

</div>

`;

}

/* =========================================================
RECENT ACTIVITY
========================================================= */

async function loadRecentActivity(){

const q=query(

collection(db,"activityLogs"),

where("teacherId","==",tutorUID),

orderBy("createdAt","desc")

);

const snap=

await getDocs(q);

let html=`

<div class="section">

<h2>

Recent Activity

</h2>

`;

snap.forEach(doc=>{

const a=doc.data();

html+=`

<div style="

padding:15px;

margin-top:12px;

border-bottom:1px solid #eee;

">

<b>

${a.title}

</b>

<p>

${a.description}

</p>

</div>

`;

});

html+=`</div>`;

document

.querySelector(".main")

.insertAdjacentHTML(

"beforeend",

html

);

}

/* =========================================================
FINAL INITIALIZATION
========================================================= */

const oldInit=

initializeDashboard;

initializeDashboard=

async function(){

await oldInit();

await loadAttendanceSummary();

await loadRecentActivity();

};
/* =========================================================
DASHBOARD NOTIFICATIONS PANEL
PASTE AT END OF dashboard.js
========================================================= */

const notificationContainer = document.createElement("div");

notificationContainer.className = "section";

notificationContainer.innerHTML = `

<div class="sectionHeader">

<h2>

Notifications

</h2>

<button id="refreshNotifications">

Refresh

</button>

</div>

<div id="notificationList">

<div class="empty">

Loading...

</div>

</div>

`;

document

.querySelector(".main")

.appendChild(notificationContainer);

async function loadDashboardNotifications(){

const list=document.getElementById("notificationList");

const q=query(

collection(db,"notifications"),

where("teacherId","==",tutorUID),

orderBy("createdAt","desc")

);

const snap=await getDocs(q);

list.innerHTML="";

if(snap.empty){

list.innerHTML=`

<div class="empty">

No Notifications

</div>

`;

return;

}

snap.forEach(doc=>{

const n=doc.data();

let color="#0f4c81";

if(n.type==="success"){

color="#28a745";

}

if(n.type==="warning"){

color="#ffc107";

}

if(n.type==="danger"){

color="#dc3545";

}

list.innerHTML+=`

<div
style="
padding:16px;
margin-bottom:15px;
border-left:5px solid ${color};
background:#fafafa;
border-radius:10px;
">

<h4>

${n.title}

</h4>

<p>

${n.message}

</p>

<small>

${n.date||""}

</small>

</div>

`;

});

}

document

.getElementById("refreshNotifications")

.onclick=

loadDashboardNotifications;

/* =========================================================
UPCOMING CLASSES
========================================================= */

const upcomingSection=document.createElement("div");

upcomingSection.className="section";

upcomingSection.innerHTML=`

<h2>

Upcoming Classes

</h2>

<div id="upcomingClasses">

<div class="empty">

Loading...

</div>

</div>

`;

document

.querySelector(".main")

.appendChild(upcomingSection);

async function loadUpcomingClasses(){

const box=

document.getElementById(

"upcomingClasses"

);

const q=query(

collection(db,"timetable"),

where(

"teacherId",

"==",

tutorUID

),

orderBy("day"),

orderBy("time")

);

const snap=

await getDocs(q);

box.innerHTML="";

if(snap.empty){

box.innerHTML=`

<div class="empty">

No Classes

</div>

`;

return;

}

snap.forEach(doc=>{

const c=doc.data();

box.innerHTML+=`

<div
style="
padding:15px;
margin-bottom:12px;
background:#fff;
border-radius:10px;
border-left:4px solid #0f4c81;
">

<h4>

${c.studentName}

</h4>

<p>

${c.subject}

</p>

<p>

${c.day}

-

${c.time}

</p>

</div>

`;

});

}

/* =========================================================
AUTO LOAD
========================================================= */

const previousInitialize=

initializeDashboard;

initializeDashboard=

async function(){

await previousInitialize();

await loadDashboardNotifications();

await loadUpcomingClasses();

};
/* =========================================================
LIVE DASHBOARD STATS
PASTE AT END OF dashboard.js
========================================================= */

const liveSection=document.createElement("div");

liveSection.className="section";

liveSection.innerHTML=`

<div class="sectionHeader">

<h2>

Live Dashboard

</h2>

<button id="refreshDashboard">

Refresh

</button>

</div>

<div class="cards" id="liveDashboardCards">

<div class="card">

<h2>0</h2>

<p>Students</p>

</div>

<div class="card">

<h2>0</h2>

<p>Attendance</p>

</div>

<div class="card">

<h2>0</h2>

<p>Homework</p>

</div>

<div class="card">

<h2>0</h2>

<p>Demos</p>

</div>

</div>

`;

document.querySelector(".main").appendChild(liveSection);

async function refreshLiveDashboard(){

const studentsSnap=await getDocs(

query(

collection(db,"students"),

where("teacherId","==",tutorUID)

)

);

const attendanceSnap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",tutorUID)

)

);

const homeworkSnap=await getDocs(

query(

collection(db,"homework"),

where("teacherId","==",tutorUID)

)

);

const demoSnap=await getDocs(

query(

collection(db,"demoBookings"),

where("teacherId","==",tutorUID)

)

);

document.getElementById(

"liveDashboardCards"

).innerHTML=`

<div class="card">

<h2>

${studentsSnap.size}

</h2>

<p>

Students

</p>

</div>

<div class="card">

<h2>

${attendanceSnap.size}

</h2>

<p>

Attendance Records

</p>

</div>

<div class="card">

<h2>

${homeworkSnap.size}

</h2>

<p>

Homework

</p>

</div>

<div class="card">

<h2>

${demoSnap.size}

</h2>

<p>

Demo Classes

</p>

</div>

`;

}

document

.getElementById("refreshDashboard")

.onclick=

refreshLiveDashboard;

/* =========================================================
RECENT HOMEWORK
========================================================= */

const recentHomework=document.createElement("div");

recentHomework.className="section";

recentHomework.innerHTML=`

<h2>

Latest Homework

</h2>

<div id="latestHomework">

Loading...

</div>

`;

document

.querySelector(".main")

.appendChild(recentHomework);

async function loadLatestHomework(){

const box=document.getElementById(

"latestHomework"

);

const q=query(

collection(db,"homework"),

where("teacherId","==",tutorUID),

orderBy("createdAt","desc")

);

const snap=await getDocs(q);

box.innerHTML="";

if(snap.empty){

box.innerHTML="No Homework";

return;

}

snap.forEach(doc=>{

const h=doc.data();

box.innerHTML+=`

<div style="

padding:15px;

margin-top:12px;

background:#f8f9fb;

border-left:4px solid #0f4c81;

border-radius:10px;

">

<b>

${h.homework}

</b>

</div>

`;

});

}

/* =========================================================
TODAY ATTENDANCE BUTTON
========================================================= */

const markTodayButton=document.createElement("button");

markTodayButton.innerHTML="Open Attendance";

markTodayButton.style.marginTop="20px";

markTodayButton.onclick=()=>{

location.href="attendance.html";

};

document

.querySelector(".main")

.appendChild(markTodayButton);

/* =========================================================
FINAL LOAD
========================================================= */

const previousDashboardLoad=initializeDashboard;

initializeDashboard=async function(){

await previousDashboardLoad();

await refreshLiveDashboard();

await loadLatestHomework();

};
v
/* =========================================================
DASHBOARD CHARTS + UPCOMING FEATURES
PASTE AT END OF dashboard.js
========================================================= */

const insightsSection=document.createElement("div");

insightsSection.className="section";

insightsSection.innerHTML=`

<div class="sectionHeader">

<h2>

Teaching Insights

</h2>

</div>

<div id="insightCards" class="cards">

<div class="card">

<h2>0%</h2>

<p>

Attendance

</p>

</div>

<div class="card">

<h2>0%</h2>

<p>

Homework Submission

</p>

</div>

<div class="card">

<h2>0</h2>

<p>

Upcoming Classes

</p>

</div>

<div class="card">

<h2>0</h2>

<p>

Pending Fees

</p>

</div>

</div>

`;

document.querySelector(".main").appendChild(insightsSection);

async function loadInsights(){

const attendanceSnap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",tutorUID)

)

);

const studentSnap=await getDocs(

query(

collection(db,"students"),

where("teacherId","==",tutorUID)

)

);

const homeworkSnap=await getDocs(

query(

collection(db,"homework"),

where("teacherId","==",tutorUID)

)

);

const feeSnap=await getDocs(

query(

collection(db,"fees"),

where("teacherId","==",tutorUID)

)

);

let present=0;

attendanceSnap.forEach(doc=>{

if(doc.data().status==="Present"){

present++;

}

});

const attendancePercent=

attendanceSnap.size===0

?0

:Math.round(

(present*100)/attendanceSnap.size

);

const homeworkPercent=

studentSnap.size===0

?0

:Math.round(

(homeworkSnap.size*100)/studentSnap.size

);

let pendingFees=0;

feeSnap.forEach(doc=>{

const fee=doc.data();

if(fee.status!=="Paid"){

pendingFees++;

}

});

document.getElementById("insightCards").innerHTML=`

<div class="card">

<h2>

${attendancePercent}%

</h2>

<p>

Attendance

</p>

</div>

<div class="card">

<h2>

${homeworkPercent}%

</h2>

<p>

Homework

</p>

</div>

<div class="card">

<h2>

${todayClasses.innerHTML}

</h2>

<p>

Today's Classes

</p>

</div>

<div class="card">

<h2>

${pendingFees}

</h2>

<p>

Fee Pending

</p>

</div>

`;

}

/* =========================================================
ANNOUNCEMENTS
========================================================= */

const announcementSection=document.createElement("div");

announcementSection.className="section";

announcementSection.innerHTML=`

<h2>

Announcements

</h2>

<div id="announcementList">

Loading...

</div>

`;

document.querySelector(".main").appendChild(announcementSection);

async function loadAnnouncements(){

const box=document.getElementById("announcementList");

const q=query(

collection(db,"announcements"),

orderBy("createdAt","desc")

);

const snap=await getDocs(q);

box.innerHTML="";

if(snap.empty){

box.innerHTML=`

<div class="empty">

No Announcements

</div>

`;

return;

}

snap.forEach(doc=>{

const a=doc.data();

box.innerHTML+=`

<div style="

padding:18px;

margin-top:15px;

background:#f8f9fa;

border-left:4px solid #0f4c81;

border-radius:10px;

">

<h4>

${a.title}

</h4>

<p>

${a.message}

</p>

</div>

`;

});

}

/* =========================================================
CALENDAR SHORTCUT
========================================================= */

const calendarCard=document.createElement("div");

calendarCard.className="section";

calendarCard.innerHTML=`

<h2>

Today's Date

</h2>

<h1 id="todayDate">

</h1>

`;

document.querySelector(".main").appendChild(calendarCard);

document.getElementById(

"todayDate"

).innerHTML=

new Date().toDateString();

/* =========================================================
FINAL BOOT
========================================================= */

const initDashboardFinal=initializeDashboard;

initializeDashboard=async function(){

await initDashboardFinal();

await loadInsights();

await loadAnnouncements();

};

/* =========================================================
END OF DASHBOARD.JS V2
========================================================= */
/* =========================================================
TUTOR DASHBOARD WIDGETS V3
PASTE AT END OF dashboard.js
========================================================= */

/* ---------- DAILY TARGET ---------- */

const dailyTargetSection = document.createElement("div");

dailyTargetSection.className = "section";

dailyTargetSection.innerHTML = `

<div class="sectionHeader">

<h2>

Today's Progress

</h2>

</div>

<div style="margin-top:20px;">

<div style="display:flex;justify-content:space-between;">

<span>

Classes Completed

</span>

<span id="completedClasses">

0 / 0

</span>

</div>

<div style="
height:12px;
background:#ddd;
border-radius:30px;
margin-top:12px;
overflow:hidden;
">

<div id="dailyProgressBar"
style="
height:100%;
width:0%;
background:#0f4c81;
">

</div>

</div>

</div>

`;

document.querySelector(".main").appendChild(dailyTargetSection);

async function loadDailyProgress(){

const day=new Date().toLocaleDateString("en-US",{

weekday:"long"

});

const classes=await getDocs(

query(

collection(db,"timetable"),

where("teacherId","==",tutorUID),

where("day","==",day)

)

);

const attendance=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",tutorUID),

where(

"date",

"==",

new Date().toISOString().split("T")[0]

)

)

);

const total=classes.size;

const done=attendance.size;

const percent=

total===0

?0

:Math.round(done*100/total);

document.getElementById(

"completedClasses"

).innerHTML=

done+" / "+total;

document.getElementById(

"dailyProgressBar"

).style.width=

percent+"%";

}

/* ---------- UPCOMING DEMOS ---------- */

const demoWidget=document.createElement("div");

demoWidget.className="section";

demoWidget.innerHTML=`

<h2>

Upcoming Demo Classes

</h2>

<div id="upcomingDemoList">

Loading...

</div>

`;

document.querySelector(".main").appendChild(demoWidget);

async function loadUpcomingDemos(){

const box=

document.getElementById(

"upcomingDemoList"

);

const snap=

await getDocs(

query(

collection(db,"demoBookings"),

where("teacherId","==",tutorUID),

orderBy("date")

)

);

box.innerHTML="";

if(snap.empty){

box.innerHTML="No Upcoming Demo";

return;

}

snap.forEach(doc=>{

const d=doc.data();

box.innerHTML+=`

<div style="
padding:15px;
margin-top:15px;
background:#f8f9fa;
border-left:4px solid #0f4c81;
border-radius:10px;
">

<h4>

${d.studentName}

</h4>

<p>

${d.date}

&nbsp;

${d.time}

</p>

</div>

`;

});

}

/* ---------- RECENT PAYMENTS ---------- */

const paymentWidget=document.createElement("div");

paymentWidget.className="section";

paymentWidget.innerHTML=`

<h2>

Recent Payments

</h2>

<div id="recentPayments">

Loading...

</div>

`;

document.querySelector(".main").appendChild(paymentWidget);

async function loadRecentPayments(){

const box=

document.getElementById(

"recentPayments"

);

const snap=

await getDocs(

query(

collection(db,"payments"),

where("teacherId","==",tutorUID),

orderBy("createdAt","desc")

)

);

box.innerHTML="";

if(snap.empty){

box.innerHTML="No Payments";

return;

}

snap.forEach(doc=>{

const p=doc.data();

box.innerHTML+=`

<div style="
padding:15px;
margin-top:12px;
border-bottom:1px solid #eee;
">

<b>

₹${Number(p.amount||0).toLocaleString()}

</b>

<p>

${p.status}

</p>

</div>

`;

});

}

/* ---------- SYSTEM STATUS ---------- */

const systemWidget=document.createElement("div");

systemWidget.className="section";

systemWidget.innerHTML=`

<h2>

System Status

</h2>

<div id="systemStatus">

🟢 All Services Running

</div>

`;

document.querySelector(".main").appendChild(systemWidget);

/* ---------- REFRESH ---------- */

async function refreshEverything(){

await Promise.all([

loadStudents(),

loadTodaySchedule(),

loadHomework(),

loadNotes(),

loadLeaveHistory(),

loadAnalytics(),

loadSalary(),

loadDemoClasses(),

loadNotifications(),

loadInsights(),

loadAnnouncements(),

loadDailyProgress(),

loadUpcomingDemos(),

loadRecentPayments()

]);

}

/* ---------- AUTO REFRESH ---------- */

setInterval(

refreshEverything,

120000

);

/* ---------- INITIAL ---------- */

const dashboardBoot=

initializeDashboard;

initializeDashboard=

async function(){

await dashboardBoot();

await refreshEverything();

};

/* =========================================================
END OF TUTOR DASHBOARD V3
========================================================= */