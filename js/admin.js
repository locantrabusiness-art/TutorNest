import { auth, db } from "./firebase.js";
import {
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";



import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const ADMIN_EMAIL = "shivangsingh0009@gmail.com";

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }

    if (user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        window.location.href = "admin-login.html";
        return;
    }

    // ✅ Admin verified, ab Firestore se data load karo
    loadTutors();

});



const pendingList = document.getElementById("pendingList");
const approvedList = document.getElementById("approvedList");
const rejectedList = document.getElementById("rejectedList");

const totalTutors = document.getElementById("totalTutors");
const pendingTutors = document.getElementById("pendingTutors");
const approvedTutors = document.getElementById("approvedTutors");
const featuredTutors = document.getElementById("featuredTutors");

const searchInput = document.getElementById("searchInput");
document.getElementById("logoutBtn").onclick = async () => {

    await signOut(auth);

    window.location.href = "admin-login.html";

};
let tutors = [];


async function loadTutors(){

    const snap = await getDocs(collection(db,"tutors"));

    tutors = [];

    snap.forEach(docSnap=>{

        tutors.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

    updateStats();

    renderAll();

}

function updateStats(){

    totalTutors.textContent = tutors.length;

    pendingTutors.textContent =
        tutors.filter(x=>x.status==="Pending").length;

    approvedTutors.textContent =
        tutors.filter(x=>x.status==="Approved").length;

    featuredTutors.textContent =
        tutors.filter(x=>x.featured===true).length;

}

function renderAll(){

    const keyword =
        searchInput.value.toLowerCase();

    pendingList.innerHTML="";
    approvedList.innerHTML="";
    rejectedList.innerHTML="";

    tutors.forEach(tutor=>{

        if(
            keyword &&
            !(tutor.name||"")
            .toLowerCase()
            .includes(keyword)
        ){
            return;
        }

        const card = createCard(tutor);

        if(tutor.status==="Pending")
            pendingList.appendChild(card);

        else if(tutor.status==="Approved")
            approvedList.appendChild(card);

        else
            rejectedList.appendChild(card);

    });

}

searchInput.addEventListener(
    "input",
    renderAll
);
function createCard(tutor){

    const div=document.createElement("div");

    div.className="tutor-card";

    div.innerHTML=`

    <img src="${tutor.photo || 'assets/logo/logo.png'}">

    <h3>${tutor.name}</h3>

    <p><b>Qualification:</b> ${tutor.qualification || "-"}</p>

    <p><b>Subjects:</b> ${(tutor.subjects || []).join(", ")}</p>

    <p><b>Area:</b> ${tutor.area || "-"}</p>

    <p><b>Status:</b> ${tutor.status}</p>

    <div class="actions">

    ${
        tutor.status==="Pending"
        ?
        `
        <button class="approve"
        onclick="approveTutor('${tutor.id}')">
        Approve
        </button>

        <button class="reject"
        onclick="rejectTutor('${tutor.id}')">
        Reject
        </button>
        `
        :
        ""
    }

    ${
        tutor.status==="Approved"
        ?
        tutor.featured
        ?
        `
        <button class="remove"
        onclick="removeFeatured('${tutor.id}')">
        Remove Featured
        </button>
        `
        :
        `
        <button class="feature"
        onclick="featureTutor('${tutor.id}')">
        Feature
        </button>
        `
        :
        ""
    }

    <button class="delete"
    onclick="deleteTutor('${tutor.id}')">

    Delete

    </button>

    </div>

    `;

    return div;

}
// ----------------------
// Approve Tutor
// ----------------------

window.approveTutor = async function(id){

    try{

        await updateDoc(
            doc(db,"tutors",id),
            {
                status:"Approved"
            }
        );

        await loadTutors();

    }

    catch(err){

        console.error(err);

        alert("Unable to approve tutor.");

    }

};


// ----------------------
// Reject Tutor
// ----------------------

window.rejectTutor = async function(id){

    try{

        await updateDoc(
            doc(db,"tutors",id),
            {
                status:"Rejected"
            }
        );

        await loadTutors();

    }

    catch(err){

        console.error(err);

        alert("Unable to reject tutor.");

    }

};


// ----------------------
// Feature Tutor
// ----------------------

window.featureTutor = async function(id){

    try{

        await updateDoc(
            doc(db,"tutors",id),
            {
                featured:true
            }
        );

        await loadTutors();

    }

    catch(err){

        console.error(err);

        alert("Unable to feature tutor.");

    }

};


// ----------------------
// Remove Featured
// ----------------------

window.removeFeatured = async function(id){

    try{

        await updateDoc(
            doc(db,"tutors",id),
            {
                featured:false
            }
        );

        await loadTutors();

    }

    catch(err){

        console.error(err);

        alert("Unable to remove featured tutor.");

    }

};


// ----------------------
// Delete Tutor
// ----------------------

window.deleteTutor = async function(id){

    const ok = confirm(
        "Delete this tutor permanently?"
    );

    if(!ok) return;

    try{

        await deleteDoc(
            doc(db,"tutors",id)
        );

        await loadTutors();

    }

    catch(err){

        console.error(err);

        alert("Unable to delete tutor.");

    }

};

