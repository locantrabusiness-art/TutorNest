import { auth, db } from "../firebase.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

collection,
query,
where,
orderBy,
getDocs,
addDoc,
serverTimestamp

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* =========================================================
ELEMENTS
========================================================= */

const attendanceDate=document.getElementById("attendanceDate");
const attendanceBody=document.getElementById("attendanceBody");
const totalStudents=document.getElementById("totalStudents");
const presentStudents=document.getElementById("presentStudents");
const absentStudents=document.getElementById("absentStudents");
const leaveStudents=document.getElementById("leaveStudents");
const saveAttendance=document.getElementById("saveAttendance");

let teacherId="";
let teacherName="";
let students=[];

/* =========================================================
LOGIN
========================================================= */

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="tutor-login.html";

return;

}

teacherId=user.uid;

attendanceDate.value=

new Date()

.toISOString()

.split("T")[0];

const tutorSnap=await getDocs(

query(

collection(db,"tutors"),

where("email","==",user.email)

)

);

tutorSnap.forEach(doc=>{

teacherName=

doc.data().name;

});

await loadStudents();

});

/* =========================================================
LOAD STUDENTS
========================================================= */

async function loadStudents(){

attendanceBody.innerHTML="";

students=[];

const snap=await getDocs(

query(

collection(db,"students"),

where("teacherId","==",teacherId),

orderBy("studentName")

)

);

totalStudents.innerHTML=snap.size;

snap.forEach(doc=>{

const s={

id:doc.id,

...doc.data()

};

students.push(s);

attendanceBody.innerHTML+=`

<tr>

<td>

${s.studentName}

</td>

<td>

${s.class}

</td>

<td>

<select
id="status_${doc.id}">

<option>

Present

</option>

<option>

Absent

</option>

<option>

Leave

</option>

</select>

</td>

<td>

<input

id="remark_${doc.id}"

placeholder="Remark">

</td>

</tr>

`;

});

updateSummary();

}

/* =========================================================
SUMMARY
========================================================= */

function updateSummary(){

let p=0;

let a=0;

let l=0;

students.forEach(student=>{

const value=

document.getElementById(

"status_"+student.id

);

if(!value)return;

switch(value.value){

case"Present":

p++;

break;

case"Absent":

a++;

break;

case"Leave":

l++;

break;

}

});

presentStudents.innerHTML=p;

absentStudents.innerHTML=a;

leaveStudents.innerHTML=l;

}

document.addEventListener(

"change",

e=>{

if(

e.target.tagName==="SELECT"

){

updateSummary();

}

});
/* =========================================================
SAVE ATTENDANCE
========================================================= */

saveAttendance.addEventListener(

"click",

async()=>{

if(students.length===0){

alert("No Students Found");

return;

}

saveAttendance.disabled=true;

for(const student of students){

const status=

document.getElementById(

"status_"+student.id

).value;

const remark=

document.getElementById(

"remark_"+student.id

).value;

await addDoc(

collection(db,"attendance"),

{

teacherId,

teacherName,

studentId:student.id,

studentName:student.studentName,

class:student.class,

status,

remark,

date:attendanceDate.value,

createdAt:serverTimestamp()

}

);

}

saveAttendance.disabled=false;

alert("Attendance Saved Successfully");

});

/* =========================================================
LOAD TODAY ATTENDANCE
========================================================= */

async function loadTodayAttendance(){

const snap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId),

where("date","==",attendanceDate.value)

)

);

snap.forEach(doc=>{

const data=doc.data();

const status=

document.getElementById(

"status_"+data.studentId

);

const remark=

document.getElementById(

"remark_"+data.studentId

);

if(status){

status.value=data.status;

}

if(remark){

remark.value=data.remark||"";

}

});

updateSummary();

}

attendanceDate.addEventListener(

"change",

loadTodayAttendance

);

/* =========================================================
SELECT ALL PRESENT
========================================================= */

window.markAllPresent=function(){

students.forEach(student=>{

document.getElementById(

"status_"+student.id

).value="Present";

});

updateSummary();

};

/* =========================================================
SELECT ALL ABSENT
========================================================= */

window.markAllAbsent=function(){

students.forEach(student=>{

document.getElementById(

"status_"+student.id

).value="Absent";

});

updateSummary();

};

/* =========================================================
SELECT ALL LEAVE
========================================================= */

window.markAllLeave=function(){

students.forEach(student=>{

document.getElementById(

"status_"+student.id

).value="Leave";

});

updateSummary();

};

/* =========================================================
SEARCH STUDENT
========================================================= */

const search=document.getElementById(

"studentSearch"

);

if(search){

search.addEventListener(

"keyup",

function(){

const keyword=

this.value.toLowerCase();

attendanceBody

.querySelectorAll("tr")

.forEach(row=>{

row.style.display=

row.innerText

.toLowerCase()

.includes(keyword)

?""

:"none";

});

});

}

/* =========================================================
INITIAL LOAD
========================================================= */

setTimeout(

loadTodayAttendance,

1000

);
/* =========================================================
EDIT ATTENDANCE
========================================================= */

window.editAttendance=async function(studentId){

const snap=await getDocs(

query(

collection(db,"attendance"),

where("studentId","==",studentId),

where("date","==",attendanceDate.value)

)

);

if(snap.empty){

alert("Attendance Not Found");

return;

}

snap.forEach(doc=>{

const data=doc.data();

document.getElementById(

"status_"+studentId

).value=data.status;

document.getElementById(

"remark_"+studentId

).value=data.remark||"";

});

updateSummary();

};

/* =========================================================
MONTHLY ATTENDANCE
========================================================= */

window.monthlyAttendance=

async function(){

const month=

attendanceDate.value.substring(0,7);

const snap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId)

)

);

const report={};

snap.forEach(doc=>{

const a=doc.data();

if(!a.date.startsWith(month))return;

if(!report[a.studentName]){

report[a.studentName]={

Present:0,

Absent:0,

Leave:0

};

}

report[a.studentName][a.status]++;

});

console.table(report);

};

/* =========================================================
EXPORT CSV
========================================================= */

window.exportAttendanceCSV=

async function(){

const snap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId),

where("date","==",attendanceDate.value)

)

);

let csv=

"Student,Class,Status,Remark\n";

snap.forEach(doc=>{

const a=doc.data();

csv+=

`${a.studentName},${a.class},${a.status},${a.remark}\n`;

});

const blob=new Blob(

[csv],

{

type:"text/csv"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download=

attendanceDate.value+

"-attendance.csv";

a.click();

};

/* =========================================================
AUTO SUMMARY
========================================================= */

async function attendanceSummary(){

const snap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId),

where("date","==",attendanceDate.value)

)

);

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

presentStudents.innerHTML=present;

absentStudents.innerHTML=absent;

leaveStudents.innerHTML=leave;

}

/* =========================================================
AUTO REFRESH
========================================================= */

setInterval(

attendanceSummary,

30000

);

/* =========================================================
PRINT
========================================================= */

window.printAttendance=

function(){

window.print();

};

/* =========================================================
END OF ATTENDANCE PART-3
========================================================= */
/* =========================================================
ATTENDANCE HISTORY + UPDATE + DELETE
PASTE AT END OF attendance.js
========================================================= */

import {
doc,
updateDoc,
deleteDoc
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* =========================================================
HISTORY TABLE
========================================================= */

const historyBody=document.getElementById("historyBody");

async function loadAttendanceHistory(){

if(!historyBody)return;

const snap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId),

orderBy("date","desc")

)

);

historyBody.innerHTML="";

if(snap.empty){

historyBody.innerHTML=`

<tr>

<td colspan="7">

No Attendance Found

</td>

</tr>

`;

return;

}

snap.forEach(docSnap=>{

const a=docSnap.data();

historyBody.innerHTML+=`

<tr>

<td>

${a.date}

</td>

<td>

${a.studentName}

</td>

<td>

${a.class}

</td>

<td>

${a.status}

</td>

<td>

${a.remark||"-"}

</td>

<td>

<button

onclick="editAttendanceRecord('${docSnap.id}')">

Edit

</button>

</td>

<td>

<button

style="background:#dc3545"

onclick="deleteAttendanceRecord('${docSnap.id}')">

Delete

</button>

</td>

</tr>

`;

});

}

/* =========================================================
EDIT
========================================================= */

window.editAttendanceRecord=

async function(id){

const snap=await getDocs(

query(

collection(db,"attendance")

)

);

snap.forEach(async item=>{

if(item.id!==id)return;

const data=item.data();

const status=

prompt(

"Status",

data.status

);

if(!status)return;

const remark=

prompt(

"Remark",

data.remark||""

);

await updateDoc(

doc(db,"attendance",id),

{

status,

remark

}

);

alert("Updated");

loadAttendanceHistory();

attendanceSummary();

});

};

/* =========================================================
DELETE
========================================================= */

window.deleteAttendanceRecord=

async function(id){

if(

!confirm(

"Delete Attendance ?"

)

)return;

await deleteDoc(

doc(

db,

"attendance",

id

)

);

loadAttendanceHistory();

attendanceSummary();

};

/* =========================================================
MONTH FILTER
========================================================= */

window.filterAttendance=

async function(month){

const rows=

historyBody.querySelectorAll("tr");

rows.forEach(row=>{

if(

row.innerText.includes(month)

){

row.style.display="";

}else{

row.style.display="none";

}

});

};

/* =========================================================
EXPORT JSON
========================================================= */

window.exportAttendanceJSON=

async function(){

const snap=

await getDocs(

query(

collection(db,"attendance"),

where(

"teacherId",

"==",

teacherId

)

)

);

const data=[];

snap.forEach(doc=>{

data.push(doc.data());

});

const blob=

new Blob(

[

JSON.stringify(

data,

null,

2

)

],

{

type:"application/json"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download="attendance.json";

a.click();

};

/* =========================================================
REFRESH HISTORY
========================================================= */

setInterval(

loadAttendanceHistory,

60000

);

setTimeout(

loadAttendanceHistory,

1200

);
/* =========================================================
ATTENDANCE HISTORY + UPDATE + DELETE
PASTE AT END OF attendance.js
========================================================= */

import {
doc,
updateDoc,
deleteDoc
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* =========================================================
HISTORY TABLE
========================================================= */

const historyBody=document.getElementById("historyBody");

async function loadAttendanceHistory(){

if(!historyBody)return;

const snap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId),

orderBy("date","desc")

)

);

historyBody.innerHTML="";

if(snap.empty){

historyBody.innerHTML=`

<tr>

<td colspan="7">

No Attendance Found

</td>

</tr>

`;

return;

}

snap.forEach(docSnap=>{

const a=docSnap.data();

historyBody.innerHTML+=`

<tr>

<td>

${a.date}

</td>

<td>

${a.studentName}

</td>

<td>

${a.class}

</td>

<td>

${a.status}

</td>

<td>

${a.remark||"-"}

</td>

<td>

<button

onclick="editAttendanceRecord('${docSnap.id}')">

Edit

</button>

</td>

<td>

<button

style="background:#dc3545"

onclick="deleteAttendanceRecord('${docSnap.id}')">

Delete

</button>

</td>

</tr>

`;

});

}

/* =========================================================
EDIT
========================================================= */

window.editAttendanceRecord=

async function(id){

const snap=await getDocs(

query(

collection(db,"attendance")

)

);

snap.forEach(async item=>{

if(item.id!==id)return;

const data=item.data();

const status=

prompt(

"Status",

data.status

);

if(!status)return;

const remark=

prompt(

"Remark",

data.remark||""

);

await updateDoc(

doc(db,"attendance",id),

{

status,

remark

}

);

alert("Updated");

loadAttendanceHistory();

attendanceSummary();

});

};

/* =========================================================
DELETE
========================================================= */

window.deleteAttendanceRecord=

async function(id){

if(

!confirm(

"Delete Attendance ?"

)

)return;

await deleteDoc(

doc(

db,

"attendance",

id

)

);

loadAttendanceHistory();

attendanceSummary();

};

/* =========================================================
MONTH FILTER
========================================================= */

window.filterAttendance=

async function(month){

const rows=

historyBody.querySelectorAll("tr");

rows.forEach(row=>{

if(

row.innerText.includes(month)

){

row.style.display="";

}else{

row.style.display="none";

}

});

};

/* =========================================================
EXPORT JSON
========================================================= */

window.exportAttendanceJSON=

async function(){

const snap=

await getDocs(

query(

collection(db,"attendance"),

where(

"teacherId",

"==",

teacherId

)

)

);

const data=[];

snap.forEach(doc=>{

data.push(doc.data());

});

const blob=

new Blob(

[

JSON.stringify(

data,

null,

2

)

],

{

type:"application/json"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download="attendance.json";

a.click();

};

/* =========================================================
REFRESH HISTORY
========================================================= */

setInterval(

loadAttendanceHistory,

60000

);

setTimeout(

loadAttendanceHistory,

1200

);
/* =========================================================
ATTENDANCE DASHBOARD WIDGETS
PASTE AT END OF attendance.js
========================================================= */

const dashboardBox=document.getElementById("attendanceDashboard");

async function loadAttendanceDashboard(){

if(!dashboardBox)return;

const snap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId)

)

);

let present=0;
let absent=0;
let leave=0;

const classWise={};
const studentWise={};

snap.forEach(doc=>{

const a=doc.data();

if(!classWise[a.class]){

classWise[a.class]=0;

}

classWise[a.class]++;

if(!studentWise[a.studentName]){

studentWise[a.studentName]={

present:0,
total:0

};

}

studentWise[a.studentName].total++;

if(a.status==="Present"){

present++;

studentWise[a.studentName].present++;

}

if(a.status==="Absent"){

absent++;

}

if(a.status==="Leave"){

leave++;

}

});

const total=present+absent+leave;

dashboardBox.innerHTML=`

<div class="cards">

<div class="card">

<h2>${total}</h2>

<p>Total Records</p>

</div>

<div class="card">

<h2>${Object.keys(studentWise).length}</h2>

<p>Students</p>

</div>

<div class="card">

<h2>${Object.keys(classWise).length}</h2>

<p>Classes</p>

</div>

<div class="card">

<h2>${present}</h2>

<p>Present</p>

</div>

<div class="card">

<h2>${absent}</h2>

<p>Absent</p>

</div>

<div class="card">

<h2>${leave}</h2>

<p>Leave</p>

</div>

</div>

`;

}

/* =========================================================
TOP 5 STUDENTS
========================================================= */

window.loadTopAttendance=

async function(){

const data={};

const snap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId)

)

);

snap.forEach(doc=>{

const a=doc.data();

if(!data[a.studentName]){

data[a.studentName]={

present:0,
total:0

};

}

data[a.studentName].total++;

if(a.status==="Present"){

data[a.studentName].present++;

}

});

const arr=[];

Object.keys(data).forEach(name=>{

arr.push({

name,

percentage:Math.round(

(data[name].present*100)/

data[name].total

)

});

});

arr.sort(

(a,b)=>

b.percentage-a.percentage

);

console.table(

arr.slice(0,5)

);

};

/* =========================================================
RESET TODAY
========================================================= */

window.resetAttendanceForm=

function(){

students.forEach(student=>{

document.getElementById(

"status_"+student.id

).value="Present";

document.getElementById(

"remark_"+student.id

).value="";

});

updateSummary();

};

/* =========================================================
PRINT REPORT
========================================================= */

window.printMonthlyReport=

function(){

window.print();

};

/* =========================================================
AUTO LOAD
========================================================= */

setTimeout(

loadAttendanceDashboard,

1500

);

setInterval(

loadAttendanceDashboard,

60000

);

/* =========================================================
END OF ATTENDANCE.JS V5
========================================================= */
/* =========================================================
CLASSWISE + STUDENTWISE ATTENDANCE REPORTS
PASTE AT END OF attendance.js
========================================================= */

const reportBox=document.getElementById("attendanceReports");

/* =========================================================
CLASS REPORT
========================================================= */

window.generateClassReport=async function(){

const classData={};

const snap=await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId)

)

);

snap.forEach(doc=>{

const a=doc.data();

if(!classData[a.class]){

classData[a.class]={

Present:0,
Absent:0,
Leave:0

};

}

classData[a.class][a.status]++;

});

let html=`

<table class="table">

<thead>

<tr>

<th>

Class

</th>

<th>

Present

</th>

<th>

Absent

</th>

<th>

Leave

</th>

</tr>

</thead>

<tbody>

`;

Object.keys(classData).forEach(cls=>{

html+=`

<tr>

<td>

${cls}

</td>

<td>

${classData[cls].Present}

</td>

<td>

${classData[cls].Absent}

</td>

<td>

${classData[cls].Leave}

</td>

</tr>

`;

});

html+=`

</tbody>

</table>

`;

if(reportBox){

reportBox.innerHTML=html;

}

};

/* =========================================================
STUDENT REPORT
========================================================= */

window.generateStudentReport=

async function(studentId){

const snap=

await getDocs(

query(

collection(db,"attendance"),

where(

"studentId",

"==",

studentId

)

)

);

let present=0;

let absent=0;

let leave=0;

let html=`

<table class="table">

<thead>

<tr>

<th>

Date

</th>

<th>

Status

</th>

<th>

Remark

</th>

</tr>

</thead>

<tbody>

`;

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

html+=`

<tr>

<td>

${a.date}

</td>

<td>

${a.status}

</td>

<td>

${a.remark||"-"}

</td>

</tr>

`;

});

html+=`

</tbody>

</table>

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

if(reportBox){

reportBox.innerHTML=html;

}

};

/* =========================================================
DATE FILTER
========================================================= */

window.filterAttendanceByDate=

async function(from,to){

const rows=

historyBody.querySelectorAll("tr");

rows.forEach(row=>{

const date=

row.cells[0]?.innerText;

if(

date>=from &&

date<=to

){

row.style.display="";

}else{

row.style.display="none";

}

});

};

/* =========================================================
EXPORT EXCEL
========================================================= */

window.exportAttendanceExcel=

async function(){

const snap=

await getDocs(

query(

collection(db,"attendance"),

where(

"teacherId",

"==",

teacherId

)

)

);

let csv=

"Date,Student,Class,Status,Remark\n";

snap.forEach(doc=>{

const a=doc.data();

csv+=`${a.date},${a.studentName},${a.class},${a.status},${a.remark||""}\n`;

});

const blob=new Blob(

[csv],

{

type:"application/vnd.ms-excel"

}

);

const url=

URL.createObjectURL(blob);

const link=

document.createElement("a");

link.href=url;

link.download="AttendanceReport.xls";

link.click();

};

/* =========================================================
CLEAR FILTER
========================================================= */

window.clearAttendanceFilter=

function(){

historyBody

.querySelectorAll("tr")

.forEach(row=>{

row.style.display="";

});

};

/* =========================================================
END OF ATTENDANCE.JS V6
========================================================= */
/* =========================================================
HOLIDAY + BULK OPERATIONS + ATTENDANCE LOCK
PASTE AT END OF attendance.js
========================================================= */

/* =========================================================
HOLIDAY LIST
========================================================= */

window.loadHolidayList = async function(){

const holidayBody=document.getElementById("holidayBody");

if(!holidayBody)return;

const snap=await getDocs(

query(

collection(db,"holidays"),

orderBy("date")

)

);

holidayBody.innerHTML="";

if(snap.empty){

holidayBody.innerHTML=`

<tr>

<td colspan="3">

No Holidays

</td>

</tr>

`;

return;

}

snap.forEach(doc=>{

const h=doc.data();

holidayBody.innerHTML+=`

<tr>

<td>${h.date}</td>

<td>${h.title}</td>

<td>${h.reason||"-"}</td>

</tr>

`;

});

};

/* =========================================================
ADD HOLIDAY
========================================================= */

window.addHoliday = async function(){

const date=prompt("Holiday Date (YYYY-MM-DD)");

if(!date)return;

const title=prompt("Holiday Title");

if(!title)return;

const reason=prompt("Reason")||"";

await addDoc(

collection(db,"holidays"),

{

date,

title,

reason,

createdAt:serverTimestamp()

}

);

alert("Holiday Added");

loadHolidayList();

};

/* =========================================================
BULK PRESENT
========================================================= */

window.bulkPresent=function(){

document

.querySelectorAll("select[id^='status_']")

.forEach(select=>{

select.value="Present";

});

updateSummary();

};

/* =========================================================
BULK ABSENT
========================================================= */

window.bulkAbsent=function(){

document

.querySelectorAll("select[id^='status_']")

.forEach(select=>{

select.value="Absent";

});

updateSummary();

};

/* =========================================================
BULK LEAVE
========================================================= */

window.bulkLeave=function(){

document

.querySelectorAll("select[id^='status_']")

.forEach(select=>{

select.value="Leave";

});

updateSummary();

};

/* =========================================================
ATTENDANCE LOCK
========================================================= */

window.lockAttendance = async function(){

const date=attendanceDate.value;

await addDoc(

collection(db,"attendanceLocks"),

{

teacherId,

date,

locked:true,

createdAt:serverTimestamp()

}

);

alert("Attendance Locked");

};

/* =========================================================
CHECK LOCK
========================================================= */

async function isAttendanceLocked(date){

const snap=await getDocs(

query(

collection(db,"attendanceLocks"),

where("teacherId","==",teacherId),

where("date","==",date)

)

);

return !snap.empty;

}

/* =========================================================
SAFE SAVE WITH LOCK
========================================================= */

const originalSave=safeSaveAttendance;

safeSaveAttendance=async function(){

const locked=

await isAttendanceLocked(

attendanceDate.value

);

if(locked){

alert("Attendance Locked");

return;

}

await originalSave();

};

/* =========================================================
BACKUP
========================================================= */

window.backupAttendance=function(){

const data=[];

document

.querySelectorAll("#historyBody tr")

.forEach(row=>{

data.push(row.innerText);

});

const blob=new Blob(

[data.join("\n")],

{

type:"text/plain"

}

);

const url=URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;

a.download="attendance-backup.txt";

a.click();

};

/* =========================================================
END OF ATTENDANCE.JS V7
========================================================= */
/* =========================================================
ATTENDANCE SETTINGS + RESTORE + STATISTICS
PASTE AT END OF attendance.js
========================================================= */

/* =========================================================
SETTINGS
========================================================= */

const attendanceSettings={

autoRefresh:true,

refreshTime:60000,

defaultStatus:"Present"

};

/* =========================================================
SAVE SETTINGS
========================================================= */

window.saveAttendanceSettings=function(){

localStorage.setItem(

"attendanceSettings",

JSON.stringify(

attendanceSettings

)

);

alert("Settings Saved");

};

/* =========================================================
LOAD SETTINGS
========================================================= */

(function(){

const saved=

localStorage.getItem(

"attendanceSettings"

);

if(saved){

Object.assign(

attendanceSettings,

JSON.parse(saved)

);

}

})();

/* =========================================================
RESTORE DEFAULT STATUS
========================================================= */

window.restoreAttendance=function(){

students.forEach(student=>{

document.getElementById(

"status_"+student.id

).value=

attendanceSettings.defaultStatus;

document.getElementById(

"remark_"+student.id

).value="";

});

updateSummary();

};

/* =========================================================
TODAY STATS
========================================================= */

window.todayStats=

async function(){

const snap=

await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId),

where("date","==",attendanceDate.value)

)

);

let stats={

Present:0,

Absent:0,

Leave:0

};

snap.forEach(doc=>{

stats[doc.data().status]++;

});

console.table(stats);

return stats;

};

/* =========================================================
LOW ATTENDANCE STUDENTS
========================================================= */

window.lowAttendanceStudents=

async function(){

const data={};

const snap=

await getDocs(

query(

collection(db,"attendance"),

where("teacherId","==",teacherId)

)

);

snap.forEach(doc=>{

const a=doc.data();

if(!data[a.studentId]){

data[a.studentId]={

name:a.studentName,

present:0,

total:0

};

}

data[a.studentId].total++;

if(a.status==="Present"){

data[a.studentId].present++;

}

});

const low=[];

Object.values(data).forEach(student=>{

const per=Math.round(

(student.present*100)/student.total

);

if(per<75){

low.push({

name:student.name,

percentage:per

});

}

});

console.table(low);

};

/* =========================================================
AUTO BACKUP
========================================================= */

window.autoAttendanceBackup=

async function(){

const snap=

await getDocs(

query(

collection(db,"attendance"),

where(

"teacherId",

"==",

teacherId

)

)

);

const backup=[];

snap.forEach(doc=>{

backup.push({

id:doc.id,

...doc.data()

});

});

localStorage.setItem(

"attendanceBackup",

JSON.stringify(

backup

)

);

console.log(

"Attendance Backup Saved"

);

};

/* =========================================================
RESTORE BACKUP
========================================================= */

window.restoreAttendanceBackup=function(){

const backup=

localStorage.getItem(

"attendanceBackup"

);

if(!backup){

alert("No Backup");

return;

}

console.log(

JSON.parse(backup)

);

};

/* =========================================================
AUTO BACKUP EVERY 5 MINUTES
========================================================= */

setInterval(()=>{

autoAttendanceBackup();

},300000);

/* =========================================================
END OF ATTENDANCE.JS FINAL
========================================================= */