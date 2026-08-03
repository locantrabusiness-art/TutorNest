/* ==========================================================
FILE : js/homepage.js
PART 1 / 25
START FROM LINE 1
========================================================== */

import { db } from "../firebase.js";

import {
collection,
query,
where,
orderBy,
limit,
getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* ==========================================================
DOM
========================================================== */

const header=document.getElementById("header");

const menuBtn=document.getElementById("menuBtn");

const navbar=document.getElementById("navbar");

const featuredTutors=document.getElementById("featuredTutors");

const preloader=document.getElementById("preloader");

const searchForm=document.getElementById("searchForm");

const classSearch=document.getElementById("classSearch");

const subjectSearch=document.getElementById("subjectSearch");

const areaSearch=document.getElementById("areaSearch");

const studentCounter=document.getElementById("studentCounter");

const teacherCounter=document.getElementById("teacherCounter");

const demoCounter=document.getElementById("demoCounter");


/* ==========================================================
GLOBAL
========================================================== */

let tutors=[];

let filteredTutors=[];


/* ==========================================================
PRELOADER
========================================================== */

window.addEventListener("load",()=>{

setTimeout(()=>{

preloader.style.opacity="0";

preloader.style.pointerEvents="none";

setTimeout(()=>{

preloader.remove();

},500);

},800);

});


/* ==========================================================
STICKY HEADER
========================================================== */

window.addEventListener("scroll",()=>{

if(window.scrollY>40){

header.classList.add("scrolled");

}else{

header.classList.remove("scrolled");

}

});


/* ==========================================================
MOBILE MENU
========================================================== */

menuBtn.onclick=()=>{

navbar.classList.toggle("active");

};

document.querySelectorAll("#navbar a").forEach(link=>{

link.onclick=()=>{

navbar.classList.remove("active");

};

});
/* ==========================================================
FILE : js/homepage.js
PART 2 / 25
CONTINUE BELOW MOBILE MENU
========================================================== */


/* ==========================================================
LOAD FEATURED TUTORS
========================================================== */
// ================= FEATURED TUTORS =================

const featuredBox = document.getElementById("featuredTutors");


function showFeaturedTutors(tutors){


if(!featuredBox) return;


if(!tutors || tutors.length === 0){


tutors = [

{
name:"Rahul Sharma",
subject:"Mathematics",
experience:"8 Years Experience",
rating:"4.9"
},

{
name:"Priya Verma",
subject:"Science",
experience:"6 Years Experience",
rating:"4.8"
},

{
name:"Amit Singh",
subject:"Physics",
experience:"10 Years Experience",
rating:"5.0"
}

];


}



featuredBox.innerHTML="";



tutors.slice(0,3).forEach(tutor=>{


featuredBox.innerHTML += `


<div class="tutorCard">


<div class="tutorImage">

<i class="fa-solid fa-user-tie"></i>

</div>



<h3>

${tutor.name}

</h3>



<p>

${tutor.subject}

</p>



<span>

⭐ ${tutor.rating}

</span>



<small>

${tutor.experience}

</small>



</div>


`;



});


}

async function loadFeaturedTutors(){

try{

featuredTutors.innerHTML=`

<div class="loading">

<span></span>

<span></span>

<span></span>

</div>

`;

const q=query(

collection(db,"tutors"),

where("status","==","Approved"),

where("featured","==",true),

orderBy("name"),

limit(6)

);

const snap=await getDocs(q);

tutors=[];

snap.forEach(doc=>{

tutors.push({

id:doc.id,

...doc.data()

});

});

filteredTutors=[...tutors];

if(tutors.length === 0){

showFeaturedTutors([]);

}else{

renderTutors(filteredTutors);

}
updateCounters();

}catch(error){

console.error(error);

featuredTutors.innerHTML=`

<div class="emptyState">

<h3>

Unable to Load Tutors

</h3>

<p>

Please refresh the page.

</p>

</div>

`;

}

}


/* ==========================================================
RENDER TUTORS
========================================================== */

function renderTutors(data){

if(data.length===0){

featuredTutors.innerHTML=`

<div class="emptyState">

<h3>

No Tutors Found

</h3>

<p>

No featured tutors available right now.

</p>

</div>

`;

return;

}

featuredTutors.innerHTML="";

data.forEach(tutor=>{

featuredTutors.innerHTML+=`

<div class="tutorCard">

<div class="tutorImage">

<img

src="${tutor.photo||tutor.photoURL||'assets/images/default-user.png'}"

alt="${tutor.name}">

<div class="featuredLabel">

Featured

</div>

<div class="onlineBadge">

Available

</div>

</div>

<div class="tutorContent">

<div class="tutorTop">

<div class="tutorName">

${tutor.name||"Tutor"}

</div>

<div class="verified">

<i class="fa-solid fa-circle-check"></i>

Verified

</div>

</div>
/* ==========================================================
FILE : js/homepage.js
PART 3 / 25
CONTINUE BELOW tutorTop
========================================================== */

<div class="tutorInfo">

<div class="infoBox">

<i class="fa-solid fa-book-open"></i>

<span>

${(tutor.subjects||[]).join(", ")||"All Subjects"}

</span>

</div>

<div class="infoBox">

<i class="fa-solid fa-graduation-cap"></i>

<span>

${(tutor.classes||[]).join(", ")||"All Classes"}

</span>

</div>

<div class="infoBox">

<i class="fa-solid fa-location-dot"></i>

<span>

${tutor.area||tutor.location||"Lucknow"}

</span>

</div>

<div class="infoBox">

<i class="fa-solid fa-indian-rupee-sign"></i>

<span>

₹${tutor.fees||"--"}/Month

</span>

</div>

</div>

<div class="subjectTags">

${(tutor.subjects||[])
.slice(0,4)
.map(subject=>`

<span>

${subject}

</span>

`).join("")}

</div>

<div class="tutorBottom">

<div class="rating">

<i class="fa-solid fa-star"></i>

<span>

${tutor.rating||"5.0"}

</span>

</div>

<a

href="teacher.html?id=${tutor.id}"

class="bookTutor">

View Profile

</a>

</div>

</div>

</div>

`;

});

}


/* ==========================================================
COUNTERS
========================================================== */

function updateCounters(){

animateCounter(

teacherCounter,

tutors.length

);

animateCounter(

studentCounter,

3000

);

animateCounter(

demoCounter,

1500

);

}
/* ==========================================================
FILE : js/homepage.js
PART 4 / 25
CONTINUE BELOW updateCounters()
========================================================== */


/* ==========================================================
COUNTER ANIMATION
========================================================== */

function animateCounter(element,target){

let current=0;

const increment=Math.ceil(target/80);

const timer=setInterval(()=>{

current+=increment;

if(current>=target){

current=target;

clearInterval(timer);

}

element.textContent=current.toLocaleString()+"+";

},20);

}


/* ==========================================================
SEARCH
========================================================== */

searchForm.addEventListener("submit",(e)=>{

e.preventDefault();

const cls=classSearch.value.toLowerCase();

const subject=subjectSearch.value.trim().toLowerCase();

const area=areaSearch.value.trim().toLowerCase();

filteredTutors=tutors.filter(t=>{

const classMatch=

!cls ||

(t.classes||[])

.join(",")

.toLowerCase()

.includes(cls);

const subjectMatch=

!subject ||

(t.subjects||[])

.join(",")

.toLowerCase()

.includes(subject);

const areaMatch=

!area ||

(t.area||"")

.toLowerCase()

.includes(area);

return(

classMatch &&

subjectMatch &&

areaMatch

);

});

renderTutors(filteredTutors);

});
/* ==========================================================
FILE : js/homepage.js
PART 5 / 25
CONTINUE BELOW SEARCH
========================================================== */


/* ==========================================================
FAQ
========================================================== */

document.querySelectorAll(".faqQuestion").forEach(btn=>{

btn.onclick=()=>{

const item=btn.parentElement;

document.querySelectorAll(".faqItem").forEach(f=>{

if(f!==item){

f.classList.remove("active");

}

});

item.classList.toggle("active");

};

});


/* ==========================================================
SCROLL ANIMATION
========================================================== */

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},{

threshold:.15

});

document.querySelectorAll(

".fadeUp,.fadeLeft,.fadeRight,.zoom"

).forEach(el=>{

observer.observe(el);

});


/* ==========================================================
BACK TO TOP
========================================================== */

const back=document.createElement("div");

back.className="backToTop";

back.innerHTML=`

<i class="fa-solid fa-arrow-up"></i>

`;

document.body.appendChild(back);

back.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

back.classList.add("show");

}else{

back.classList.remove("show");

}

});
/* ==========================================================
FILE : js/homepage.js
PART 6 / 25
CONTINUE BELOW BACK TO TOP
========================================================== */


/* ==========================================================
SCROLL PROGRESS BAR
========================================================== */

const progress=document.createElement("div");

progress.id="scrollProgress";

document.body.appendChild(progress);

window.addEventListener("scroll",()=>{

const height=

document.documentElement.scrollHeight-

document.documentElement.clientHeight;

const progressValue=

(window.scrollY/height)*100;

progress.style.width=progressValue+"%";

});


/* ==========================================================
SMOOTH SCROLL
========================================================== */

document.querySelectorAll('a[href^="#"]').forEach(link=>{

link.onclick=(e)=>{

const target=document.querySelector(

link.getAttribute("href")

);

if(!target)return;

e.preventDefault();

target.scrollIntoView({

behavior:"smooth",

block:"start"

});

};

});


/* ==========================================================
LIVE ACTIVITY POPUP
========================================================== */

const activities=[

"Someone from Gomti Nagar booked a Demo",

"Class 10 Maths Tutor assigned",

"New NEET Tutor joined TutorNest",

"Student from Aliganj booked Home Tuition",

"Physics Demo completed",

"English Tutor became available"

];

function showActivity(){

let box=document.querySelector(".liveActivity");

if(box) box.remove();

box=document.createElement("div");

box.className="liveActivity";

box.innerHTML=`

<div class="liveAvatar">

<img
src="assets/images/default-user.png">

</div>

<div class="liveContent">

<h4>

${activities[Math.floor(Math.random()*activities.length)]}

</h4>

<p>

Verified just now

</p>

<div class="liveTime">

${new Date().toLocaleTimeString()}

</div>

</div>

`;

document.body.appendChild(box);

setTimeout(()=>{

box.remove();

},6000);

}

showActivity();

setInterval(showActivity,18000);
/* ==========================================================
FILE : js/homepage.js
PART 7 / 25
CONTINUE BELOW LIVE ACTIVITY
========================================================== */


/* ==========================================================
AUTO COUNTER ON SCROLL
========================================================== */

let counterStarted=false;

const statsSection=document.querySelector(".statsSection");

window.addEventListener("scroll",()=>{

if(!statsSection)return;

const top=statsSection.getBoundingClientRect().top;

if(top<window.innerHeight-150 && !counterStarted){

counterStarted=true;

animateCounter(studentCounter,3000);

animateCounter(teacherCounter,tutors.length||250);

animateCounter(demoCounter,1500);

}

});


/* ==========================================================
TUTOR SEARCH LIVE
========================================================== */

[classSearch,subjectSearch,areaSearch].forEach(input=>{

input.addEventListener("keyup",filterTutors);

input.addEventListener("change",filterTutors);

});

function filterTutors(){

const cls=classSearch.value.toLowerCase();

const subject=subjectSearch.value.toLowerCase();

const area=areaSearch.value.toLowerCase();

filteredTutors=tutors.filter(t=>{

const c=!cls ||

(t.classes||[])

.join(",")

.toLowerCase()

.includes(cls);

const s=!subject ||

(t.subjects||[])

.join(",")

.toLowerCase()

.includes(subject);

const a=!area ||

(t.area||"")

.toLowerCase()

.includes(area);

return c && s && a;

});

renderTutors(filteredTutors);

}
/* ==========================================================
FILE : js/homepage.js
PART 8 / 25
CONTINUE BELOW filterTutors()
========================================================== */


/* ==========================================================
LAZY IMAGE LOADING
========================================================== */

const imageObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

const img=entry.target;

img.src=img.dataset.src;

img.removeAttribute("data-src");

imageObserver.unobserve(img);

}

});

});

function lazyLoadImages(){

document

.querySelectorAll("img[data-src]")

.forEach(img=>{

imageObserver.observe(img);

});

}


/* ==========================================================
HEADER SHADOW
========================================================== */

window.addEventListener("scroll",()=>{

if(window.scrollY>10){

header.style.boxShadow=

"0 15px 35px rgba(0,0,0,.08)";

}else{

header.style.boxShadow="none";

}

});


/* ==========================================================
ACTIVE NAVIGATION
========================================================== */

const sections=document.querySelectorAll("section");

const navLinks=document.querySelectorAll("#navbar a");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const top=section.offsetTop-140;

if(window.scrollY>=top){

current=section.getAttribute("id");

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(

link.getAttribute("href")==="#"+current

){

link.classList.add("active");

}

});

});
/* ==========================================================
FILE : js/homepage.js
PART 9 / 25
CONTINUE BELOW ACTIVE NAVIGATION
========================================================== */


/* ==========================================================
NEWSLETTER
========================================================== */

const newsletterForm=document.querySelector(".newsletterForm");

if(newsletterForm){

newsletterForm.addEventListener("submit",e=>{

e.preventDefault();

const email=

newsletterForm.querySelector("input").value.trim();

if(email===""){

alert("Please enter email.");

return;

}

alert("Thanks for subscribing!");

newsletterForm.reset();

});

}


/* ==========================================================
CTA BUTTONS
========================================================== */

document.querySelectorAll(".ctaButton,.demoBtn").forEach(btn=>{

btn.addEventListener("click",()=>{

window.location.href="book-demo.html";

});

});


/* ==========================================================
BOOK TUTOR BUTTON
========================================================== */

document.addEventListener("click",e=>{

if(e.target.classList.contains("bookTutor")){

localStorage.setItem(

"selectedTutor",

e.target.href

);

}

});


/* ==========================================================
LOAD PAGE
========================================================== */

window.addEventListener("DOMContentLoaded",()=>{

loadFeaturedTutors();

lazyLoadImages();

});
/* ==========================================================
FILE : js/homepage.js
PART 10 / 25
CONTINUE BELOW DOMContentLoaded
========================================================== */


/* ==========================================================
TYPEWRITER EFFECT
========================================================== */

const heroTitle=document.querySelector(".heroContent h1");

if(heroTitle){

const originalText=heroTitle.innerHTML;

heroTitle.innerHTML="";

let index=0;

const typing=setInterval(()=>{

heroTitle.innerHTML=originalText.substring(0,index);

index++;

if(index>originalText.length){

clearInterval(typing);

}

},20);

}


/* ==========================================================
RANDOM TESTIMONIAL HIGHLIGHT
========================================================== */

const reviewCards=document.querySelectorAll(".reviewCard");

if(reviewCards.length){

setInterval(()=>{

reviewCards.forEach(card=>{

card.style.transform="scale(1)";

});

const random=

Math.floor(

Math.random()*reviewCards.length

);

reviewCards[random].style.transform="scale(1.03)";

},3000);

}


/* ==========================================================
COPY CONTACT NUMBER
========================================================== */

document.querySelectorAll(".copyNumber").forEach(btn=>{

btn.onclick=()=>{

navigator.clipboard.writeText(

btn.dataset.number

);

showToast(

"Phone Number Copied",

"success"

);

};

});
/* ==========================================================
FILE : js/homepage.js
PART 11 / 25
CONTINUE BELOW COPY CONTACT NUMBER
========================================================== */


/* ==========================================================
TOAST
========================================================== */

function showToast(message,type="success"){

const old=document.querySelector(".toast");

if(old) old.remove();

const toast=document.createElement("div");

toast.className=`toast ${type}`;

toast.innerHTML=`

<i class="fa-solid ${
type==="success"

?"fa-circle-check"

:type==="error"

?"fa-circle-xmark"

:"fa-circle-info"

}"></i>

<div>

<b>${message}</b>

</div>

`;

document.body.appendChild(toast);

setTimeout(()=>{

toast.remove();

},3000);

}


/* ==========================================================
COOKIE CONSENT
========================================================== */

if(!localStorage.getItem("cookieAccepted")){

const cookie=document.createElement("div");

cookie.className="cookieConsent show";

cookie.innerHTML=`

<h3>

Cookies 🍪

</h3>

<p>

TutorNest uses cookies to improve your experience.

</p>

<div class="cookieButtons">

<button class="cookieAccept">

Accept

</button>

<button class="cookieReject">

Later

</button>

</div>

`;

document.body.appendChild(cookie);

cookie.querySelector(".cookieAccept").onclick=()=>{

localStorage.setItem("cookieAccepted","yes");

cookie.remove();

};

cookie.querySelector(".cookieReject").onclick=()=>{

cookie.remove();

};

}
/* ==========================================================
FILE : js/homepage.js
PART 12 / 25
CONTINUE BELOW COOKIE CONSENT
========================================================== */


/* ==========================================================
MODAL
========================================================== */

function openModal(title,content){

let modal=document.querySelector(".modal");

if(modal) modal.remove();

modal=document.createElement("div");

modal.className="modal show";

modal.innerHTML=`

<div class="modalCard">

<div class="modalClose">

<i class="fa-solid fa-xmark"></i>

</div>

<h2 class="modalTitle">

${title}

</h2>

<div class="modalSubtitle">

${content}

</div>

</div>

`;

document.body.appendChild(modal);

modal.querySelector(".modalClose").onclick=()=>{

modal.remove();

};

modal.onclick=e=>{

if(e.target===modal){

modal.remove();

}

};

}


/* ==========================================================
CONTACT BUTTONS
========================================================== */

document.querySelectorAll(".contactBtn").forEach(btn=>{

btn.onclick=()=>{

openModal(

"Contact Tutor",

"After booking a demo, TutorNest will assign the best tutor to you within a few hours."

);

};

});


/* ==========================================================
WHATSAPP BUTTON
========================================================== */

document.querySelectorAll(".whatsappBtn").forEach(btn=>{

btn.onclick=()=>{

window.open(

"https://wa.me/919511119120",

"_blank"

);

};

});
/* ==========================================================
FILE : js/homepage.js
PART 13 / 25
CONTINUE BELOW WHATSAPP BUTTON
========================================================== */


/* ==========================================================
SEARCH SUGGESTIONS
========================================================== */

const suggestions=[
"Maths Tutor",
"Science Tutor",
"English Tutor",
"Physics Tutor",
"Chemistry Tutor",
"Biology Tutor",
"Home Tuition",
"Online Tuition",
"NEET",
"JEE",
"CUET",
"NDA"
];

const suggestionBox=document.createElement("ul");

suggestionBox.className="searchSuggestions";

subjectSearch.parentElement.appendChild(suggestionBox);

subjectSearch.addEventListener("input",()=>{

const value=subjectSearch.value.toLowerCase();

suggestionBox.innerHTML="";

if(value===""){

suggestionBox.classList.remove("active");

return;

}

const result=suggestions.filter(item=>

item.toLowerCase().includes(value)

);

if(result.length===0){

suggestionBox.classList.remove("active");

return;

}

suggestionBox.classList.add("active");

result.forEach(item=>{

const li=document.createElement("li");

li.innerHTML=`

<i class="fa-solid fa-magnifying-glass"></i>

${item}

`;

li.onclick=()=>{

subjectSearch.value=item;

suggestionBox.classList.remove("active");

filterTutors();

};

suggestionBox.appendChild(li);

});

});


document.addEventListener("click",e=>{

if(!subjectSearch.contains(e.target)){

suggestionBox.classList.remove("active");

}

});
/* ==========================================================
FILE : js/homepage.js
PART 14 / 25
CONTINUE BELOW SEARCH SUGGESTIONS
========================================================== */


/* ==========================================================
AUTO PLAY TESTIMONIALS
========================================================== */

const reviewContainer=document.querySelector(".reviewGrid");

if(reviewContainer){

let currentReview=0;

const reviews=document.querySelectorAll(".reviewCard");

setInterval(()=>{

reviews.forEach(card=>{

card.style.opacity=".5";

card.style.transform="scale(.96)";

});

reviews[currentReview].style.opacity="1";

reviews[currentReview].style.transform="scale(1.03)";

currentReview++;

if(currentReview>=reviews.length){

currentReview=0;

}

},2500);

}


/* ==========================================================
NUMBER COUNTER
========================================================== */

document.querySelectorAll("[data-count]").forEach(counter=>{

const target=parseInt(counter.dataset.count);

let value=0;

const speed=Math.ceil(target/80);

const timer=setInterval(()=>{

value+=speed;

if(value>=target){

value=target;

clearInterval(timer);

}

counter.innerHTML=value.toLocaleString()+"+";

},20);

});


/* ==========================================================
RIPPLE EFFECT
========================================================== */

document.querySelectorAll("button,.primaryBtn,.demoBtn,.bookTutor").forEach(btn=>{

btn.addEventListener("click",function(e){

const ripple=document.createElement("span");

const rect=this.getBoundingClientRect();

const size=Math.max(rect.width,rect.height);

ripple.style.width=size+"px";

ripple.style.height=size+"px";

ripple.style.left=(e.clientX-rect.left-size/2)+"px";

ripple.style.top=(e.clientY-rect.top-size/2)+"px";

ripple.className="ripple";

this.appendChild(ripple);

setTimeout(()=>{

ripple.remove();

},600);

});

});
/* ==========================================================
FILE : js/homepage.js
PART 15 / 25
CONTINUE BELOW RIPPLE EFFECT
========================================================== */


/* ==========================================================
RIPPLE CSS
========================================================== */

const rippleStyle=document.createElement("style");

rippleStyle.innerHTML=`

.ripple{

position:absolute;

border-radius:50%;

background:rgba(255,255,255,.45);

transform:scale(0);

animation:rippleAnimation .6s linear;

pointer-events:none;

}

@keyframes rippleAnimation{

to{

transform:scale(4);

opacity:0;

}

}

`;

document.head.appendChild(rippleStyle);


/* ==========================================================
CURRENT YEAR
========================================================== */

const year=document.getElementById("year");

if(year){

year.innerHTML=new Date().getFullYear();

}


/* ==========================================================
COPYRIGHT
========================================================== */

const copyright=document.querySelector(".copyright");

if(copyright){

copyright.innerHTML=

`© ${new Date().getFullYear()} TutorNest. All Rights Reserved.`;

}


/* ==========================================================
PAGE VISIT COUNTER
========================================================== */

let visits=

Number(localStorage.getItem("homepageVisits")||0);

visits++;

localStorage.setItem(

"homepageVisits",

visits

);

console.log(

"Homepage Visits:",

visits

);
/* ==========================================================
FILE : js/homepage.js
PART 16 / 25
CONTINUE BELOW PAGE VISIT COUNTER
========================================================== */


/* ==========================================================
NETWORK STATUS
========================================================== */

function updateNetworkStatus(){

if(navigator.onLine){

showToast(

"Connected to Internet",

"success"

);

}else{

showToast(

"No Internet Connection",

"error"

);

}

}

window.addEventListener(

"online",

updateNetworkStatus

);

window.addEventListener(

"offline",

updateNetworkStatus

);


/* ==========================================================
PAGE LOADER
========================================================== */

window.addEventListener("pageshow",()=>{

document.body.style.opacity="1";

});

window.addEventListener("beforeunload",()=>{

document.body.style.opacity=".95";

});


/* ==========================================================
IMAGE FALLBACK
========================================================== */

document.querySelectorAll("img").forEach(img=>{

img.onerror=()=>{

img.src="assets/images/default-user.png";

};

});


/* ==========================================================
DISABLE RIGHT CLICK ON LOGO
========================================================== */

document.querySelectorAll(".logo img").forEach(img=>{

img.addEventListener("contextmenu",e=>{

e.preventDefault();

});

});
/* ==========================================================
FILE : js/homepage.js
PART 17 / 25
CONTINUE BELOW DISABLE RIGHT CLICK
========================================================== */


/* ==========================================================
HERO PARALLAX
========================================================== */

const heroImage=document.querySelector(".heroImage");

window.addEventListener("mousemove",(e)=>{

if(!heroImage) return;

const x=(window.innerWidth/2-e.clientX)/40;

const y=(window.innerHeight/2-e.clientY)/40;

heroImage.style.transform=

`translate(${x}px,${y}px)`;

});


/* ==========================================================
BUTTON HOVER SOUND
========================================================== */

const hoverAudio=new Audio(

"assets/audio/hover.mp3"

);

hoverAudio.volume=.2;

document.querySelectorAll(

"button,a"

).forEach(btn=>{

btn.addEventListener("mouseenter",()=>{

try{

hoverAudio.currentTime=0;

hoverAudio.play();

}catch(err){}

});

});


/* ==========================================================
WELCOME MESSAGE
========================================================== */

setTimeout(()=>{

showToast(

"Welcome to TutorNest 🎉",

"success"

);

},1200);


/* ==========================================================
AUTO CLOSE MOBILE MENU
========================================================== */

window.addEventListener("resize",()=>{

if(window.innerWidth>992){

navbar.classList.remove("active");

}

});
/* ==========================================================
FILE : js/homepage.js
PART 18 / 25
CONTINUE BELOW AUTO CLOSE MOBILE MENU
========================================================== */


/* ==========================================================
LIVE CLOCK
========================================================== */

const clock=document.getElementById("liveClock");

if(clock){

setInterval(()=>{

const now=new Date();

clock.innerHTML=now.toLocaleTimeString();

},1000);

}


/* ==========================================================
TODAY DATE
========================================================== */

const today=document.getElementById("todayDate");

if(today){

today.innerHTML=new Date().toLocaleDateString(

"en-IN",

{

weekday:"long",

day:"numeric",

month:"long",

year:"numeric"

}

);

}


/* ==========================================================
AUTO HIDE NOTIFICATION
========================================================== */

document.querySelectorAll(".notificationBar").forEach(bar=>{

setTimeout(()=>{

bar.style.transition=".5s";

bar.style.opacity="0";

setTimeout(()=>{

bar.remove();

},500);

},10000);

});


/* ==========================================================
HEADER SEARCH SHORTCUT
========================================================== */

document.addEventListener("keydown",e=>{

if(e.key==="/" && document.activeElement.tagName!=="INPUT"){

e.preventDefault();

subjectSearch.focus();

}

});


/* ==========================================================
ESC CLOSE MENU
========================================================== */

document.addEventListener("keydown",e=>{

if(e.key==="Escape"){

navbar.classList.remove("active");

document.querySelector(".modal")?.remove();

}

});
/* ==========================================================
FILE : js/homepage.js
PART 19 / 25
CONTINUE BELOW ESC CLOSE MENU
========================================================== */


/* ==========================================================
DARK MODE
========================================================== */

const darkBtn=document.getElementById("darkModeBtn");

if(darkBtn){

if(localStorage.getItem("theme")==="dark"){

document.body.classList.add("dark");

}

darkBtn.onclick=()=>{

document.body.classList.toggle("dark");

localStorage.setItem(

"theme",

document.body.classList.contains("dark")

?"dark"

:"light"

);

};

}


/* ==========================================================
SCROLL TO SECTION
========================================================== */

document.querySelectorAll("[data-scroll]").forEach(btn=>{

btn.onclick=()=>{

const target=document.querySelector(

btn.dataset.scroll

);

if(target){

target.scrollIntoView({

behavior:"smooth"

});

}

};

});


/* ==========================================================
SEARCH RESET
========================================================== */

const resetBtn=document.getElementById("resetSearch");

if(resetBtn){

resetBtn.onclick=()=>{

classSearch.value="";

subjectSearch.value="";

areaSearch.value="";

filteredTutors=[...tutors];

renderTutors(filteredTutors);

};

}


/* ==========================================================
PAGE TITLE
========================================================== */

document.addEventListener(

"visibilitychange",

()=>{

if(document.hidden){

document.title="Come Back 😊 | TutorNest";

}else{

document.title="TutorNest | Home Tuition";

}

});
/* ==========================================================
FILE : js/homepage.js
PART 20 / 25
CONTINUE BELOW PAGE TITLE
========================================================== */


/* ==========================================================
WELCOME POPUP
========================================================== */

const firstVisit=

localStorage.getItem("tnWelcome");

if(!firstVisit){

setTimeout(()=>{

openModal(

"Welcome to TutorNest 🎉",

"Book a FREE Demo Class today and get India's best verified home tutor."

);

localStorage.setItem(

"tnWelcome",

"true"

);

},3000);

}


/* ==========================================================
AUTO HIGHLIGHT MENU
========================================================== */

window.addEventListener("scroll",()=>{

const scrollY=window.pageYOffset;

sections.forEach(section=>{

const top=section.offsetTop-150;

const height=section.offsetHeight;

const id=section.getAttribute("id");

if(

scrollY>=top &&

scrollY<top+height

){

navLinks.forEach(link=>{

link.classList.remove("active");

if(

link.getAttribute("href")==="#"+id

){

link.classList.add("active");

}

});

}

});

});


/* ==========================================================
SEARCH ENTER
========================================================== */

[classSearch,

subjectSearch,

areaSearch]

.forEach(input=>{

input.addEventListener(

"keypress",

e=>{

if(e.key==="Enter"){

e.preventDefault();

filterTutors();

}

}

);

});


/* ==========================================================
CONSOLE MESSAGE
========================================================== */

console.log(

"%cTutorNest",

"font-size:28px;color:#2563eb;font-weight:bold"

);

console.log(

"Developed with ❤️ by Shivang Singh"

);
/* ==========================================================
FILE : js/homepage.js
PART 21 / 25
CONTINUE BELOW CONSOLE MESSAGE
========================================================== */


/* ==========================================================
AUTO REFRESH FEATURED TUTORS
========================================================== */

setInterval(async()=>{

try{

const q=query(

collection(db,"tutors"),

where("status","==","Approved"),

where("featured","==",true),

limit(6)

);

const snap=await getDocs(q);

tutors=[];

snap.forEach(doc=>{

tutors.push({

id:doc.id,

...doc.data()

});

});

renderTutors(tutors);

}catch(err){

console.log(err);

}

},300000);


/* ==========================================================
RANDOM HERO BADGE
========================================================== */

const heroBadge=document.querySelector(".badge");

if(heroBadge){

const badges=[

"🎯 100% Verified Tutors",

"⭐ 5000+ Happy Students",

"🏆 India's Trusted Platform",

"📚 Free Demo Class",

"👨‍🏫 Professional Tutors"

];

heroBadge.innerHTML=

badges[Math.floor(Math.random()*badges.length)];

}


/* ==========================================================
WINDOW FOCUS
========================================================== */

window.addEventListener("focus",()=>{

console.log("User Returned");

});


window.addEventListener("blur",()=>{

console.log("User Left");

});
/* ==========================================================
FILE : js/homepage.js
PART 22 / 25
CONTINUE BELOW WINDOW FOCUS
========================================================== */


/* ==========================================================
SAVE LAST VISIT
========================================================== */

localStorage.setItem(

"lastVisit",

new Date().toLocaleString()

);

const lastVisit=

localStorage.getItem("lastVisit");

if(lastVisit){

console.log(

"Last Visit:",

lastVisit

);

}


/* ==========================================================
ONLINE / OFFLINE BADGE
========================================================== */

const onlineBadge=document.createElement("div");

onlineBadge.style.position="fixed";

onlineBadge.style.left="20px";

onlineBadge.style.top="20px";

onlineBadge.style.padding="10px 16px";

onlineBadge.style.borderRadius="50px";

onlineBadge.style.background="#22c55e";

onlineBadge.style.color="#fff";

onlineBadge.style.fontWeight="600";

onlineBadge.style.zIndex="99999";

onlineBadge.style.display="none";

document.body.appendChild(onlineBadge);

function networkBadge(){

onlineBadge.style.display="block";

if(navigator.onLine){

onlineBadge.innerHTML="🟢 Online";

onlineBadge.style.background="#22c55e";

}else{

onlineBadge.innerHTML="🔴 Offline";

onlineBadge.style.background="#ef4444";

}

setTimeout(()=>{

onlineBadge.style.display="none";

},2500);

}

window.addEventListener("online",networkBadge);

window.addEventListener("offline",networkBadge);


/* ==========================================================
AUTO SCROLL TO HASH
========================================================== */

if(location.hash){

const target=document.querySelector(location.hash);

if(target){

setTimeout(()=>{

target.scrollIntoView({

behavior:"smooth"

});

},400);

}

}


/* ==========================================================
PAGE READY
========================================================== */

console.log(

"Homepage Loaded Successfully."

);
/* ==========================================================
FILE : js/homepage.js
PART 23 / 25
CONTINUE BELOW PAGE READY
========================================================== */


/* ==========================================================
AUTO ROTATING HERO TEXT
========================================================== */

const rotatingText=document.getElementById("rotatingText");

if(rotatingText){

const words=[

"Home Tutors",

"Online Tutors",

"NEET Experts",

"JEE Faculty",

"School Teachers",

"Competitive Mentors"

];

let index=0;

setInterval(()=>{

rotatingText.style.opacity="0";

setTimeout(()=>{

index++;

if(index>=words.length){

index=0;

}

rotatingText.innerHTML=words[index];

rotatingText.style.opacity="1";

},300);

},2500);

}


/* ==========================================================
COPY PROMO CODE
========================================================== */

document.querySelectorAll(".copyPromo").forEach(btn=>{

btn.onclick=()=>{

navigator.clipboard.writeText(

btn.dataset.code

);

showToast(

"Promo Code Copied",

"success"

);

};

});


/* ==========================================================
EXIT POPUP
========================================================== */

let exitShown=false;

document.addEventListener("mouseout",e=>{

if(

e.clientY<=0 &&

!exitShown

){

exitShown=true;

openModal(

"Wait! 🎁",

"Book your FREE Demo Class today and get priority tutor assignment."

);

}

});


/* ==========================================================
AUTO OPEN BOOK DEMO
========================================================== */

document.querySelectorAll(".bookDemoNow").forEach(btn=>{

btn.onclick=()=>{

window.location.href="book-demo.html";

};

});
/* ==========================================================
FILE : js/homepage.js
PART 24 / 25
CONTINUE BELOW AUTO OPEN BOOK DEMO
========================================================== */


/* ==========================================================
AUTO HIDE LIVE ACTIVITY
========================================================== */

setInterval(()=>{

const activity=document.querySelector(".liveActivity");

if(activity){

activity.style.opacity="0";

activity.style.transform="translateY(20px)";

setTimeout(()=>{

activity.remove();

},500);

}

},25000);


/* ==========================================================
PAGE PERFORMANCE
========================================================== */

window.addEventListener("load",()=>{

const loadTime=

performance.now()/1000;

console.log(

`Homepage Loaded in ${loadTime.toFixed(2)} sec`

);

});


/* ==========================================================
DETECT MOBILE
========================================================== */

const isMobile=

/Android|iPhone|iPad|iPod/i.test(

navigator.userAgent

);

if(isMobile){

document.body.classList.add("mobile");

}


/* ==========================================================
AUTO FOCUS SEARCH
========================================================== */

setTimeout(()=>{

if(window.innerWidth>992){

subjectSearch?.focus();

}

},1500);


/* ==========================================================
BOOK DEMO SHORTCUT
========================================================== */

document.addEventListener("keydown",(e)=>{

if(e.altKey && e.key.toLowerCase()==="b"){

window.location.href="book-demo.html";

}

});


/* ==========================================================
PRELOAD IMPORTANT IMAGES
========================================================== */

[
"assets/logo/logo.png",
"assets/images/default-user.png",
"assets/images/mobile-app.png"
].forEach(src=>{

const img=new Image();

img.src=src;

});


/* ==========================================================
END INIT
========================================================== */

console.log("Homepage initialized...");
/* ==========================================================
FILE : js/homepage.js
PART 25 / 25 (FINAL)
CONTINUE BELOW END INIT
========================================================== */


/* ==========================================================
SERVICE WORKER
========================================================== */


/* ==========================================================
FIREBASE CONNECTIVITY CHECK
========================================================== */

async function checkFirebase(){

try{

await getDocs(

query(

collection(db,"tutors"),

limit(1)

)

);

console.log(

"Firebase Connected"

);

}catch(error){

console.error(

"Firebase Error",

error

);

showToast(

"Unable to connect to server",

"error"

);

}

}


/* ==========================================================
INITIALIZE WEBSITE
========================================================== */

async function initializeHomepage(){

await checkFirebase();

await loadFeaturedTutors();

lazyLoadImages();

filterTutors();

console.log(

"TutorNest Homepage Ready"

);

}

initializeHomepage();


/* ==========================================================
GLOBAL FUNCTIONS
========================================================== */

window.showToast=showToast;

window.openModal=openModal;

window.filterTutors=filterTutors;


/* ==========================================================
DEBUG MODE
========================================================== */

const DEBUG=false;

if(DEBUG){

console.table(tutors);

console.log(filteredTutors);

}


/* ==========================================================
VERSION
========================================================== */

console.log(

"%cTutorNest v1.0",

"background:#2563eb;color:white;padding:6px 12px;border-radius:5px;font-weight:bold;"

);

console.log(

"© TutorNest Technologies"

);


/* ==========================================================
END OF FILE
js/homepage.js
========================================================== */