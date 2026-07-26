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

const profileForm = document.getElementById("profileForm");
const emailInput = document.getElementById("email");

let currentUser = null;

// ===============================
// CHECK LOGIN
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    emailInput.value = user.email;

    loadProfile(user.uid);

});
async function loadProfile(uid){

    const docRef = doc(db, "tutors", uid);

    const snap = await getDoc(docRef);

    if(!snap.exists()) return;

    const data = snap.data();

    document.getElementById("name").value = data.name || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("dob").value = data.dob || "";
    document.getElementById("qualification").value = data.qualification || "";
    document.getElementById("college").value = data.college || "";
    document.getElementById("experience").value = data.experience || "";
    document.getElementById("about").value = data.about || "";
    document.getElementById("area").value = data.area || "";
    document.getElementById("pincode").value = data.pincode || "";
    document.getElementById("availability").value = data.availability || "";
    document.getElementById("timeSlot").value = data.timeSlot || "";

}
const container = document.getElementById("subjectFeeContainer");

const addBtn = document.getElementById("addSubjectBtn");

addBtn.addEventListener("click",()=>{

const row=document.createElement("div");

row.className="subject-fee-row";

row.innerHTML=`

<select class="subject-select">

<option value="">Select Subject</option>

<option>Mathematics</option>
<option>Physics</option>
<option>Chemistry</option>
<option>Biology</option>
<option>English</option>
<option>Hindi</option>
<option>Computer Science</option>
<option>Economics</option>
<option>Accounts</option>
<option>Business Studies</option>
<option>Other</option>

</select>

<input
type="number"
class="subject-fee"
placeholder="Monthly Fee">

<button
type="button"
class="remove-row">

<i class="fa-solid fa-trash"></i>

</button>

`;

container.appendChild(row);

});

container.addEventListener("click",(e)=>{

if(e.target.closest(".remove-row")){

const rows=document.querySelectorAll(".subject-fee-row");

if(rows.length>1){

e.target.closest(".subject-fee-row").remove();

}

}

});
// ===============================
// FILE UPLOAD
// ===============================

async function uploadFile(file, folder) {

    if (!file) return "";

    const storageRef = ref(
        storage,
        `${folder}/${currentUser.uid}/${Date.now()}_${file.name}`
    );

    await uploadBytes(storageRef, file);

    return await getDownloadURL(storageRef);

}

// ===============================
// SAVE PROFILE
// ===============================

profileForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const photo = document.getElementById("photo").files[0];
        const aadhaar = document.getElementById("aadhaar").files[0];
        const certificate = document.getElementById("certificate").files[0];

        const photoURL = await uploadFile(photo, "profilePhotos");
        const aadhaarURL = await uploadFile(aadhaar, "aadhaar");
        const certificateURL = await uploadFile(certificate, "certificates");

        // -----------------------------
        // Subjects + Fees
        // -----------------------------

        const teaching = [];

        document.querySelectorAll(".subject-fee-row").forEach(row => {

            const subject = row.querySelector(".subject-select").value;
            const fee = row.querySelector(".subject-fee").value;

            if (subject && fee) {

                teaching.push({
                    subject,
                    monthlyFee: Number(fee)
                });

            }

        });

        // -----------------------------
        // Classes
        // -----------------------------

        const classes = [...document.querySelectorAll("input[name='classes']:checked")]
            .map(item => item.value);

        // -----------------------------
        // Languages
        // -----------------------------

        const languages = [...document.querySelectorAll("input[name='languages']:checked")]
            .map(item => item.value);

        // -----------------------------
        // Teaching Mode
        // -----------------------------

        const teachingMode =
            document.querySelector("input[name='mode']:checked").value;

        // -----------------------------
        // Preserve Existing Status
        // -----------------------------

        const tutorRef = doc(db, "tutors", currentUser.uid);

        const oldSnap = await getDoc(tutorRef);

        let status = "Pending";

        if (oldSnap.exists()) {
            status = oldSnap.data().status || "Pending";
        }

        // -----------------------------
        // Save Firestore
        // -----------------------------

        await setDoc(
            tutorRef,
            {
                uid: currentUser.uid,

                email: currentUser.email,

                name: document.getElementById("name").value,

                phone: document.getElementById("phone").value,

                dob: document.getElementById("dob").value,

                qualification:
                    document.getElementById("qualification").value,

                college:
                    document.getElementById("college").value,

                experience: Number(
                    document.getElementById("experience").value || 0
                ),

                about:
                    document.getElementById("about").value,

                area:
                    document.getElementById("area").value,

                pincode:
                    document.getElementById("pincode").value,

                availability:
                    document.getElementById("availability").value,

                timeSlot:
                    document.getElementById("timeSlot").value,

                teaching,

                classes,

                languages,

                teachingMode,

                photoURL,

                aadhaarURL,

                certificateURL,

                status,

                updatedAt: serverTimestamp(),

                createdAt: oldSnap.exists()
                    ? oldSnap.data().createdAt
                    : serverTimestamp()

            },
            { merge: true }
        );

        alert("Profile saved successfully!");

        window.location.href = "dashboard.html";

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

});
