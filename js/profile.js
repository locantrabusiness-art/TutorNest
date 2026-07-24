import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
doc,
getDoc,
updateDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const form = document.getElementById("profileForm");

const saveBtn = document.getElementById("saveBtn");

const preview = document.getElementById("preview");

const photoInput = document.getElementById("photo");

const progressBar = document.getElementById("progressBar");

const progressText = document.getElementById("progressText");

let currentUser = null;

let currentPhoto = "";

// ---------------------
// Image Preview
// ---------------------

photoInput.addEventListener("change", () => {

    const file = photoInput.files[0];

    if (!file) return;

    preview.src = URL.createObjectURL(file);

    updateProgress();

});

// ---------------------
// Checkbox Helpers
// ---------------------

function getCheckedValues(name){

return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
.map(item=>item.value);

}

function setCheckedValues(name,values=[]){

document.querySelectorAll(`input[name="${name}"]`).forEach(item=>{

item.checked=values.includes(item.value);

});

}

// ---------------------
// Progress Bar
// ---------------------

function updateProgress(){

let total=13;

let filled=0;

if(document.getElementById("name").value.trim()) filled++;
if(document.getElementById("phone").value.trim()) filled++;
if(document.getElementById("gender").value) filled++;
if(document.getElementById("qualification").value) filled++;
if(document.getElementById("experience").value) filled++;
if(document.getElementById("city").value.trim()) filled++;
if(document.getElementById("area").value.trim()) filled++;
if(document.getElementById("fees").value) filled++;
if(document.getElementById("about").value.trim()) filled++;
if(phone.value.trim())filled++;

if(gender.value)filled++;

if(qualification.value)filled++;

if(experience.value)filled++;

if(city.value.trim())filled++;

if(area.value.trim())filled++;

if(fees.value)filled++;

if(about.value.trim())filled++;

if(getCheckedValues("subjects").length)filled++;

if(getCheckedValues("classes").length)filled++;

if(getCheckedValues("mode").length)filled++;

if(currentPhoto || photoInput.files.length)filled++;

const percent=Math.round((filled/total)*100);

progressBar.style.width=percent+"%";

progressText.innerText=percent+"% Complete";

}

document.querySelectorAll("input,select,textarea").forEach(el=>{

el.addEventListener("input",updateProgress);

el.addEventListener("change",updateProgress);

});

// ---------------------
// Upload ImageKit
// ---------------------

async function uploadProfilePhoto(){

const file=photoInput.files[0];

if(!file){

return currentPhoto;

}

const authRes=await fetch("/api/imagekit-auth");

const authData=await authRes.json();

const formData=new FormData();

formData.append("file",file);

formData.append("fileName",Date.now()+"-"+file.name);

formData.append("publicKey","public_kKdD/tl6716JICjya52hltPI3kM=");

formData.append("token",authData.token);

formData.append("expire",authData.expire);

formData.append("signature",authData.signature);

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

// ---------------------
// Load Tutor
// ---------------------

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="tutor-login.html";

return;

}

currentUser=user;

const snap=await getDoc(doc(db,"tutors",user.uid));

if(!snap.exists()) return;

const data=snap.data();

name.value=data.name||"";

phone.value=data.phone||"";

gender.value=data.gender||"";

qualification.value=data.qualification||"";

experience.value=data.experience||"";

city.value=data.city||"";

area.value=data.area||"";

fees.value=data.fees||"";

about.value=data.about||"";

demoAvailable.checked=data.demoAvailable||false;

setCheckedValues("subjects",data.subjects||[]);

setCheckedValues("classes",data.classes||[]);

setCheckedValues("board",data.board||[]);

setCheckedValues("mode",data.mode||[]);

setCheckedValues("languages",data.languages||[]);

if(data.photo){

currentPhoto=data.photo;

preview.src=data.photo;

}

updateProgress();

});
// ---------------------
// Save Profile
// ---------------------

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    saveBtn.disabled = true;
    saveBtn.innerHTML = "Saving...";

    try {

        const phone = document.getElementById("phone").value.trim();

        if (phone && !/^[6-9]\d{9}$/.test(phone)) {
            alert("Enter a valid 10 digit mobile number.");
            saveBtn.disabled = false;
            saveBtn.innerHTML = "💾 Save Profile";
            return;
        }

        const photoUrl = await uploadProfilePhoto();

        const updateData = {

            name: document.getElementById("name").value.trim(),

            phone: phone,

            gender: document.getElementById("gender").value,

            qualification: document.getElementById("qualification").value,

            experience: document.getElementById("experience").value,

            city: document.getElementById("city").value.trim(),

            area: document.getElementById("area").value.trim(),

            fees: Number(document.getElementById("fees").value) || 0,

            about: document.getElementById("about").value.trim(),

            subjects: getCheckedValues("subjects"),

            classes: getCheckedValues("classes"),

            board: getCheckedValues("board"),

            mode: getCheckedValues("mode"),

            languages: getCheckedValues("languages"),

            demoAvailable:
                document.getElementById("demoAvailable").checked,

            updatedAt: serverTimestamp()

        };

        if (photoUrl) {
            updateData.photo = photoUrl;
            currentPhoto = photoUrl;
        }

        await updateDoc(

            doc(db, "tutors", currentUser.uid),

            updateData

        );

        updateProgress();

        alert("✅ Profile Updated Successfully!");

    }

    catch (error) {

        console.error(error);

        alert(error.message || "Something went wrong.");

    }

    finally {

        saveBtn.disabled = false;

        saveBtn.innerHTML = "💾 Save Profile";

    }

});

// ---------------------
// Live Progress
// ---------------------

document.querySelectorAll("input,select,textarea").forEach(el => {

    el.addEventListener("input", updateProgress);

    el.addEventListener("change", updateProgress);

});

updateProgress();