// ======================================================
// TUTORNEST ADMIN CRM
// PART 1
// Replace FROM LINE 1 until BEFORE loadBookings()
// ======================================================

import { auth, db } from "../firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    query,
    orderBy,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =========================================
// APP STATE
// =========================================

const state={

    bookings:[],

    teachers:[],

    selectedBooking:null,

    editingBooking:null

};


// =========================================
// DOM HELPERS
// =========================================

const $=id=>document.getElementById(id);


// =========================================
// DASHBOARD
// =========================================

const totalEnquiries=$("totalEnquiries");
const pendingCount=$("pendingCount");
const assignedCount=$("assignedCount");
const admissionCount=$("admissionCount");
const teacherCount=$("teacherCount");
const todayDemo=$("todayDemo");
const feesCollected=$("feesCollected");
const revenue=$("revenue");


// =========================================
// TABLES
// =========================================

const bookingTable=$("bookingTable");
const teacherTable=$("teacherTable");


// =========================================
// FILTERS
// =========================================

const searchInput=$("searchInput");
const statusFilter=$("statusFilter");


// =========================================
// ENQUIRY MODAL
// =========================================

const enquiryModal=$("enquiryModal");

const addEnquiryBtn=$("addEnquiryBtn");

const closeEnquiry=$("closeEnquiry");

const saveEnquiry=$("saveEnquiry");

const studentName=$("studentName");
const studentPhone=$("studentPhone");
const parentName=$("parentName");
const parentPhone=$("parentPhone");
const studentClass=$("studentClass");
const studentSubject=$("studentSubject");
const studentArea=$("studentArea");
const studentMode=$("studentMode");
const studentRemarks=$("studentRemarks");


// =========================================
// TEACHER MODAL
// =========================================

const teacherModal=$("teacherModal");

const addTeacherBtn=$("addTeacherBtn");

const saveTeacher=$("saveTeacher");

const teacherName=$("teacherName");
const teacherPhone=$("teacherPhone");
const teacherSubjects=$("teacherSubjects");
const teacherAreas=$("teacherAreas");


// =========================================
// ASSIGN MODAL
// =========================================

const assignModal=$("assignModal");

const teacherSelect=$("teacherSelect");

const demoDate=$("demoDate");

const demoTime=$("demoTime");

const remarks=$("remarks");

const saveAssign=$("saveAssign");

const closeAssign=$("closeAssign");


// =========================================
// DETAILS MODALS
// =========================================

const studentModal=$("studentModal");
const studentDetails=$("studentDetails");
const closeStudentModal=$("closeStudentModal");

const demoModal=$("demoModal");
const demoDetails=$("demoDetails");
const closeDemoModal=$("closeDemoModal");


// =========================================
// SIDEBAR
// =========================================

document
.querySelectorAll("#sidebarMenu li")
.forEach(item=>{

item.onclick=()=>{

document
.querySelectorAll("#sidebarMenu li")
.forEach(x=>x.classList.remove("active"));

item.classList.add("active");

};

});



const logoutBtn = document.querySelector(".logoutBtn");

if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await signOut(auth);
        location.replace("admin-login.html");
    };
}
// =========================================
// AUTH
// =========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.replace("admin-login.html");
        return;

    }

    try {

        const snap = await getDoc(doc(db, "admins", user.uid));

        if (!snap.exists()) {

            await signOut(auth);
            location.replace("admin-login.html");
            return;

        }

        await initializeDashboard();

    } catch (err) {

        console.error(err);
        location.replace("admin-login.html");

    }

});


// =========================================
// INITIALIZE
// =========================================

async function initializeDashboard(){

await Promise.all([

loadTeachers(),

loadBookings()

]);

searchInput.oninput=renderBookings;

statusFilter.onchange=renderBookings;

setInterval(refreshDashboard,60000);

}


// =========================================
// REFRESH
// =========================================

async function refreshDashboard(){

await loadTeachers();

await loadBookings();

}
// ======================================================
// TUTORNEST ADMIN CRM
// PART 2
// Replace COMPLETE loadBookings(), updateDashboard()
// and renderBookings() functions
// ======================================================

async function loadBookings(){

    try{

        bookingTable.innerHTML=`
        <tr>
            <td colspan="10">Loading enquiries...</td>
        </tr>`;

        const q=query(
            collection(db,"demoBookings"),
            orderBy("createdAt","desc")
        );

        const snap=await getDocs(q);

        state.bookings=[];

        snap.forEach(docSnap=>{

            state.bookings.push({

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
            <td colspan="10">
                Unable to load enquiries.
            </td>
        </tr>`;

    }

}



// =========================================
// DASHBOARD
// =========================================

function updateDashboard(){

    totalEnquiries.textContent=state.bookings.length;

    pendingCount.textContent=state.bookings.filter(x=>

        (x.status||"Pending")==="Pending"

    ).length;

    assignedCount.textContent=state.bookings.filter(x=>

        x.status==="Assigned"

    ).length;

    admissionCount.textContent=state.bookings.filter(x=>

        x.status==="Admitted"

    ).length;

    teacherCount.textContent=state.teachers.length;

    const today=new Date().toISOString().split("T")[0];

    todayDemo.textContent=state.bookings.filter(x=>

        x.demoDate===today

    ).length;

    feesCollected.textContent="₹0";

    revenue.textContent="₹0";

}



// =========================================
// RENDER BOOKINGS
// =========================================

function renderBookings(){

    bookingTable.innerHTML="";

    const keyword=searchInput.value.toLowerCase().trim();

    const status=statusFilter.value;

    const data=state.bookings.filter(b=>{

        const search=

            (b.studentName||"").toLowerCase().includes(keyword) ||

            (b.phone||"").toLowerCase().includes(keyword) ||

            (b.area||"").toLowerCase().includes(keyword) ||

            (b.subject||"").toLowerCase().includes(keyword);

        const filter=

            status==="" ||

            (b.status||"Pending")===status;

        return search && filter;

    });



    if(data.length===0){

        bookingTable.innerHTML=`
        <tr>
            <td colspan="10">
                No enquiries found.
            </td>
        </tr>`;

        return;

    }



    data.forEach(b=>{

        bookingTable.innerHTML+=`

<tr>

<td>${b.studentName||"-"}</td>

<td>${b.phone||"-"}</td>

<td>${b.class||"-"}</td>

<td>${b.subject||"-"}</td>

<td>${b.area||"-"}</td>

<td>${b.requestedTutorName||"-"}</td>

<td>${b.assignedTeacher||"-"}</td>

<td>

<span class="${getStatusClass(b.status)}">

${b.status||"Pending"}

</span>

</td>

<td>

${b.demoDate||"-"}

<br>

<small>${b.demoTime||""}</small>

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
// ======================================================
// TUTORNEST ADMIN CRM
// PART 3
// NEW ENQUIRY + EDIT BOOKING + DELETE BOOKING
// Paste BELOW renderBookings()
// ======================================================


// =========================================
// OPEN NEW ENQUIRY
// =========================================

if(addEnquiryBtn){

addEnquiryBtn.onclick=()=>{

state.editingBooking=null;

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



// =========================================
// CLOSE MODAL
// =========================================

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



// =========================================
// SAVE ENQUIRY
// =========================================

if(saveEnquiry)
    saveEnquiry.onclick = async()=>{

if(studentName.value.trim()===""){

alert("Student Name Required");

return;

}

if(studentPhone.value.trim()===""){

alert("Phone Number Required");

return;

}

const booking={

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

if(state.editingBooking){

await updateDoc(

doc(db,"demoBookings",state.editingBooking),

booking

);

alert("Enquiry Updated");

}else{

await addDoc(

collection(db,"demoBookings"),

{

...booking,

status:"Pending",

assignedTeacher:"",

teacherId:"",

demoDate:"",

demoTime:"",

createdAt:serverTimestamp()

}

);

alert("Enquiry Added");

}

state.editingBooking=null;

enquiryModal.classList.remove("show");

await loadBookings();

}catch(err){

console.error(err);

alert("Unable to Save Enquiry");

}

};



// =========================================
// EDIT BOOKING
// =========================================

window.editBooking=function(id){

const booking=state.bookings.find(

x=>x.id===id

);

if(!booking) return;

state.editingBooking=id;

studentName.value=booking.studentName||"";
studentPhone.value=booking.phone||"";
parentName.value=booking.parentName||"";
parentPhone.value=booking.parentPhone||"";
studentClass.value=booking.class||"";
studentSubject.value=booking.subject||"";
studentArea.value=booking.area||"";
studentMode.value=booking.mode||"Home Tuition";
studentRemarks.value=booking.remarks||"";

saveEnquiry.textContent="Update Enquiry";

enquiryModal.classList.add("show");

};



// =========================================
// DELETE BOOKING
// =========================================

window.deleteBooking=async(id)=>{

if(!confirm("Delete this enquiry?")) return;

try{

await deleteDoc(

doc(db,"demoBookings",id)

);

await loadBookings();

alert("Enquiry Deleted");

}catch(err){

console.error(err);

alert("Unable to Delete");

}

};



// =========================================
// VIEW STUDENT
// =========================================

window.viewStudent=function(id){

const booking=state.bookings.find(

x=>x.id===id

);

if(!booking) return;

studentDetails.innerHTML=`

<h3>${booking.studentName}</h3>

<hr>

<p><b>Phone :</b> ${booking.phone||"-"}</p>

<p><b>Parent :</b> ${booking.parentName||"-"}</p>

<p><b>Parent Phone :</b> ${booking.parentPhone||"-"}</p>

<p><b>Class :</b> ${booking.class||"-"}</p>

<p><b>Subject :</b> ${booking.subject||"-"}</p>

<p><b>Area :</b> ${booking.area||"-"}</p>

<p><b>Mode :</b> ${booking.mode||"-"}</p>

<p><b>Status :</b> ${booking.status||"-"}</p>

<p><b>Remarks :</b> ${booking.remarks||"-"}</p>

`;

studentModal.classList.add("show");

};



// =========================================
// CLOSE STUDENT MODAL
// =========================================

if(closeStudentModal){

closeStudentModal.onclick=()=>{

studentModal.classList.remove("show");

};

}
// ======================================================
// TUTORNEST ADMIN CRM
// PART 4
// TEACHER CRUD + ASSIGNMENT SYSTEM
// Replace your Teacher Section
// ======================================================


// =========================================
// LOAD TEACHERS
// =========================================

async function loadTeachers(){

try{

const snap=await getDocs(

query(

collection(db,"teachers"),

orderBy("name")

)

);

state.teachers=[];

snap.forEach(docSnap=>{

state.teachers.push({

id:docSnap.id,

...docSnap.data()

});

});

renderTeachers();

updateDashboard();

}catch(err){

console.error(err);

}

}



// =========================================
// RENDER TEACHERS
// =========================================

function renderTeachers(){

teacherTable.innerHTML="";

if(state.teachers.length===0){

teacherTable.innerHTML=`

<tr>

<td colspan="7">

No Teachers Found

</td>

</tr>

`;

return;

}

state.teachers.forEach(t=>{

const totalStudents=state.bookings.filter(x=>

x.teacherId===t.id &&

x.status==="Admitted"

).length;

teacherTable.innerHTML+=`

<tr>

<td>${t.name||"-"}</td>

<td>${t.phone||"-"}</td>

<td>${(t.subjects||[]).join(", ")}</td>

<td>${(t.areas||[]).join(", ")}</td>

<td>

${t.available===false

?'<span class="badge assigned">Busy</span>'

:'<span class="badge admitted">Available</span>'}

</td>

<td>

${totalStudents}

</td>

<td>

<button

class="assign"

onclick="toggleTeacher('${t.id}')">

${t.available===false

?"Available"

:"Busy"}

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





// =========================================
// OPEN ADD TEACHER
// =========================================

if(addTeacherBtn){

addTeacherBtn.onclick=()=>{

teacherName.value="";
teacherPhone.value="";
teacherSubjects.value="";
teacherAreas.value="";

teacherModal.classList.add("show");

};

}



// =========================================
// SAVE TEACHER
// =========================================

if(saveTeacher){

saveTeacher.onclick = async()=>{

if(teacherName.value.trim()===""){

alert("Teacher Name Required");

return;

}

try{

await addDoc(

collection(db,"teachers"),

{

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

}

);

teacherModal.classList.remove("show");

await loadTeachers();

alert("Teacher Added Successfully");

}catch(err){

console.error(err);

alert("Unable to Save Teacher");

}

};
}



// =========================================
// DELETE TEACHER
// =========================================

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



// =========================================
// TOGGLE AVAILABILITY
// =========================================

window.toggleTeacher=async(id)=>{

const teacher=state.teachers.find(

x=>x.id===id

);

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



// =========================================
// OPEN ASSIGN MODAL
// =========================================

window.assignTeacher=function(id){

state.selectedBooking=id;

teacherSelect.innerHTML=

`<option value="">Select Teacher</option>`;

state.teachers

.filter(x=>x.available!==false)

.forEach(t=>{

teacherSelect.innerHTML+=`

<option value="${t.id}">

${t.name}

</option>

`;

});

assignModal.classList.add("show");

};



// =========================================
// CLOSE ASSIGN
// =========================================

if(closeAssign){
    closeAssign.onclick=()=>{
        assignModal.classList.remove("show");
    };
}



// =========================================
// SAVE ASSIGNMENT
// =========================================

saveAssign.onclick=async()=>{

if(!state.selectedBooking){

alert("Booking Not Selected");

return;

}

if(teacherSelect.value===""){

alert("Select Teacher");

return;

}

const teacher=state.teachers.find(

x=>x.id===teacherSelect.value

);

try{

await updateDoc(

doc(db,"demoBookings",state.selectedBooking),

{

teacherId:teacher.id,

assignedTeacher:teacher.name,

teacherPhone:teacher.phone,

demoDate:demoDate.value,

demoTime:demoTime.value,

remarks:remarks.value,

status:"Assigned",

assignedAt:serverTimestamp()

}

);

assignModal.classList.remove("show");

teacherSelect.value="";
demoDate.value="";
demoTime.value="";
remarks.value="";

state.selectedBooking=null;

await loadBookings();

alert("Teacher Assigned Successfully");

}catch(err){

console.error(err);

alert("Assignment Failed");

}

};
// ======================================================
// TUTORNEST ADMIN CRM
// PART 5
// DEMO DETAILS + PERMANENT ADMISSION +
// CALL + WHATSAPP + REJECT
// ======================================================


// =========================================
// STATUS BADGES
// =========================================

function getStatusClass(status){

switch(status){

case "Pending":
return "badge pending";

case "Assigned":
return "badge assigned";

case "Demo Scheduled":
return "badge demo";

case "Completed":
return "badge completed";

case "Admitted":
return "badge admitted";

case "Rejected":
return "badge rejected";

default:
return "badge pending";

}

}



// =========================================
// CALL
// =========================================

window.callStudent=function(phone){

if(!phone){

alert("Phone Number Not Available");

return;

}

window.location.href=`tel:${phone}`;

};



// =========================================
// WHATSAPP
// =========================================

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



// =========================================
// VIEW DEMO
// =========================================

window.viewDemo=function(id){

const booking=state.bookings.find(

x=>x.id===id

);

if(!booking) return;

demoDetails.innerHTML=`

<h3>${booking.studentName}</h3>

<hr>

<p><b>Assigned Teacher :</b>

${booking.assignedTeacher||"-"}

</p>

<p><b>Teacher Phone :</b>

${booking.teacherPhone||"-"}

</p>

<p><b>Demo Date :</b>

${booking.demoDate||"-"}

</p>

<p><b>Demo Time :</b>

${booking.demoTime||"-"}

</p>

<p><b>Status :</b>

${booking.status||"-"}

</p>

<p><b>Remarks :</b>

${booking.remarks||"-"}

</p>

<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">

<button
class="assign"
onclick="completeDemo('${booking.id}')">

Complete Demo

</button>

<button
class="call"
onclick="markAdmitted('${booking.id}')">

Make Permanent

</button>

<button
class="delete"
onclick="markRejected('${booking.id}')">

Reject

</button>

</div>

`;

demoModal.classList.add("show");

};



// =========================================
// CLOSE DEMO
// =========================================

if(closeDemoModal){

closeDemoModal.onclick=()=>{

demoModal.classList.remove("show");

};

}



// =========================================
// COMPLETE DEMO
// =========================================

window.completeDemo=async(id)=>{

try{

await updateDoc(

doc(db,"demoBookings",id),

{

status:"Completed",

completedAt:serverTimestamp()

}

);

await loadBookings();

demoModal.classList.remove("show");

alert("Demo Completed");

}catch(err){

console.error(err);

alert("Unable To Complete Demo");

}

};




// =========================================
// PERMANENT ADMISSION
// =========================================

window.markAdmitted=async(id)=>{

if(!confirm(

"Convert this student into Permanent Admission?"

))

return;

const booking=state.bookings.find(

x=>x.id===id

);

if(!booking) return;

try{

await updateDoc(

doc(db,"demoBookings",id),

{

status:"Admitted",

admissionDate:serverTimestamp()

}

);

// Create permanent student record

await addDoc(

collection(db,"students"),

{

bookingId:id,

studentName:booking.studentName,

phone:booking.phone,

parentName:booking.parentName,

parentPhone:booking.parentPhone,

teacherId:booking.teacherId,

teacherName:booking.assignedTeacher,

class:booking.class,

subject:booking.subject,

area:booking.area,

joinedAt:serverTimestamp(),

status:"Active"

}

);

await loadBookings();

demoModal.classList.remove("show");

alert("Student Successfully Admitted");

}catch(err){

console.error(err);

alert("Admission Failed");

}

};




// =========================================
// REJECT BOOKING
// =========================================

window.markRejected=async(id)=>{

if(!confirm(

"Reject this enquiry?"

))

return;

try{

await updateDoc(

doc(db,"demoBookings",id),

{

status:"Rejected",

rejectedAt:serverTimestamp()

}

);

await loadBookings();

demoModal.classList.remove("show");

}catch(err){

console.error(err);

alert("Unable To Reject");

}

};
// ======================================================
// TUTORNEST ADMIN CRM
// PART 6 (FINAL)
// FEE COLLECTION + NOTIFICATIONS + CLEANUP
// Paste at the END of admin-dashboard-v2.js
// ======================================================


// =========================================
// FEE COLLECTION
// =========================================

window.collectFee=async(studentId)=>{

const amount=prompt("Enter Fee Amount");

if(!amount) return;

const month=prompt("Enter Month");

if(!month) return;

const mode=prompt("Payment Mode (Cash / UPI / Bank)");

if(!mode) return;

try{

await addDoc(

collection(db,"fees"),

{

studentId,

amount:Number(amount),

month,

mode,

status:"Paid",

createdAt:serverTimestamp()

}

);

alert("Fee Collected Successfully");

}catch(err){

console.error(err);

alert("Unable to Collect Fee");

}

};



// =========================================
// SEND NOTIFICATION
// =========================================

async function sendNotification(

userId,

title,

message

){

try{

await addDoc(

collection(db,"notifications"),

{

userId,

title,

message,

read:false,

createdAt:serverTimestamp()

}

);

}catch(err){

console.error(err);

}

}



// =========================================
// ASSIGN NOTIFICATION
// =========================================

async function notifyTeacher(

teacherId,

studentName

){

await sendNotification(

teacherId,

"New Demo Assigned",

`${studentName} has been assigned to you.`

);

}



// =========================================
// PERMANENT NOTIFICATION
// =========================================

async function notifyPermanent(

teacherId,

studentName

){

await sendNotification(

teacherId,

"Permanent Student",

`${studentName} is now your permanent student.`

);

}



// =========================================
// CLOSE ALL MODALS
// =========================================

function closeAllModals(){

[

teacherModal,

assignModal,

studentModal,

demoModal,

enquiryModal

].forEach(modal=>{

if(modal){

modal.classList.remove("show");

}

});

}



// =========================================
// ESC KEY
// =========================================

document.addEventListener(

"keydown",

e=>{

if(e.key==="Escape"){

closeAllModals();

}

}

);



// =========================================
// OUTSIDE CLICK
// =========================================

window.onclick=e=>{

[

teacherModal,

assignModal,

studentModal,

demoModal,

enquiryModal

].forEach(modal=>{

if(e.target===modal){

modal.classList.remove("show");

}

});

};



// =========================================
// AUTO REFRESH
// =========================================

setInterval(async()=>{

await refreshDashboard();

},60000);



// =========================================
// NETWORK
// =========================================

window.addEventListener(

"online",

()=>{

refreshDashboard();

}

);

window.addEventListener(

"offline",

()=>{

console.warn(

"Internet Connection Lost"

);

}

);



// =========================================
// GLOBAL FUNCTIONS
// =========================================

window.refreshDashboard=refreshDashboard;
window.renderBookings=renderBookings;
window.renderTeachers=renderTeachers;
window.loadBookings=loadBookings;
window.loadTeachers=loadTeachers;



// =========================================
// RESET FILTERS
// =========================================

if(searchInput){

searchInput.value="";

}

if(statusFilter){

statusFilter.value="";

}



// =========================================
// INITIALIZE MODALS
// =========================================

closeAllModals();



// =========================================
// READY
// =========================================

console.log(

"===================================="

);

console.log(

"TutorNest CRM Loaded Successfully"

);

console.log(

"Dashboard Ready"

);

console.log(

"Teacher Module Ready"

);

console.log(

"Booking Module Ready"

);

console.log(

"Assignment Module Ready"

);

console.log(

"Notification Module Ready"

);

console.log(

"Fee Collection Ready"

);

console.log(

"===================================="

);
}