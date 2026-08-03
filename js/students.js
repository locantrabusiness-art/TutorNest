/* =========================================================
STUDENTS.JS
PASTE LOCATION:
js/students.js
========================================================= */


import { auth, db } from "../firebase.js";


import {

onAuthStateChanged

}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {

collection,
query,
where,
getDocs,
addDoc,
doc,
getDoc,
updateDoc,
deleteDoc,
serverTimestamp

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



/* ================= ELEMENTS ================= */


const studentTableBody=

document.getElementById(

"studentTableBody"

);


const totalStudents=

document.getElementById(

"totalStudents"

);


const activeStudents=

document.getElementById(

"activeStudents"

);


const classCount=

document.getElementById(

"classCount"

);


const feePending=

document.getElementById(

"feePending"

);



const searchInput=

document.getElementById(

"studentSearch"

);


const classFilter=

document.getElementById(

"classFilter"

);



const studentModal=

document.getElementById(

"studentModal"

);


const closeModal=

document.getElementById(

"closeModal"

);



const addModal=

document.getElementById(

"addModal"

);


const addStudentBtn=

document.getElementById(

"addStudentBtn"

);


const closeAddModal=

document.getElementById(

"closeAddModal"

);



const saveStudent=

document.getElementById(

"saveStudent"

);



let tutorId="";

let students=[];



/* ================= AUTH ================= */


onAuthStateChanged(auth,async(user)=>{


if(!user){

location.href="tutor-login.html";

return;

}


tutorId=user.uid;


loadStudents();


});



/* ================= LOAD STUDENTS ================= */


async function loadStudents(){


const snap=await getDocs(

query(

collection(db,"students"),

where(

"teacherId",

"==",

tutorId

)

)

);



students=[];


studentTableBody.innerHTML="";



snap.forEach(docSnap=>{


students.push({

id:docSnap.id,

...docSnap.data()

});


});



renderStudents(students);


updateCards();


}



/* ================= RENDER ================= */


function renderStudents(data){


studentTableBody.innerHTML="";



if(data.length===0){


studentTableBody.innerHTML=`

<tr>

<td colspan="7">

No Students Found

</td>

</tr>

`;


return;

}



data.forEach(student=>{


studentTableBody.innerHTML+=`

<tr>


<td>


<img src="${student.photo||'assets/logo/logo.png'}">


</td>



<td>

${student.studentName||"-"}

</td>



<td>

${student.class||"-"}

</td>



<td>

${student.subject||"-"}

</td>



<td>

${student.mode||"-"}

</td>



<td>

${student.fees||"-"}

</td>



<td>


<button

class="actionBtn viewBtn"

onclick="viewStudent('${student.id}')">

View

</button>



<button

class="actionBtn deleteBtn"

onclick="deleteStudent('${student.id}')">

Delete

</button>


</td>



</tr>

`;

});


}
/* =========================================================
STUDENTS.JS PART 2
PASTE AT END OF js/students.js
========================================================= */


/* ================= UPDATE CARDS ================= */


function updateCards(){


totalStudents.innerHTML=

students.length;



let active=0;

let classes=new Set();

let pending=0;



students.forEach(student=>{


if(

student.status==="Active" ||

!student.status

){

active++;

}



if(student.class){

classes.add(student.class);

}



if(

student.feeStatus==="Pending"

){

pending++;

}



});



activeStudents.innerHTML=active;


classCount.innerHTML=classes.size;


feePending.innerHTML=pending;


}





/* ================= SEARCH ================= */


searchInput.addEventListener(

"keyup",

()=>{


filterStudents();


}

);



classFilter.addEventListener(

"change",

()=>{


filterStudents();


}

);



function filterStudents(){


let keyword=

searchInput.value.toLowerCase();



let cls=

classFilter.value;



let filtered=

students.filter(student=>{


let name=

(student.studentName||"")

.toLowerCase();



let matchName=

name.includes(keyword);



let matchClass=

!cls ||

student.class===cls;



return matchName && matchClass;



});



renderStudents(filtered);



}





/* ================= VIEW STUDENT ================= */


window.viewStudent=

async function(id){



const snap=

await getDoc(

doc(

db,

"students",

id

)

);



if(!snap.exists()){


alert("Student Not Found");

return;


}



const student=snap.data();



studentModal.style.display="flex";



document.getElementById(

"studentDetails"

).innerHTML=`

<div class="profileBox">


<img src="${student.photo||'assets/logo/logo.png'}">



<div class="profileInfo">


<h2>

${student.studentName}

</h2>



<p>

Class:

${student.class||"-"}

</p>



<p>

Subjects:

${student.subject||"-"}

</p>



<p>

Parent:

${student.parentName||"-"}

</p>



<p>

Phone:

${student.parentPhone||"-"}

</p>



<p>

Fees:

${student.fees||"-"}

</p>



<p>

Mode:

${student.mode||"-"}

</p>



</div>


</div>



<hr style="margin:20px 0">



<div>


<a href="tel:${student.parentPhone}">

<button>

Call Parent

</button>

</a>



<a href="https://wa.me/91${student.parentPhone}">

<button>

WhatsApp

</button>

</a>


</div>

`;



};




/* ================= CLOSE MODAL ================= */


closeModal.onclick=()=>{


studentModal.style.display="none";


};



window.onclick=(e)=>{


if(e.target===studentModal){


studentModal.style.display="none";


}



if(e.target===addModal){


addModal.style.display="none";


}


};



/* ================= ADD STUDENT MODAL ================= */


addStudentBtn.onclick=()=>{


addModal.style.display="flex";


};



closeAddModal.onclick=()=>{


addModal.style.display="none";


};
/* =========================================================
STUDENTS.JS PART 3
PASTE AT END OF js/students.js
========================================================= */


/* ================= SAVE STUDENT ================= */


saveStudent.onclick=async()=>{


const name=

document.getElementById(

"studentName"

).value;



const studentClass=

document.getElementById(

"studentClass"

).value;



const subject=

document.getElementById(

"studentSubject"

).value;



const parent=

document.getElementById(

"parentName"

).value;



const phone=

document.getElementById(

"parentPhone"

).value;



const fees=

document.getElementById(

"studentFees"

).value;



if(!name || !studentClass){

alert("Name and Class Required");

return;

}



await addDoc(

collection(db,"students"),

{


studentName:name,


class:studentClass,


subject,


parentName:parent,


parentPhone:phone,


fees,


teacherId:tutorId,


status:"Active",


feeStatus:"Pending",


createdAt:serverTimestamp()


}

);



alert("Student Added Successfully");



addModal.style.display="none";



loadStudents();



};





/* ================= DELETE STUDENT ================= */


window.deleteStudent=

async function(id){



if(

!confirm(

"Delete this student?"

)

)return;



await deleteDoc(

doc(

db,

"students",

id

)

);



alert("Student Deleted");



loadStudents();



};





/* ================= EDIT STUDENT ================= */


window.editStudent=

async function(id){



const snap=

await getDoc(

doc(

db,

"students",

id

)

);



if(!snap.exists())return;



const student=snap.data();



const name=

prompt(

"Student Name",

student.studentName

);



if(!name)return;



await updateDoc(

doc(

db,

"students",

id

),

{

studentName:name

}

);



alert("Updated");



loadStudents();



};





/* ================= ATTENDANCE HISTORY ================= */


window.studentAttendance=

function(id){


location.href=

"attendance.html?student="+id;


};





/* ================= WHATSAPP ================= */


window.openWhatsApp=

function(phone){



window.open(

"https://wa.me/91"+phone,

"_blank"

);



};





/* ================= AUTO REFRESH ================= */


setInterval(()=>{


loadStudents();


},60000);



/* =========================================================
END STUDENTS.JS BASIC VERSION
========================================================= */
/* =========================================================
STUDENTS.JS PART 4
ADVANCED PROFILE + ATTENDANCE HISTORY
PASTE AT END OF js/students.js
========================================================= */


/* ================= FULL STUDENT DETAILS ================= */


window.openStudentProfile = async function(id){


const snap = await getDoc(

doc(db,"students",id)

);



if(!snap.exists()){

alert("Student not found");

return;

}



const s=snap.data();



studentModal.style.display="flex";



document.getElementById(

"studentDetails"

).innerHTML=`


<div class="profileBox">


<img src="${s.photo || 'assets/logo/logo.png'}">


<div class="profileInfo">


<h2>${s.studentName}</h2>


<p>
Class : ${s.class || "-"}
</p>


<p>
Subjects : ${s.subject || "-"}
</p>


<p>
Parent : ${s.parentName || "-"}
</p>


<p>
Phone : ${s.parentPhone || "-"}
</p>


<p>
Fees : ${s.fees || "-"}
</p>


<p>
Status : ${s.status || "Active"}
</p>


</div>


</div>


<hr>


<h3>

Attendance Summary

</h3>


<div id="studentAttendanceBox">

Loading...

</div>


`;



loadStudentAttendance(id);


};




/* ================= STUDENT ATTENDANCE ================= */


async function loadStudentAttendance(id){


const box=

document.getElementById(

"studentAttendanceBox"

);



const snap=

await getDocs(

query(

collection(db,"attendance"),

where(

"studentId",

"==",

id

)

)

);



let present=0;

let absent=0;

let leave=0;



snap.forEach(doc=>{


const a=doc.data();



if(a.status==="Present")

present++;


if(a.status==="Absent")

absent++;


if(a.status==="Leave")

leave++;


});



box.innerHTML=`

<div class="cards">


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




/* ================= FEE UPDATE ================= */


window.updateFeeStatus = async function(id){


const status=

prompt(

"Fee Status (Paid/Pending)"

);



if(!status)return;



await updateDoc(

doc(db,"students",id),

{

feeStatus:status

}

);



alert("Fee Updated");


loadStudents();


};





/* ================= ASSIGN TUTOR ================= */


window.assignTutor = async function(id){


const tutor=

prompt(

"Enter Tutor UID"

);



if(!tutor)return;



await updateDoc(

doc(db,"students",id),

{

teacherId:tutor

}

);



alert("Tutor Assigned");


loadStudents();


};





/* ================= EXPORT STUDENT LIST ================= */


window.exportStudentsCSV = function(){


let csv=

"Name,Class,Subject,Parent,Phone,Fees\n";



students.forEach(s=>{


csv+=`

${s.studentName},

${s.class},

${s.subject},

${s.parentName},

${s.parentPhone},

${s.fees}

\n`;



});



const blob=

new Blob(

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

a.download="students.csv";

a.click();



};




/* =========================================================
END STUDENTS.JS ADVANCED
========================================================= */
/* =========================================================
STUDENTS.JS PART 5
ADVANCED FILTER + SORT + PAGINATION
PASTE AT END OF js/students.js
========================================================= */


/* ================= SORT STUDENTS ================= */


window.sortStudents=function(type){


let sorted=[...students];



if(type==="name"){


sorted.sort((a,b)=>

(a.studentName||"")

.localeCompare(

b.studentName||""

)

);


}



if(type==="class"){


sorted.sort((a,b)=>

(a.class||"")

.localeCompare(

b.class||""

)

);


}



renderStudents(sorted);



};




/* ================= FEE FILTER ================= */


window.filterByFee=function(status){


const filtered=

students.filter(student=>{


return student.feeStatus===status;


});



renderStudents(filtered);



};




/* ================= ACTIVE FILTER ================= */


window.filterActiveStudents=function(){


const filtered=

students.filter(student=>{


return (

student.status==="Active"

||

!student.status

);


});



renderStudents(filtered);



};





/* ================= DOWNLOAD PROFILE ================= */


window.downloadStudentProfile=function(id){


const student=

students.find(

s=>s.id===id

);



if(!student)return;



const text=

`

Student Profile

----------------

Name:

${student.studentName}


Class:

${student.class}


Subject:

${student.subject}


Parent:

${student.parentName}


Phone:

${student.parentPhone}


Fees:

${student.fees}


`;



const blob=

new Blob(

[text],

{

type:"text/plain"

}

);



const url=

URL.createObjectURL(blob);



const a=

document.createElement("a");



a.href=url;

a.download=

student.studentName+

"-profile.txt";



a.click();



};





/* ================= BULK DELETE ================= */


window.deleteSelectedStudents=

async function(){


const checkboxes=

document.querySelectorAll(

".studentCheck:checked"

);



if(checkboxes.length===0){


alert("Select Students");


return;


}



if(!confirm("Delete Selected Students?"))

return;



for(const box of checkboxes){


await deleteDoc(

doc(

db,

"students",

box.value

)

);


}



alert("Deleted");


loadStudents();



};





/* ================= REFRESH BUTTON ================= */


window.refreshStudents=function(){


loadStudents();


};





/* =========================================================
END STUDENTS.JS PART 5
========================================================= */
/* =========================================================
STUDENTS.JS PART 6
ADVANCED SEARCH + PROFILE ACTIONS
PASTE AT END OF js/students.js
========================================================= */


/* ================= ADVANCED SEARCH ================= */


window.advancedStudentSearch=function(){


const name=

document.getElementById(

"studentSearch"

).value.toLowerCase();



const cls=

document.getElementById(

"classFilter"

).value;



const filtered=

students.filter(student=>{


let nameMatch=

(student.studentName||"")

.toLowerCase()

.includes(name);



let classMatch=

!cls ||

student.class===cls;



return nameMatch && classMatch;



});



renderStudents(filtered);


};





/* ================= SHOW ONLY PENDING FEES ================= */


window.showPendingFees=function(){


const filtered=

students.filter(student=>{


return student.feeStatus==="Pending";


});



renderStudents(filtered);



};





/* ================= SHOW PAID STUDENTS ================= */


window.showPaidStudents=function(){


const filtered=

students.filter(student=>{


return student.feeStatus==="Paid";


});



renderStudents(filtered);



};





/* ================= STUDENT COUNT BY CLASS ================= */


window.classWiseCount=function(){


const result={};



students.forEach(student=>{


const cls=

student.class||"Unknown";



if(!result[cls]){


result[cls]=0;


}


result[cls]++;


});



console.table(result);



return result;



};





/* ================= SEND WHATSAPP MESSAGE ================= */


window.sendStudentMessage=function(phone){


const message=

encodeURIComponent(

"Hello, this is TutorNest regarding your child's classes."

);



window.open(

`https://wa.me/91${phone}?text=${message}`,

"_blank"

);


};





/* ================= DUPLICATE CHECK ================= */


function checkDuplicateStudent(name,phone){


return students.some(student=>{


return (

student.studentName===name

&&

student.parentPhone===phone

);


});


}






/* ================= SAVE WITH DUPLICATE CHECK ================= */


const oldSaveStudent=saveStudent.onclick;



saveStudent.onclick=async()=>{


const name=

document.getElementById(

"studentName"

).value;



const phone=

document.getElementById(

"parentPhone"

).value;



if(checkDuplicateStudent(name,phone)){


alert("Student already exists");


return;


}



await oldSaveStudent();



};





/* =========================================================
END STUDENTS.JS PART 6
========================================================= */
/* =========================================================
STUDENTS.JS PART 7
ATTENDANCE + HOMEWORK + NOTES HISTORY
PASTE AT END OF js/students.js
========================================================= */


/* ================= STUDENT HOMEWORK HISTORY ================= */


window.loadStudentHomework = async function(id){


const snap = await getDocs(

query(

collection(db,"homework"),

where(

"studentId",

"==",

id

)

)

);



let html="";



if(snap.empty){


html="No Homework Found";


}

else{


snap.forEach(doc=>{


const h=doc.data();



html+=`

<div style="
padding:15px;
background:#f8f9fa;
margin-top:10px;
border-radius:10px;
">


<b>

${h.title||"Homework"}

</b>


<p>

${h.homework||""}

</p>


<small>

${h.date||""}

</small>


</div>

`;



});


}



return html;


};





/* ================= STUDENT NOTES HISTORY ================= */


window.loadStudentNotes = async function(id){


const snap = await getDocs(

query(

collection(db,"notes"),

where(

"studentId",

"==",

id

)

)

);



let html="";



if(snap.empty){


return "No Notes Found";


}



snap.forEach(doc=>{


const n=doc.data();



html+=`

<div style="
padding:15px;
background:#f8f9fa;
margin-top:10px;
border-radius:10px;
">


<p>

${n.notes}

</p>


</div>

`;



});



return html;


};





/* ================= UPDATE STUDENT STATUS ================= */


window.updateStudentStatus = async function(id){


const status=

prompt(

"Status (Active/Inactive)"

);



if(!status)return;



await updateDoc(

doc(

db,

"students",

id

),

{

status

}

);



alert("Status Updated");


loadStudents();



};





/* ================= SEARCH BY PHONE ================= */


window.searchByPhone=function(phone){


const result=

students.filter(student=>{


return student.parentPhone

&&

student.parentPhone.includes(phone);


});



renderStudents(result);



};





/* ================= CLASS SUMMARY ================= */


window.classSummary=function(){


const summary={};



students.forEach(student=>{


const cls=

student.class||"Unknown";



if(!summary[cls]){


summary[cls]=0;


}



summary[cls]++;



});



return summary;


};





/* ================= END ================= */
/* =========================================================
STUDENTS.JS PART 8
FINAL UI FUNCTIONS + SECURITY CHECKS
PASTE AT END OF js/students.js
========================================================= */


/* ================= PROFILE PHOTO PREVIEW ================= */


window.changeStudentPhoto=function(input){


const file=input.files[0];


if(!file)return;



const reader=new FileReader();



reader.onload=function(e){


const img=

document.getElementById(

"studentPreviewPhoto"

);



if(img){

img.src=e.target.result;

}


};



reader.readAsDataURL(file);



};





/* ================= VALIDATE PHONE ================= */


function validatePhone(phone){


return /^[0-9]{10}$/.test(phone);


}





/* ================= UPDATE PHONE ================= */


window.updateStudentPhone=async function(id){


const phone=

prompt(

"Enter New Phone"

);



if(!phone)return;



if(!validatePhone(phone)){


alert("Invalid Phone Number");


return;


}



await updateDoc(

doc(

db,

"students",

id

),

{

parentPhone:phone

}

);



alert("Phone Updated");


loadStudents();



};





/* ================= DUPLICATE PHONE SEARCH ================= */


window.findStudentByPhone=async function(phone){


const snap=

await getDocs(

query(

collection(db,"students"),

where(

"parentPhone",

"==",

phone

)

)

);



let result=[];



snap.forEach(doc=>{


result.push({

id:doc.id,

...doc.data()

});


});



return result;


};





/* ================= STUDENT ACTIVE TOGGLE ================= */


window.toggleStudentStatus=async function(id,status){


await updateDoc(

doc(

db,

"students",

id

),

{

status

}

);



loadStudents();


};





/* ================= CLEAR SEARCH ================= */


window.clearStudentSearch=function(){


searchInput.value="";

classFilter.value="";


renderStudents(students);



};





/* ================= REFRESH DATA ================= */


window.refreshStudentData=async function(){


await loadStudents();


alert(

"Student Data Updated"

);


};





/* ================= INITIAL LOAD ================= */


setTimeout(()=>{


loadStudents();


},1000);


/* =========================================================
END STUDENTS.JS
========================================================= */
/* =========================================================
STUDENTS.JS PART 9
ADVANCED STUDENT MANAGEMENT
PASTE AT END OF js/students.js
========================================================= */


/* ================= STUDENT DETAILS EXPORT ================= */


window.exportStudentProfile=function(id){


const student=

students.find(

s=>s.id===id

);



if(!student)return;



const profile=

`

TUTOR NEST

STUDENT PROFILE

----------------------

Name:
${student.studentName}

Class:
${student.class}

Subject:
${student.subject}

Parent:
${student.parentName}

Phone:
${student.parentPhone}

Fees:
${student.fees}

Status:
${student.status}

`;



const blob=

new Blob(

[profile],

{

type:"text/plain"

}

);



const url=

URL.createObjectURL(blob);



const a=

document.createElement("a");



a.href=url;

a.download=

student.studentName+

"-profile.txt";



a.click();



};





/* ================= STUDENT NOTES ================= */


window.addStudentNote=async function(id){


const note=

prompt(

"Enter Note"

);



if(!note)return;



await addDoc(

collection(db,"notes"),

{


studentId:id,


teacherId,


notes:note,


createdAt:serverTimestamp()


}

);



alert("Note Added");


};





/* ================= STUDENT SEARCH LIVE ================= */


if(searchInput){


searchInput.addEventListener(

"input",

()=>{


const value=

searchInput.value

.toLowerCase();



const result=

students.filter(student=>{


return (

student.studentName

||""

)

.toLowerCase()

.includes(value);



});



renderStudents(result);



}

);


}





/* ================= STUDENT COUNT UPDATE ================= */


function refreshCounters(){


let paid=0;

let pending=0;



students.forEach(student=>{


if(student.feeStatus==="Paid")

paid++;


else

pending++;


});



feePending.innerHTML=pending;



}





/* ================= AUTO UPDATE ================= */


setInterval(()=>{


refreshCounters();


},30000);



/* =========================================================
END STUDENTS.JS PART 9
========================================================= */