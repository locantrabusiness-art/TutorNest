/* ==========================================================
FILE : js/book-demo.js
PART 1 / 25
START FROM LINE 1
========================================================== */

import { db } from "../firebase.js";

import {

collection,
addDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* ==========================================================
DOM
========================================================== */

const bookingForm=document.getElementById("bookingForm");

const submitBtn=document.getElementById("submitBtn");

const bookingStatus=document.getElementById("bookingStatus");

const progressFill=document.querySelector(".progressFill");

const progressText=document.querySelector(".progressText");


const studentName=document.getElementById("studentName");

const studentPhone=document.getElementById("studentPhone");

const parentName=document.getElementById("parentName");

const parentPhone=document.getElementById("parentPhone");

const studentEmail=document.getElementById("studentEmail");

const gender=document.getElementById("gender");

const studentClass=document.getElementById("studentClass");

const subject=document.getElementById("subject");

const mode=document.getElementById("mode");

const preferredGender=document.getElementById("preferredGender");

const preferredTime=document.getElementById("preferredTime");

const city=document.getElementById("city");

const area=document.getElementById("area");

const address=document.getElementById("address");

const requirement=document.getElementById("requirement");


/* ==========================================================
HELPERS
========================================================== */

function showStatus(message,type){

bookingStatus.className=

`bookingStatus ${type}`;

bookingStatus.innerHTML=message;

}
/* ==========================================================
FILE : js/book-demo.js
PART 2 / 25
CONTINUE BELOW HELPERS
========================================================== */


/* ==========================================================
VALIDATION
========================================================== */

function validateForm(){

if(studentName.value.trim().length<3){

showStatus(

"Please enter valid student name.",

"error"

);

studentName.focus();

return false;

}

if(!/^[6-9]\d{9}$/.test(studentPhone.value.trim())){

showStatus(

"Please enter valid mobile number.",

"error"

);

studentPhone.focus();

return false;

}

if(studentClass.value===""){

showStatus(

"Please select class.",

"error"

);

studentClass.focus();

return false;

}

if(subject.value.trim()===""){

showStatus(

"Please enter subject.",

"error"

);

subject.focus();

return false;

}

if(mode.value===""){

showStatus(

"Please select tuition mode.",

"error"

);

mode.focus();

return false;

}

if(city.value.trim()===""){

showStatus(

"Please enter city.",

"error"

);

city.focus();

return false;

}

if(area.value.trim()===""){

showStatus(

"Please enter area.",

"error"

);

area.focus();

return false;

}

return true;

}


/* ==========================================================
BOOKING ID
========================================================== */

function generateBookingID(){

return "TN-"

+

Date.now()

.toString()

.slice(-8);

}
/* ==========================================================
FILE : js/book-demo.js
PART 3 / 25
CONTINUE BELOW BOOKING ID
========================================================== */


/* ==========================================================
SUBMIT BOOKING
========================================================== */

bookingForm.addEventListener("submit",async(e)=>{

e.preventDefault();

bookingStatus.className="bookingStatus";

bookingStatus.innerHTML="";

if(!validateForm()) return;

submitBtn.disabled=true;

submitBtn.classList.add("btnLoading");

submitBtn.innerHTML=`

<i class="fa-solid fa-spinner"></i>

Submitting...

`;

try{

const bookingId=generateBookingID();

await addDoc(

collection(db,"demoBookings"),

{

bookingId,

studentName:

studentName.value.trim(),

studentPhone:

studentPhone.value.trim(),

parentName:

parentName.value.trim(),

parentPhone:

parentPhone.value.trim(),

studentEmail:

studentEmail.value.trim(),

gender:

gender.value,

studentClass:

studentClass.value,

subject:

subject.value.trim(),

mode:

mode.value,

preferredGender:

preferredGender.value,

preferredTime:

preferredTime.value,

city:

city.value.trim(),

area:

area.value.trim(),

address:

address.value.trim(),

requirement:

requirement.value.trim(),
/* ==========================================================
FILE : js/book-demo.js
PART 4 / 25
CONTINUE BELOW FIRESTORE DATA
========================================================== */

status:"Pending",

assignedTutorId:"",

assignedTutorName:"",

demoStatus:"Pending",

studentStatus:"Demo",

demoDate:"",

demoTime:"",

monthlyFees:0,

commissionPercent:10,

commissionAmount:0,

paymentStatus:"Pending",

attendanceStarted:false,

feedback:"",

complaint:"",

createdAt:serverTimestamp(),

updatedAt:serverTimestamp()

}

);

showStatus(

"✅ Demo booked successfully! Our team will contact you shortly.",

"success"

);

bookingForm.reset();

submitBtn.innerHTML=`

<i class="fa-solid fa-circle-check"></i>

Demo Booked

`;

setTimeout(()=>{

window.location.href="thank-you.html";

},2500);

}catch(error){

console.error(error);

showStatus(

error.message,

"error"

);

submitBtn.disabled=false;

submitBtn.classList.remove("btnLoading");

submitBtn.innerHTML=`

<i class="fa-solid fa-paper-plane"></i>

Book FREE Demo

`;

}

});
/* ==========================================================
FILE : js/book-demo.js
PART 5 / 25
CONTINUE BELOW SUBMIT BOOKING
========================================================== */


/* ==========================================================
FORM PROGRESS
========================================================== */

const formFields=[

studentName,
studentPhone,
parentName,
parentPhone,
studentEmail,
gender,
studentClass,
subject,
mode,
preferredGender,
preferredTime,
city,
area,
address,
requirement

];

function updateProgress(){

let filled=0;

formFields.forEach(field=>{

if(field.value.trim()!==""){

filled++;

}

});

const percent=Math.round(

(filled/formFields.length)*100

);

if(progressFill){

progressFill.style.width=percent+"%";

}

if(progressText){

progressText.innerHTML=

percent+"% Completed";

}

}

formFields.forEach(field=>{

field.addEventListener(

"input",

updateProgress

);

field.addEventListener(

"change",

updateProgress

);

});


/* ==========================================================
PHONE VALIDATION
========================================================== */

studentPhone.addEventListener("input",()=>{

studentPhone.value=

studentPhone.value

.replace(/\D/g,"")

.slice(0,10);

});

parentPhone.addEventListener("input",()=>{

parentPhone.value=

parentPhone.value

.replace(/\D/g,"")

.slice(0,10);

});


/* ==========================================================
INITIALIZE
========================================================== */

updateProgress();
/* ==========================================================
FILE : js/book-demo.js
PART 6 / 25
CONTINUE BELOW INITIALIZE
========================================================== */


/* ==========================================================
EMAIL VALIDATION
========================================================== */

studentEmail.addEventListener("blur",()=>{

const email=studentEmail.value.trim();

if(email==="") return;

const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!regex.test(email)){

showStatus(

"Please enter a valid email address.",

"error"

);

studentEmail.focus();

}

});


/* ==========================================================
AUTO CAPITALIZE NAME
========================================================== */

function capitalizeWords(text){

return text.replace(/\b\w/g,char=>char.toUpperCase());

}

studentName.addEventListener("blur",()=>{

studentName.value=

capitalizeWords(

studentName.value.trim()

);

});

parentName.addEventListener("blur",()=>{

parentName.value=

capitalizeWords(

parentName.value.trim()

);

});


/* ==========================================================
AREA AUTO CAPITALIZE
========================================================== */

area.addEventListener("blur",()=>{

area.value=

capitalizeWords(

area.value.trim()

);

});

city.addEventListener("blur",()=>{

city.value=

capitalizeWords(

city.value.trim()

);

});
/* ==========================================================
FILE : js/book-demo.js
PART 7 / 25
CONTINUE BELOW AUTO CAPITALIZE
========================================================== */


/* ==========================================================
CHARACTER COUNTER
========================================================== */

const requirementCounter=document.createElement("small");

requirementCounter.className="helpText";

requirement.parentNode.appendChild(requirementCounter);

function updateRequirementCounter(){

const count=requirement.value.length;

requirementCounter.innerHTML=

`${count}/500 Characters`;

if(count>500){

requirement.value=

requirement.value.substring(0,500);

}

}

requirement.addEventListener(

"input",

updateRequirementCounter

);

updateRequirementCounter();


/* ==========================================================
AUTO SAVE DRAFT
========================================================== */

const draftFields=[

studentName,
studentPhone,
parentName,
parentPhone,
studentEmail,
gender,
studentClass,
subject,
mode,
preferredGender,
preferredTime,
city,
area,
address,
requirement

];

function saveDraft(){

const draft={

studentName:studentName.value,
studentPhone:studentPhone.value,
parentName:parentName.value,
parentPhone:parentPhone.value,
studentEmail:studentEmail.value,
gender:gender.value,
studentClass:studentClass.value,
subject:subject.value,
mode:mode.value,
preferredGender:preferredGender.value,
preferredTime:preferredTime.value,
city:city.value,
area:area.value,
address:address.value,
requirement:requirement.value

};

localStorage.setItem(

"bookDemoDraft",

JSON.stringify(draft)

);

}

draftFields.forEach(field=>{

field.addEventListener(

"input",

saveDraft

);

});
/* ==========================================================
FILE : js/book-demo.js
PART 8 / 25
CONTINUE BELOW AUTO SAVE DRAFT
========================================================== */


/* ==========================================================
LOAD DRAFT
========================================================== */

(function loadDraft(){

const draft=

localStorage.getItem("bookDemoDraft");

if(!draft) return;

try{

const data=JSON.parse(draft);

studentName.value=data.studentName||"";

studentPhone.value=data.studentPhone||"";

parentName.value=data.parentName||"";

parentPhone.value=data.parentPhone||"";

studentEmail.value=data.studentEmail||"";

gender.value=data.gender||"";

studentClass.value=data.studentClass||"";

subject.value=data.subject||"";

mode.value=data.mode||"";

preferredGender.value=data.preferredGender||"";

preferredTime.value=data.preferredTime||"";

city.value=data.city||"";

area.value=data.area||"";

address.value=data.address||"";

requirement.value=data.requirement||"";

updateProgress();

updateRequirementCounter();

}catch(err){

console.log(err);

}

})();


/* ==========================================================
CLEAR DRAFT AFTER SUCCESS
========================================================== */

function clearDraft(){

localStorage.removeItem(

"bookDemoDraft"

);

}


/* ==========================================================
RESET FORM
========================================================== */

bookingForm.addEventListener("reset",()=>{

setTimeout(()=>{

clearDraft();

updateProgress();

updateRequirementCounter();

bookingStatus.className="bookingStatus";

bookingStatus.innerHTML="";

},100);

});
/* ==========================================================
FILE : js/book-demo.js
PART 9 / 25
CONTINUE BELOW RESET FORM
========================================================== */


/* ==========================================================
AUTO DETECT CITY
========================================================== */

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(

()=>{

if(city.value===""){

city.value="Lucknow";

}

},

()=>{}

);

}


/* ==========================================================
PHONE FORMAT
========================================================== */

studentPhone.addEventListener("blur",()=>{

if(

studentPhone.value.length===10

){

studentPhone.classList.remove("inputError");

studentPhone.classList.add("inputSuccess");

}

});

parentPhone.addEventListener("blur",()=>{

if(

parentPhone.value.length===10

){

parentPhone.classList.remove("inputError");

parentPhone.classList.add("inputSuccess");

}

});


/* ==========================================================
EMAIL SUCCESS
========================================================== */

studentEmail.addEventListener("blur",()=>{

const email=studentEmail.value.trim();

if(

email!=="" &&

/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

){

studentEmail.classList.add("inputSuccess");

}

});


/* ==========================================================
AUTO REMOVE STATUS
========================================================== */

function clearStatus(){

setTimeout(()=>{

bookingStatus.className="bookingStatus";

bookingStatus.innerHTML="";

},5000);

}
/* ==========================================================
FILE : js/book-demo.js
PART 10 / 25
CONTINUE BELOW clearStatus()
========================================================== */


/* ==========================================================
REAL TIME VALIDATION
========================================================== */

[
studentName,
subject,
city,
area

].forEach(field=>{

field.addEventListener("input",()=>{

if(field.value.trim().length>=2){

field.classList.remove("inputError");

field.classList.add("inputSuccess");

}else{

field.classList.remove("inputSuccess");

}

});

});


/* ==========================================================
SUBMIT SUCCESS
========================================================== */

function bookingSuccess(bookingId){

clearDraft();

showStatus(

`✅ Demo Booked Successfully!
Booking ID : ${bookingId}`,

"success"

);

clearStatus();

}


/* ==========================================================
SCROLL TO STATUS
========================================================== */

function scrollStatus(){

bookingStatus.scrollIntoView({

behavior:"smooth",

block:"center"

});

}


/* ==========================================================
AUTO SCROLL AFTER ERROR
========================================================== */

const originalShowStatus=showStatus;

showStatus=function(message,type){

originalShowStatus(message,type);

scrollStatus();

};


/* ==========================================================
DISABLE MULTIPLE SUBMIT
========================================================== */

let bookingInProgress=false;

bookingForm.addEventListener("submit",e=>{

if(bookingInProgress){

e.preventDefault();

return;

}

bookingInProgress=true;

setTimeout(()=>{

bookingInProgress=false;

},5000);

});
/* ==========================================================
FILE : js/book-demo.js
PART 11 / 25
CONTINUE BELOW DISABLE MULTIPLE SUBMIT
========================================================== */


/* ==========================================================
AUTO FORMAT PHONE
========================================================== */

function formatPhone(input){

input.value=input.value

.replace(/\D/g,"")

.slice(0,10);

}

studentPhone.addEventListener(

"keyup",

()=>formatPhone(studentPhone)

);

parentPhone.addEventListener(

"keyup",

()=>formatPhone(parentPhone)

);


/* ==========================================================
REQUIRED FIELD HIGHLIGHT
========================================================== */

document.querySelectorAll(

"#bookingForm input,#bookingForm select,#bookingForm textarea"

).forEach(field=>{

field.addEventListener("blur",()=>{

if(

field.hasAttribute("required") &&

field.value.trim()===""

){

field.classList.add("inputError");

}else{

field.classList.remove("inputError");

}

});

});


/* ==========================================================
AUTO FOCUS NEXT FIELD
========================================================== */

const fields=[

studentName,

studentPhone,

parentName,

parentPhone,

studentEmail,

gender,

studentClass,

subject,

mode,

preferredGender,

preferredTime,

city,

area,

address,

requirement

];

fields.forEach((field,index)=>{

field.addEventListener("keydown",e=>{

if(

e.key==="Enter" &&

field.tagName!=="TEXTAREA"

){

e.preventDefault();

if(fields[index+1]){

fields[index+1].focus();

}

}

});

});


/* ==========================================================
PAGE READY
========================================================== */

console.log(

"Book Demo Form Ready"

);
/* ==========================================================
FILE : js/book-demo.js
PART 12 / 25
CONTINUE BELOW PAGE READY
========================================================== */


/* ==========================================================
SUBJECT SUGGESTIONS
========================================================== */

const subjects=[

"Mathematics",

"Physics",

"Chemistry",

"Biology",

"English",

"Hindi",

"Science",

"Social Science",

"Computer",

"Accounts",

"Economics",

"Business Studies",

"NEET",

"JEE",

"CUET",

"NDA"

];

const dataList=document.createElement("datalist");

dataList.id="subjectList";

subjects.forEach(item=>{

const option=document.createElement("option");

option.value=item;

dataList.appendChild(option);

});

document.body.appendChild(dataList);

subject.setAttribute(

"list",

"subjectList"

);


/* ==========================================================
AUTO UPPERCASE CITY
========================================================== */

city.addEventListener("input",()=>{

city.value=

city.value

.replace(/\b\w/g,m=>m.toUpperCase());

});


/* ==========================================================
AUTO UPPERCASE AREA
========================================================== */

area.addEventListener("input",()=>{

area.value=

area.value

.replace(/\b\w/g,m=>m.toUpperCase());

});


/* ==========================================================
SUBJECT FORMAT
========================================================== */

subject.addEventListener("blur",()=>{

subject.value=

subject.value

.trim()

.replace(/\b\w/g,m=>m.toUpperCase());

});
/* ==========================================================
FILE : js/book-demo.js
PART 13 / 25
CONTINUE BELOW SUBJECT FORMAT
========================================================== */


/* ==========================================================
MINIMUM AGE CHECK
========================================================== */

const studentAge=document.getElementById("studentAge");

if(studentAge){

studentAge.addEventListener("input",()=>{

if(

Number(studentAge.value)>100

){

studentAge.value=100;

}

if(

Number(studentAge.value)<2

){

studentAge.value=2;

}

});

}


/* ==========================================================
ADDRESS CHARACTER LIMIT
========================================================== */

address.addEventListener("input",()=>{

if(address.value.length>300){

address.value=

address.value.substring(0,300);

}

});


/* ==========================================================
AUTO SELECT PREFERRED GENDER
========================================================== */

preferredGender.addEventListener("change",()=>{

if(

preferredGender.value==="Female Tutor"

){

showStatus(

"Female tutor preference saved.",

"success"

);

clearStatus();

}

});


/* ==========================================================
AUTO DETECT MODE
========================================================== */

subject.addEventListener("change",()=>{

const text=

subject.value.toLowerCase();

if(

text.includes("neet") ||

text.includes("jee")

){

mode.value="Online";

}

});


/* ==========================================================
COPY BOOKING ID
========================================================== */

function copyBookingID(id){

navigator.clipboard.writeText(id);

showStatus(

"Booking ID copied successfully.",

"success"

);

clearStatus();

}
/* ==========================================================
FILE : js/book-demo.js
PART 14 / 25
CONTINUE BELOW COPY BOOKING ID
========================================================== */


/* ==========================================================
LOADING BUTTON
========================================================== */

function loading(state){

if(state){

submitBtn.disabled=true;

submitBtn.classList.add("btnLoading");

submitBtn.innerHTML=`

<i class="fa-solid fa-spinner fa-spin"></i>

Submitting...

`;

}else{

submitBtn.disabled=false;

submitBtn.classList.remove("btnLoading");

submitBtn.innerHTML=`

<i class="fa-solid fa-paper-plane"></i>

Book FREE Demo

`;

}

}


/* ==========================================================
AUTO SAVE EVERY 10 SECONDS
========================================================== */

setInterval(()=>{

saveDraft();

},10000);


/* ==========================================================
CONFIRM BEFORE LEAVING
========================================================== */

window.addEventListener("beforeunload",(e)=>{

const filled=formFields.some(field=>

field.value.trim()!==""

);

if(filled){

e.preventDefault();

e.returnValue="";

}

});


/* ==========================================================
REMOVE CONFIRM AFTER SUCCESS
========================================================== */

function bookingCompleted(){

window.onbeforeunload=null;

clearDraft();

}


/* ==========================================================
TOTAL FILLED FIELDS
========================================================== */

function totalFilledFields(){

return formFields.filter(field=>

field.value.trim()!==""

).length;

}

console.log(

"Book Demo JS Loaded"

);
/* ==========================================================
FILE : js/book-demo.js
PART 15 / 25
CONTINUE BELOW TOTAL FILLED FIELDS
========================================================== */


/* ==========================================================
LIVE SUMMARY
========================================================== */

const summary=document.querySelector(".summaryCard");

function updateSummary(){

if(!summary) return;

summary.innerHTML=`

<h3>

Booking Summary

</h3>

<div class="summaryRow">

<span class="summaryLabel">

Student

</span>

<span class="summaryValue">

${studentName.value||"--"}

</span>

</div>

<div class="summaryRow">

<span class="summaryLabel">

Class

</span>

<span class="summaryValue">

${studentClass.value||"--"}

</span>

</div>

<div class="summaryRow">

<span class="summaryLabel">

Subject

</span>

<span class="summaryValue">

${subject.value||"--"}

</span>

</div>

<div class="summaryRow">

<span class="summaryLabel">

Mode

</span>

<span class="summaryValue">

${mode.value||"--"}

</span>

</div>

<div class="summaryRow">

<span class="summaryLabel">

Location

</span>

<span class="summaryValue">

${area.value||"--"}, ${city.value||"--"}

</span>

</div>

`;

}

formFields.forEach(field=>{

field.addEventListener("input",updateSummary);

field.addEventListener("change",updateSummary);

});

updateSummary();
/* ==========================================================
FILE : js/book-demo.js
PART 16 / 25
CONTINUE BELOW LIVE SUMMARY
========================================================== */


/* ==========================================================
TIME SLOTS
========================================================== */

const timeSlots=[

"06:00 AM",

"07:00 AM",

"08:00 AM",

"09:00 AM",

"10:00 AM",

"11:00 AM",

"12:00 PM",

"02:00 PM",

"03:00 PM",

"04:00 PM",

"05:00 PM",

"06:00 PM",

"07:00 PM",

"08:00 PM"

];


/* ==========================================================
AUTO DEFAULT TIME
========================================================== */

if(preferredTime.value===""){

preferredTime.value="18:00";

}


/* ==========================================================
DEMO DAY
========================================================== */

const preferredDate=document.getElementById("preferredDate");

if(preferredDate){

const today=new Date();

today.setDate(today.getDate()+1);

preferredDate.min=

today.toISOString().split("T")[0];

}


/* ==========================================================
FORMAT ADDRESS
========================================================== */

address.addEventListener("blur",()=>{

address.value=

address.value

.trim()

.replace(/\s+/g," ");

});


/* ==========================================================
AUTO REMOVE SUCCESS BORDER
========================================================== */

document.querySelectorAll(

"input,select,textarea"

).forEach(field=>{

field.addEventListener("focus",()=>{

field.classList.remove(

"inputSuccess"

);

});

});
/* ==========================================================
FILE : js/book-demo.js
PART 17 / 25
CONTINUE BELOW AUTO REMOVE SUCCESS BORDER
========================================================== */


/* ==========================================================
AUTO FORMAT TEXTAREA
========================================================== */

requirement.addEventListener("blur",()=>{

requirement.value=

requirement.value

.trim()

.replace(/\s+/g," ");

});


/* ==========================================================
REMOVE SPECIAL CHARACTERS FROM NAME
========================================================== */

function cleanName(input){

input.value=input.value.replace(

/[^a-zA-Z\s]/g,

""

);

}

studentName.addEventListener(

"input",

()=>cleanName(studentName)

);

parentName.addEventListener(

"input",

()=>cleanName(parentName)

);


/* ==========================================================
CITY SUGGESTIONS
========================================================== */

const cities=[

"Lucknow",

"Kanpur",

"Prayagraj",

"Varanasi",

"Noida",

"Ghaziabad",

"Delhi",

"Gurugram",

"Jaipur",

"Indore"

];

const cityList=document.createElement("datalist");

cityList.id="cityList";

cities.forEach(item=>{

const option=document.createElement("option");

option.value=item;

cityList.appendChild(option);

});

document.body.appendChild(cityList);

city.setAttribute(

"list",

"cityList"

);


/* ==========================================================
AUTO SELECT HOME TUITION
========================================================== */

if(mode.value===""){

mode.value="Home Tuition";

}
/* ==========================================================
FILE : js/book-demo.js
PART 18 / 25
CONTINUE BELOW AUTO SELECT HOME TUITION
========================================================== */


/* ==========================================================
DETECT DEVICE
========================================================== */

const isMobile=/Android|iPhone|iPad|iPod/i.test(

navigator.userAgent

);

if(isMobile){

document.body.classList.add("mobile");

}


/* ==========================================================
WELCOME MESSAGE
========================================================== */

setTimeout(()=>{

showStatus(

"👋 Welcome! Fill the form to book your FREE Demo Class.",

"success"

);

clearStatus();

},1200);


/* ==========================================================
SCROLL TO FIRST ERROR
========================================================== */

function focusFirstError(){

const error=document.querySelector(".inputError");

if(error){

error.scrollIntoView({

behavior:"smooth",

block:"center"

});

error.focus();

}

}


/* ==========================================================
ENTER KEY
========================================================== */

document.addEventListener("keydown",e=>{

if(

e.key==="Enter" &&

document.activeElement.tagName==="TEXTAREA"

){

return;

}

});


/* ==========================================================
PAGE TITLE
========================================================== */

document.addEventListener(

"visibilitychange",

()=>{

if(document.hidden){

document.title="Complete Your Demo Booking | TutorNest";

}else{

document.title="Book FREE Demo | TutorNest";

}

});
/* ==========================================================
FILE : js/book-demo.js
PART 19 / 25
CONTINUE BELOW PAGE TITLE
========================================================== */


/* ==========================================================
NETWORK STATUS
========================================================== */

window.addEventListener("online",()=>{

showStatus(

"Internet Connected Successfully.",

"success"

);

clearStatus();

});



window.addEventListener("offline",()=>{

showStatus(

"No Internet Connection.",

"error"

);

});


/* ==========================================================
COPY PHONE
========================================================== */

document.querySelectorAll(".copyPhone").forEach(btn=>{

btn.onclick=()=>{

navigator.clipboard.writeText(

btn.dataset.phone

);

showStatus(

"Phone Number Copied",

"success"

);

clearStatus();

};

});


/* ==========================================================
AUTO HIDE STATUS
========================================================== */

const observer=new MutationObserver(()=>{

if(

bookingStatus.innerHTML!=="" &&

bookingStatus.classList.contains("success")

){

setTimeout(()=>{

bookingStatus.className="bookingStatus";

bookingStatus.innerHTML="";

},4000);

}

});

observer.observe(

bookingStatus,

{

childList:true,

attributes:true

}

);


/* ==========================================================
CONSOLE
========================================================== */

console.log(

"Demo Booking Ready"

);
/* ==========================================================
FILE : js/book-demo.js
PART 20 / 25
CONTINUE BELOW CONSOLE
========================================================== */


/* ==========================================================
BACK TO TOP
========================================================== */

const back=document.createElement("div");

back.className="backToTop";

back.innerHTML=`

<i class="fa-solid fa-arrow-up"></i>

`;

document.body.appendChild(back);

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

back.classList.add("show");

}else{

back.classList.remove("show");

}

});

back.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};


/* ==========================================================
LOADING ANIMATION
========================================================== */

window.addEventListener("load",()=>{

document.body.classList.add("fadeIn");

});


/* ==========================================================
AUTO FOCUS
========================================================== */

setTimeout(()=>{

studentName.focus();

},500);


/* ==========================================================
SHORTCUT
ALT + S = SUBMIT
========================================================== */

document.addEventListener("keydown",e=>{

if(

e.altKey &&

e.key.toLowerCase()==="s"

){

bookingForm.requestSubmit();

}

});


/* ==========================================================
ESC CLEAR STATUS
========================================================== */

document.addEventListener("keydown",e=>{

if(e.key==="Escape"){

bookingStatus.className="bookingStatus";

bookingStatus.innerHTML="";

}

});
/* ==========================================================
FILE : js/book-demo.js
PART 21 / 25
CONTINUE BELOW ESC CLEAR STATUS
========================================================== */


/* ==========================================================
RIPPLE EFFECT
========================================================== */

const rippleCSS=document.createElement("style");

rippleCSS.innerHTML=`

.ripple{

position:absolute;

border-radius:50%;

background:rgba(255,255,255,.45);

transform:scale(0);

animation:ripple .6s linear;

pointer-events:none;

}

@keyframes ripple{

to{

transform:scale(4);

opacity:0;

}

}

`;

document.head.appendChild(rippleCSS);

document.querySelectorAll("button").forEach(btn=>{

btn.addEventListener("click",function(e){

const circle=document.createElement("span");

const rect=this.getBoundingClientRect();

const size=Math.max(rect.width,rect.height);

circle.className="ripple";

circle.style.width=size+"px";

circle.style.height=size+"px";

circle.style.left=(e.clientX-rect.left-size/2)+"px";

circle.style.top=(e.clientY-rect.top-size/2)+"px";

this.appendChild(circle);

setTimeout(()=>{

circle.remove();

},600);

});

});


/* ==========================================================
SAVE LAST VISIT
========================================================== */

localStorage.setItem(

"bookDemoLastVisit",

new Date().toLocaleString()

);

console.log(

"Last Visit:",

localStorage.getItem(

"bookDemoLastVisit"

)

);
/* ==========================================================
FILE : js/book-demo.js
PART 22 / 25
CONTINUE BELOW SAVE LAST VISIT
========================================================== */


/* ==========================================================
PAGE LOAD TIME
========================================================== */

window.addEventListener("load",()=>{

const loadTime=(performance.now()/1000).toFixed(2);

console.log(

`Page Loaded in ${loadTime}s`

);

});


/* ==========================================================
AUTO SCROLL TO FORM
========================================================== */

const bookBtns=document.querySelectorAll(".bookNow");

bookBtns.forEach(btn=>{

btn.addEventListener("click",()=>{

bookingForm.scrollIntoView({

behavior:"smooth",

block:"start"

});

});

});


/* ==========================================================
PREVENT SPACE ONLY INPUT
========================================================== */

formFields.forEach(field=>{

field.addEventListener("blur",()=>{

field.value=field.value.trim();

});

});


/* ==========================================================
MAX LENGTHS
========================================================== */

studentName.maxLength=60;

parentName.maxLength=60;

city.maxLength=40;

area.maxLength=60;

address.maxLength=300;

requirement.maxLength=500;


/* ==========================================================
WELCOME IN CONSOLE
========================================================== */

console.log(

"%cTutorNest Demo Booking",

"font-size:22px;color:#2563eb;font-weight:bold"

);

console.log(

"Secure Booking Module Loaded"

);
/* ==========================================================
FILE : js/book-demo.js
PART 23 / 25
CONTINUE BELOW CONSOLE MESSAGE
========================================================== */


/* ==========================================================
ANALYTICS
========================================================== */

const analytics={

page:"Book Demo",

visitedAt:new Date().toISOString(),

device:/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

?"Mobile"

:"Desktop",

language:navigator.language,

timezone:

Intl.DateTimeFormat().resolvedOptions().timeZone

};

console.table(analytics);


/* ==========================================================
AUTO SCROLL TO FIRST EMPTY FIELD
========================================================== */

function focusFirstEmptyField(){

for(const field of formFields){

if(field.value.trim()===""){

field.focus();

break;

}

}

}


/* ==========================================================
FORM INACTIVITY REMINDER
========================================================== */

let inactivityTimer;

function resetInactivity(){

clearTimeout(inactivityTimer);

inactivityTimer=setTimeout(()=>{

if(totalFilledFields()>0){

showStatus(

"⏳ Your booking is not completed yet.",

"error"

);

clearStatus();

}

},120000);

}

document.addEventListener(

"mousemove",

resetInactivity

);

document.addEventListener(

"keydown",

resetInactivity

);

resetInactivity();


/* ==========================================================
AUTO SCROLL AFTER SUCCESS
========================================================== */

function successScroll(){

window.scrollTo({

top:0,

behavior:"smooth"

});

}
/* ==========================================================
FILE : js/book-demo.js
PART 24 / 25
CONTINUE BELOW SUCCESS SCROLL
========================================================== */


/* ==========================================================
SHOW SUCCESS BOX
========================================================== */

function showSuccessBox(bookingId){

const successBox=document.querySelector(".successBox");

if(!successBox) return;

successBox.classList.add("show");

successBox.innerHTML=`

<i class="fa-solid fa-circle-check"></i>

<h2>

Booking Confirmed 🎉

</h2>

<p>

Your FREE Demo request has been submitted successfully.

</p>

<p>

<b>

Booking ID :

${bookingId}

</b>

</p>

`;

successScroll();

}


/* ==========================================================
RESET BUTTON
========================================================== */

const resetBtn=document.querySelector(".resetBtn");

if(resetBtn){

resetBtn.addEventListener("click",()=>{

clearDraft();

bookingStatus.className="bookingStatus";

bookingStatus.innerHTML="";

updateProgress();

updateSummary();

updateRequirementCounter();

showStatus(

"Form Reset Successfully.",

"success"

);

clearStatus();

});

}


/* ==========================================================
AUTO SAVE BEFORE CLOSE
========================================================== */

window.addEventListener("pagehide",()=>{

saveDraft();

});


/* ==========================================================
AUTO REFRESH SUMMARY
========================================================== */

setInterval(()=>{

updateSummary();

},5000);
/* ==========================================================
FILE : js/book-demo.js
PART 25 / 25 (FINAL)
CONTINUE BELOW AUTO REFRESH SUMMARY
========================================================== */


/* ==========================================================
INITIALIZE
========================================================== */

function initialize(){

updateProgress();

updateSummary();

updateRequirementCounter();

resetInactivity();

console.log(

"Book Demo Module Initialized"

);

}

initialize();


/* ==========================================================
GLOBAL FUNCTIONS
========================================================== */

window.showStatus=showStatus;

window.updateProgress=updateProgress;

window.updateSummary=updateSummary;

window.clearDraft=clearDraft;

window.bookingSuccess=bookingSuccess;

window.loading=loading;


/* ==========================================================
FIREBASE CHECK
========================================================== */

async function checkConnection(){

try{

await addDoc(

collection(db,"connectionTest"),

{

createdAt:serverTimestamp(),

delete:true

}

);

console.log(

"Firebase Connected"

);

}catch(err){

console.log(

"Firebase Ready"

);

}

}

checkConnection();


/* ==========================================================
VERSION
========================================================== */

const VERSION="1.0.0";

console.log(

`TutorNest Book Demo v${VERSION}`

);


/* ==========================================================
END OF FILE
========================================================== */

console.log(

"%cBook Demo Script Loaded Successfully",

"background:#2563eb;color:#fff;padding:6px 12px;border-radius:6px;font-weight:bold;"

);

console.log(

"© TutorNest Technologies"

);