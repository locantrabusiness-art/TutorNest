import { auth, db } from "../firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
doc,
getDoc,
setDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import ImageKit from "https://cdn.jsdelivr.net/npm/imagekit-javascript/dist/imagekit.esm.js";

//==================================
// IMAGEKIT
//==================================

const imagekit = new ImageKit({

urlEndpoint:"https://ik.imagekit.io/tutornest",

publicKey:"public_kKdD/tl6716JICjya52hltPI3kM=",

authenticationEndpoint:"/api/imagekit-auth"

});

//==================================
// DOM
//==================================

const profileForm=document.getElementById("profileForm");

const emailInput=document.getElementById("email");

const photoInput=document.getElementById("photo");

const previewImage=document.getElementById("photoPreview");

const subjectContainer=document.getElementById("subjectFeeContainer");

const addSubjectBtn=document.getElementById("addSubjectBtn");

//==================================

let currentUser=null;

let oldData={};

//==================================
// LOGIN
//==================================

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

currentUser=user;

emailInput.value=user.email;

await loadProfile(user.uid);

});

//==================================
// LOAD PROFILE
//==================================

async function loadProfile(uid){

const snap=await getDoc(

doc(db,"tutors",uid)

);

if(!snap.exists()){

addSubjectRow();

return;

}

oldData=snap.data();

document.getElementById("name").value=
oldData.name||"";

document.getElementById("phone").value=
oldData.phone||"";

document.getElementById("dob").value=
oldData.dob||"";

document.getElementById("qualification").value=
oldData.qualification||"";

document.getElementById("college").value=
oldData.college||"";

document.getElementById("experience").value=
oldData.experience||"";

document.getElementById("about").value=
oldData.about||"";

document.getElementById("area").value=
oldData.area||"";

document.getElementById("pincode").value=
oldData.pincode||"";

document.getElementById("availability").value=
oldData.availability||"";

document.getElementById("timeSlot").value=
oldData.timeSlot||"";

if(oldData.photoURL){

previewImage.src=oldData.photoURL;

}

}
//==================================
// PHOTO PREVIEW
//==================================

photoInput.addEventListener("change",()=>{

const file=photoInput.files[0];

if(!file) return;

previewImage.src=URL.createObjectURL(file);

});

//==================================
// SUBJECT ROW
//==================================

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

//==================================
// LOAD SUBJECTS
//==================================

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

//==================================
// ADD SUBJECT
//==================================

addSubjectBtn.addEventListener("click",()=>{

addSubjectRow();

});

//==================================
// REMOVE SUBJECT
//==================================

subjectContainer.addEventListener("click",(e)=>{

if(e.target.closest(".remove-row")){

const rows=document.querySelectorAll(".subject-fee-row");

if(rows.length>1){

e.target.closest(".subject-fee-row").remove();

}

}

});

//==================================
// LOAD CLASSES
//==================================

(oldData.classes||[]).forEach(cls=>{

const box=document.querySelector(

`input[name="classes"][value="${cls}"]`

);

if(box){

box.checked=true;

}

});

//==================================
// LOAD LANGUAGES
//==================================

(oldData.languages||[]).forEach(lang=>{

const box=document.querySelector(

`input[name="languages"][value="${lang}"]`

);

if(box){

box.checked=true;

}

});

//==================================
// LOAD MODE
//==================================

const mode=document.querySelector(

`input[name="mode"][value="${oldData.teachingMode}"]`

);

if(mode){

mode.checked=true;

}
//==================================
// IMAGEKIT UPLOAD
//==================================

async function uploadToImageKit(file){

if(!file) return "";

return new Promise((resolve,reject)=>{

imagekit.upload({

file:file,

fileName:Date.now()+"_"+file.name

},(error,result)=>{

if(error){

reject(error);

return;

}

resolve(result.url);

});

});

}

//==================================
// SAVE PROFILE
//==================================

profileForm.addEventListener("submit",async(e)=>{

e.preventDefault();

try{

const tutorRef=doc(db,"tutors",currentUser.uid);

const oldSnap=await getDoc(tutorRef);

const old=oldSnap.exists()

? oldSnap.data()

: {};

let photoURL=old.photoURL||"";

let aadhaarURL=old.aadhaarURL||"";

let certificateURL=old.certificateURL||"";

const photo=document.getElementById("photo").files[0];

const aadhaar=document.getElementById("aadhaar").files[0];

const certificate=document.getElementById("certificate").files[0];

if(photo){

photoURL=await uploadToImageKit(photo);

}

if(aadhaar){

aadhaarURL=await uploadToImageKit(aadhaar);

}

if(certificate){

certificateURL=await uploadToImageKit(certificate);

}

const teaching=[];

document.querySelectorAll(".subject-fee-row").forEach(row=>{

const subject=row.querySelector(".subject-select").value;

const fee=row.querySelector(".subject-fee").value;

if(subject && fee){

teaching.push({

subject,

monthlyFee:Number(fee)

});

}

});

const classes=[

...document.querySelectorAll('input[name="classes"]:checked')

].map(item=>item.value);

const languages=[

...document.querySelectorAll('input[name="languages"]:checked')

].map(item=>item.value);

const teachingMode=

document.querySelector('input[name="mode"]:checked')?.value||"";
//==================================
// IMAGEKIT UPLOAD
//==================================

async function uploadToImageKit(file){

if(!file) return "";

return new Promise((resolve,reject)=>{

imagekit.upload({

file:file,

fileName:Date.now()+"_"+file.name

},(error,result)=>{

if(error){

reject(error);

return;

}

resolve(result.url);

});

});

}

//==================================
// SAVE PROFILE
//==================================

profileForm.addEventListener("submit",async(e)=>{

e.preventDefault();

try{

const tutorRef=doc(db,"tutors",currentUser.uid);

const oldSnap=await getDoc(tutorRef);

const old=oldSnap.exists()

? oldSnap.data()

: {};

let photoURL=old.photoURL||"";

let aadhaarURL=old.aadhaarURL||"";

let certificateURL=old.certificateURL||"";

const photo=document.getElementById("photo").files[0];

const aadhaar=document.getElementById("aadhaar").files[0];

const certificate=document.getElementById("certificate").files[0];

if(photo){

photoURL=await uploadToImageKit(photo);

}

if(aadhaar){

aadhaarURL=await uploadToImageKit(aadhaar);

}

if(certificate){

certificateURL=await uploadToImageKit(certificate);

}

const teaching=[];

document.querySelectorAll(".subject-fee-row").forEach(row=>{

const subject=row.querySelector(".subject-select").value;

const fee=row.querySelector(".subject-fee").value;

if(subject && fee){

teaching.push({

subject,

monthlyFee:Number(fee)

});

}

});

const classes=[

...document.querySelectorAll('input[name="classes"]:checked')

].map(item=>item.value);

const languages=[

...document.querySelectorAll('input[name="languages"]:checked')

].map(item=>item.value);

const teachingMode=

document.querySelector('input[name="mode"]:checked')?.value||"";