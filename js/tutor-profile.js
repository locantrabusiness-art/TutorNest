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


//=====================================
// IMAGEKIT
//=====================================


//=====================================
// DOM
//=====================================

const profileForm=document.getElementById("profileForm");

const emailInput=document.getElementById("email");

const photoInput=document.getElementById("photo");

const preview=document.getElementById("photoPreview");

const subjectContainer=document.getElementById("subjectFeeContainer");

const addSubjectBtn=document.getElementById("addSubjectBtn");

//=====================================

let currentUser=null;

let oldData={};

//=====================================
// LOGIN
//=====================================

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

currentUser=user;

emailInput.value=user.email;

await loadProfile(user.uid);

});

//=====================================
// LOAD PROFILE
//=====================================

async function loadProfile(uid){

const snap=await getDoc(

doc(db,"tutors",uid)

);

if(!snap.exists()){

addSubjectRow();

return;

}

oldData=snap.data();

// BASIC DETAILS

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

preview.src=oldData.photoURL;

}
//=====================================
// SUBJECTS
//=====================================

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

//=====================================
// CLASSES
//=====================================

(oldData.classes||[]).forEach(cls=>{

const box=document.querySelector(

`input[name="classes"][value="${cls}"]`

);

if(box){

box.checked=true;

}

});

//=====================================
// LANGUAGES
//=====================================

(oldData.languages||[]).forEach(lang=>{

const box=document.querySelector(

`input[name="languages"][value="${lang}"]`

);

if(box){

box.checked=true;

}

});

//=====================================
// MODE
//=====================================

const mode=document.querySelector(

`input[name="mode"][value="${oldData.teachingMode}"]`

);

if(mode){

mode.checked=true;

}

} // <-- loadProfile() END

//=====================================
// PHOTO PREVIEW
//=====================================

photoInput.addEventListener("change",()=>{

const file=photoInput.files[0];

if(!file) return;

preview.src=URL.createObjectURL(file);

});

//=====================================
// SUBJECT ROW
//=====================================

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

//=====================================
// ADD SUBJECT
//=====================================

addSubjectBtn.addEventListener("click",()=>{

addSubjectRow();

});

//=====================================
// REMOVE SUBJECT
//=====================================

subjectContainer.addEventListener("click",(e)=>{

const btn=e.target.closest(".remove-row");

if(!btn) return;

const rows=document.querySelectorAll(".subject-fee-row");

if(rows.length>1){

btn.closest(".subject-fee-row").remove();

}

});
//=====================================
// IMAGEKIT UPLOAD
//=====================================

async function uploadToImageKit(file){

if(!file) return "";

const authRes=await fetch("/api/imagekit-auth");

const auth=await authRes.json();

const formData=new FormData();

formData.append("file",file);

formData.append("fileName",Date.now()+"_"+file.name);

formData.append("publicKey","public_kKdD/tl6716JICjya52hltPI3kM=");

formData.append("token",auth.token);

formData.append("signature",auth.signature);

formData.append("expire",auth.expire);

const res=await fetch(
"https://upload.imagekit.io/api/v1/files/upload",
{
method:"POST",
body:formData
}
);

const data=await res.json();

if(!res.ok){

throw new Error(data.message||"Upload Failed");

}

return data.url;

}
//=====================================
// SAVE PROFILE
//=====================================

profileForm.addEventListener("submit",async(e)=>{

e.preventDefault();

try{

const tutorRef=doc(db,"tutors",currentUser.uid);

const snap=await getDoc(tutorRef);

const old=snap.exists()?snap.data():{};

let photoURL=old.photoURL||"";

let aadhaarURL=old.aadhaarURL||"";

let certificateURL=old.certificateURL||"";

const photo=photoInput.files[0];

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

//=====================================
// SUBJECTS
//=====================================

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

//=====================================
// CLASSES
//=====================================

const classes=[

...document.querySelectorAll(

'input[name="classes"]:checked'

)

].map(item=>item.value);

//=====================================
// LANGUAGES
//=====================================

const languages=[

...document.querySelectorAll(

'input[name="languages"]:checked'

)

].map(item=>item.value);

//=====================================
// MODE
//=====================================

const teachingMode=

document.querySelector(

'input[name="mode"]:checked'

)?.value||"";
//=====================================
// SAVE TO FIRESTORE
//=====================================

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

area:document.getElementById("area").value,

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

status:old.status || "Pending",

featured:old.featured || false,

homepageOrder:old.homepageOrder || 999,

verified:old.verified || false,

rating:old.rating || 0,

totalReviews:old.totalReviews || 0,

createdAt:old.createdAt || serverTimestamp(),

updatedAt:serverTimestamp()

},

{

merge:true

}

);

//=====================================
// SUCCESS
//=====================================

alert("Profile Saved Successfully!");

window.location.href="dashboard.html";

}

catch(err){

console.error(err);

alert("Error: "+err.message);

}

});