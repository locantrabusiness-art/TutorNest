document.getElementById("tutorForm").addEventListener("submit",function(e){

e.preventDefault();

let msg=`*New Tutor Requirement*%0A%0A

Student : ${studentName.value}%0A

Parent : ${parentName.value}%0A

Mobile : ${mobile.value}%0A

Age : ${age.value}%0A

Class : ${document.getElementById("class").value}%0A

Tutor : ${tutor.value}%0A

Gender Preference : ${gender.value}%0A

Subjects : ${subjects.value}%0A

Address : ${address.value}`;

window.open(`https://wa.me/919511119120?text=${msg}`);

});
// Navbar shadow on scroll

window.addEventListener("scroll",()=>{

const header=document.querySelector("header");

if(window.scrollY>30){

header.classList.add("active");

}else{

header.classList.remove("active");

}

});
const search=document.getElementById("searchTutor");

search.addEventListener("keyup",()=>{

const value=search.value.toLowerCase();

document.querySelectorAll(".teacher-card").forEach(card=>{

const text=card.innerText.toLowerCase();

card.style.display=text.includes(value)?"block":"none";

});

});