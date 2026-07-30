import { db } from "../firebase.js";

import {
doc,
getDoc,
collection,
query,
where,
limit,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const tutorId = params.get("id");

if(!tutorId){

document.body.innerHTML=`

<h2 style="margin:100px;text-align:center;">

Tutor Not Found

</h2>

`;

throw new Error("Tutor ID Missing");

}

const profileImage=document.getElementById("profileImage");

const teacherName=document.getElementById("teacherName");

const qualification=document.getElementById("qualification");

const experience=document.getElementById("experience");

const locationText=document.getElementById("location");

const mode=document.getElementById("mode");

const modeTag=document.getElementById("modeTag");

const about=document.getElementById("about");

const languages=document.getElementById("languages");

const experienceCard=document.getElementById("experienceCard");

const area=document.getElementById("area");

const subjectContainer=document.getElementById("subjectContainer");

const classContainer=document.getElementById("classContainer");

const whatsappBtn=document.getElementById("whatsappBtn");

const callBtn=document.getElementById("callBtn");

const similarTutors=document.getElementById("similarTutors");
async function loadTutor(){

try{

const snap=await getDoc(doc(db,"tutors",tutorId));

if(!snap.exists()){

document.body.innerHTML=`

<h2 style="margin:100px;text-align:center;">

Tutor Not Found

</h2>

`;

return;

}

const tutor=snap.data();

profileImage.src=

tutor.photoURL ||

"assets/images/default-user.png";

teacherName.textContent=

tutor.name ||

"Unnamed Tutor";

qualification.textContent=

tutor.qualification ||

"Qualification Not Available";

experience.textContent=

`${tutor.experience||0} Years Experience`;

experienceCard.textContent=

`${tutor.experience||0} Years`;

locationText.innerHTML=`

<i class="fa-solid fa-location-dot"></i>

${tutor.area||""}, ${tutor.city||""}

`;

area.textContent=

tutor.area||

"-";

mode.textContent=

Array.isArray(tutor.mode)

? tutor.mode.join(", ")

: tutor.mode||"-";

modeTag.textContent=

Array.isArray(tutor.mode)

? tutor.mode.join(", ")

: tutor.mode||"Home Tuition";

languages.textContent=

Array.isArray(tutor.languages)

? tutor.languages.join(", ")

: tutor.languages||"Hindi";

about.textContent=

tutor.about||

"No description available.";

subjectContainer.innerHTML="";

(tutor.subjects||[]).forEach(subject=>{

const fee=

tutor.fees ||

tutor.monthlyFees ||

"Contact";

const card=document.createElement("div");

card.className="card";

card.innerHTML=`

<h3>${subject}</h3>

<p>

₹${fee}/Month

</p>

`;

subjectContainer.appendChild(card);

});

classContainer.innerHTML="";

(tutor.classes||[]).forEach(cls=>{

const tag=document.createElement("span");

tag.className="tag";

tag.textContent=cls;

classContainer.appendChild(tag);

});

callBtn.href=

`tel:${tutor.phone}`;

whatsappBtn.href=

`https://wa.me/91${tutor.phone}?text=${encodeURIComponent(

`Hi ${tutor.name}, I found your TutorNest profile and would like to book a demo class.`

)}`;

loadSimilarTutors(tutor);

}

catch(err){

console.error(err);

document.body.innerHTML=`

<h2 style="margin:100px;text-align:center;">

Unable to load tutor profile.

</h2>

`;

}

}
async function loadSimilarTutors(currentTutor){

try{

const firstSubject=

(currentTutor.subjects||[])[0];

if(!firstSubject){

similarTutors.innerHTML="";

return;

}

const q=query(

collection(db,"tutors"),

where("status","==","Approved"),

where("featured","==",true),

limit(4)

);

const snapshot=await getDocs(q);

similarTutors.innerHTML="";

let found=0;

snapshot.forEach(docSnap=>{

if(docSnap.id===tutorId) return;

const tutor=docSnap.data();

const subjects=tutor.subjects||[];

if(!subjects.includes(firstSubject)) return;

found++;

const image=

tutor.photoURL ||

"assets/images/default-user.png";

const card=document.createElement("div");

card.className="featured-card";

card.innerHTML=`

<div class="featured-image">

<img
src="${image}"
alt="${tutor.name}"

onerror="this.src='assets/images/default-user.png'">

</div>

<div class="featured-content">

<h3>

${tutor.name||"Tutor"}

</h3>

<p>

<i class="fa-solid fa-book"></i>

${subjects.join(", ")}

</p>

<p>

<i class="fa-solid fa-location-dot"></i>

${tutor.area||"-"}

</p>

<p>

<i class="fa-solid fa-briefcase"></i>

${tutor.experience||0} Years Experience

</p>

<h4>

₹${tutor.fees||tutor.monthlyFees||"Contact"}/Month

</h4>

<a
href="teacher.html?id=${docSnap.id}"
class="primary-btn">

View Profile

</a>

</div>

`;

similarTutors.appendChild(card);

});

if(found===0){

similarTutors.innerHTML=`

<div class="empty-state">

<i class="fa-solid fa-user-group"></i>

<h3>

No Similar Tutors Found

</h3>

<p>

Please explore more tutors from the search page.

</p>

</div>

`;

}

}

catch(err){

console.error(err);

similarTutors.innerHTML=`

<div class="empty-state">

<i class="fa-solid fa-circle-exclamation"></i>

<h3>

Unable to load similar tutors.

</h3>

</div>

`;

}

}

loadTutor();