import { auth, db } from "../firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const tbody = document.getElementById("tutorTableBody");

const totalTutors = document.getElementById("totalTutors");
const approvedTutors = document.getElementById("approvedTutors");
const pendingTutors = document.getElementById("pendingTutors");
const rejectedTutors = document.getElementById("rejectedTutors");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

let tutors = [];
onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";
        return;

    }

    const adminRef=doc(db,"admins",user.uid);

    const adminSnap=await getDoc(adminRef);

    if(!adminSnap.exists()){

        alert("Unauthorized Access");

        window.location.href="index.html";

        return;

    }

    loadTutors();

});
async function loadTutors(){

    const snapshot=await getDocs(collection(db,"tutors"));

    tutors=[];

    snapshot.forEach(docItem=>{

        tutors.push({

            id:docItem.id,

            ...docItem.data()

        });

    });

    updateStats();

    renderTable(tutors);

}
function updateStats(){

    totalTutors.textContent=tutors.length;

    approvedTutors.textContent=tutors.filter(
        t=>t.status==="Approved"
    ).length;

    pendingTutors.textContent=tutors.filter(
        t=>t.status==="Pending"
    ).length;

    rejectedTutors.textContent=tutors.filter(
        t=>t.status==="Rejected"
    ).length;

}
function renderTable(data){

tbody.innerHTML="";

data.forEach(tutor=>{

tbody.innerHTML+=`

<tr>

<td>

<img src="${tutor.photoURL || 'images/default-user.png'}">

</td>

<td>${tutor.name || "-"}</td>

<td>${tutor.area || "-"}</td>

<td>${tutor.qualification || "-"}</td>

<td>${tutor.status || "-"}</td>

<td>

<button
class="action-btn view-btn"
data-id="${tutor.id}">

View

</button>

<button
class="action-btn approve-btn"
data-id="${tutor.id}">

Approve

</button>

<button
class="action-btn reject-btn"
data-id="${tutor.id}">

Reject

</button>

<button
class="action-btn delete-btn"
data-id="${tutor.id}">

Delete

</button>

</td>

</tr>

`;

});

}
function renderTable(data){

tbody.innerHTML="";

data.forEach(tutor=>{

tbody.innerHTML+=`

<tr>

<td>

<img src="${tutor.photoURL || 'images/default-user.png'}">

</td>

<td>${tutor.name || "-"}</td>

<td>${tutor.area || "-"}</td>

<td>${tutor.qualification || "-"}</td>

<td>${tutor.status || "-"}</td>

<td>

<button
class="action-btn view-btn"
data-id="${tutor.id}">

View

</button>

<button
class="action-btn approve-btn"
data-id="${tutor.id}">

Approve

</button>

<button
class="action-btn reject-btn"
data-id="${tutor.id}">

Reject

</button>

<button
class="action-btn delete-btn"
data-id="${tutor.id}">

Delete

</button>

</td>

</tr>

`;

});

}
