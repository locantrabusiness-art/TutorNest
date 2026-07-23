import { auth, db } from "./firebase.js";

import {
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
doc,
setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const form=document.getElementById("registerForm");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const name=document.getElementById("name").value;
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;
const phone=document.getElementById("phone").value;
const qualification=document.getElementById("qualification").value;

try{

const userCredential=await createUserWithEmailAndPassword(auth,email,password);

await setDoc(doc(db,"tutors",userCredential.user.uid),{

name,
email,
phone,
qualification,
createdAt:new Date(),
status:"Pending"

});

alert("Registration Successful");

window.location.href="tutor-login.html";

}catch(err){

alert(err.message);

}

});