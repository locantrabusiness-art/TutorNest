import { auth, db, storage } from "../firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
doc,
getDoc,
setDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
ref,
uploadBytes,
getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

//=============================
// DOM
//=============================

const profileForm=document.getElementById("profileForm");

const emailInput=document.getElementById("email");

const subjectContainer=document.getElementById("subjectFeeContainer");

const addSubjectBtn=document.getElementById("addSubjectBtn");

const photoInput=document.getElementById("photo");

const previewImage=document.getElementById("photoPreview");

let currentUser=null;

let oldData={};

//=============================
// LOGIN CHECK
//=============================

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

currentUser=user;

emailInput.value=user.email;

await loadProfile(user.uid);

});

//=============================
// PHOTO PREVIEW
//=============================

photoInput?.addEventListener("change",()=>{

const file=photoInput.files[0];

if(!file) return;

previewImage.src=URL.createObjectURL(file);

});

//=============================
// LOAD PROFILE
//=============================

async function loadProfile(uid){

const tutorRef=doc(db,"tutors",uid);

const snap=await getDoc(tutorRef);

if(!snap.exists()) return;

oldData=snap.data();

document.getElementById("name").value=oldData.name||"";

document.getElementById("phone").value=oldData.phone||"";

document.getElementById("dob").value=oldData.dob||"";

document.getElementById("qualification").value=oldData.qualification||"";

document.getElementById("college").value=oldData.college||"";

document.getElementById("experience").value=oldData.experience||"";

document.getElementById("about").value=oldData.about||"";

document.getElementById("area").value=oldData.area||"";

document.getElementById("pincode").value=oldData.pincode||"";

document.getElementById("availability").value=oldData.availability||"";

document.getElementById("timeSlot").value=oldData.timeSlot||"";

if(oldData.photoURL){

previewImage.src=oldData.photoURL;

}
//=============================
// LOAD SUBJECTS
//=============================

subjectContainer.innerHTML="";

const teaching=oldData.teaching||[];

if(teaching.length===0){

addSubjectRow();

}else{

teaching.forEach(item=>{

addSubjectRow(

item.subject,

item.monthlyFee

);

});

}

//=============================
// LOAD CLASSES
//=============================

(oldData.classes||[]).forEach(cls=>{

const checkbox=document.querySelector(

`input[name="classes"][value="${cls}"]`

);

if(checkbox){

checkbox.checked=true;

}

});

//=============================
// LOAD LANGUAGES
//=============================

(oldData.languages||[]).forEach(lang=>{

const checkbox=document.querySelector(

`input[name="languages"][value="${lang}"]`

);

if(checkbox){

checkbox.checked=true;

}

});

//=============================
// LOAD MODE
//=============================

const mode=document.querySelector(

`input[name="mode"][value="${oldData.teachingMode}"]`

);

if(mode){

mode.checked=true;

}

}

//=============================
// ADD SUBJECT ROW
//=============================

function addSubjectRow(subject="",fee=""){

const row=document.createElement("div");

row.className="subject-fee-row";

row.innerHTML=`

<select class="subject-select">

<option value="">Select Subject</option>

<option ${subject==="Mathematics"?"selected":""}>Mathematics</option>

<option ${subject==="Physics"?"selected":""}>Physics</option>

<option ${subject==="Chemistry"?"selected":""}>Chemistry</option>

<option ${subject==="Biology"?"selected":""}>Biology</option>

<option ${subject==="English"?"selected":""}>English</option>

<option ${subject==="Hindi"?"selected":""}>Hindi</option>

<option ${subject==="Computer Science"?"selected":""}>Computer Science</option>

<option ${subject==="Economics"?"selected":""}>Economics</option>

<option ${subject==="Accounts"?"selected":""}>Accounts</option>

<option ${subject==="Business Studies"?"selected":""}>Business Studies</option>

<option ${subject==="Other"?"selected":""}>Other</option>

</select>

<input
type="number"
class="subject-fee"
placeholder="Monthly Fee"
value="${fee}">

<button
type="button"
class="remove-row">

<i class="fa-solid fa-trash"></i>

</button>

`;

subjectContainer.appendChild(row);

}

//=============================
// ADD BUTTON
//=============================

addSubjectBtn.addEventListener("click",()=>{

addSubjectRow();

});

//=============================
// REMOVE BUTTON
//=============================

subjectContainer.addEventListener("click",(e)=>{

if(e.target.closest(".remove-row")){

const rows=document.querySelectorAll(".subject-fee-row");

if(rows.length>1){

e.target.closest(".subject-fee-row").remove();

}

}

});
//=============================
// FILE UPLOAD
//=============================

async function uploadFile(file,folder){

if(!file) return null;

const storageRef=ref(

storage,

`${folder}/${currentUser.uid}/${Date.now()}_${file.name}`

);

await uploadBytes(storageRef,file);

return await getDownloadURL(storageRef);

}

//=============================
// SAVE PROFILE
//=============================

profileForm.addEventListener("submit",async(e)=>{

e.preventDefault();

try{

const tutorRef=doc(db,"tutors",currentUser.uid);

const oldSnap=await getDoc(tutorRef);

const old=oldSnap.exists()

? oldSnap.data()

: {};

let photoURL=

old.photoURL||"";

let aadhaarURL=

old.aadhaarURL||"";

let certificateURL=

old.certificateURL||"";

const photo=

photoInput.files[0];

const aadhaar=

document.getElementById("aadhaar").files[0];

const certificate=

document.getElementById("certificate").files[0];

if(photo){

photoURL=

await uploadFile(

photo,

"profilePhotos"

);

}

if(aadhaar){

aadhaarURL=

await uploadFile(

aadhaar,

"aadhaar"

);

}

if(certificate){

certificateURL=

await uploadFile(

certificate,

"certificates"

);

}

//=============================
// SUBJECTS
//=============================

const teaching=[];

document.querySelectorAll(

".subject-fee-row"

).forEach(row=>{

const subject=

row.querySelector(

".subject-select"

).value;

const fee=

row.querySelector(

".subject-fee"

).value;

if(subject && fee){

teaching.push({

subject,

monthlyFee:Number(fee)

});

}

});

//=============================
// CLASSES
//=============================

const classes=[

...document.querySelectorAll(

'input[name="classes"]:checked'

)

].map(item=>item.value);

//=============================
// LANGUAGES
//=============================

const languages=[

...document.querySelectorAll(

'input[name="languages"]:checked'

)

].map(item=>item.value);

//=============================
// MODE
//=============================

const teachingMode=

document.querySelector(

'input[name="mode"]:checked'

)?.value||"";
//=============================
// SAVE FIRESTORE
//=============================

await setDoc(

tutorRef,

{

uid:currentUser.uid,

email:currentUser.email,

name:document.getElementById("name").value.trim(),

phone:document.getElementById("phone").value.trim(),

dob:document.getElementById("dob").value,

qualification:document.getElementById("qualification").value.trim(),

college:document.getElementById("college").value.trim(),

experience:Number(

document.getElementById("experience").value||0

),

about:document.getElementById("about").value.trim(),

area:document.getElementById("area").value.trim(),

pincode:document.getElementById("pincode").value.trim(),

availability:document.getElementById("availability").value,

timeSlot:document.getElementById("timeSlot").value,

teaching,

classes,

languages,

teachingMode,

photoURL,

aadhaarURL,

certificateURL,

status:old.status||"Pending",

featured:old.featured||false,

homepageOrder:old.homepageOrder||999,

verified:old.verified||false,

rating:old.rating||0,

totalReviews:old.totalReviews||0,

createdAt:old.createdAt||serverTimestamp(),

updatedAt:serverTimestamp()

},

{

merge:true

}

);

//=============================
// SUCCESS
//=============================

alert(

"Profile saved successfully."

);

// Redirect

window.location.href=

"tutor-dashboard.html";

}

catch(err){

console.error(err);

alert(

"Error : "+err.message

);

}

});