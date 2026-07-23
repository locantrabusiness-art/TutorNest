import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const teacherTable = document.getElementById("teacherTable");
const searchBox = document.getElementById("searchBox");
const filterStatus = document.getElementById("filterStatus");

let tutors = [];

async function loadTutors() {

    const snap = await getDocs(collection(db, "tutors"));

    tutors = [];

    snap.forEach((d)=>{

        tutors.push({
            id:d.id,
            ...d.data()
        });

    });

    updateCounters();

    renderTutors();

}

function updateCounters(){

    document.getElementById("totalTutors").innerText=tutors.length;

    document.getElementById("pendingTutors").innerText=
        tutors.filter(t=>t.status==="pending").length;

    document.getElementById("approvedTutors").innerText=
        tutors.filter(t=>t.status==="approved").length;

    document.getElementById("featuredTutors").innerText=
        tutors.filter(t=>t.featured===true).length;

}

function renderTutors(){

    teacherTable.innerHTML="";

    let filtered=tutors.filter(t=>{

        const search=searchBox.value.toLowerCase();

        const matchSearch=
        (t.name||"").toLowerCase().includes(search) ||
        (t.email||"").toLowerCase().includes(search) ||
        (t.phone||"").includes(search);

        const matchStatus=
        filterStatus.value==="" ||
        t.status===filterStatus.value;

        return matchSearch && matchStatus;

    });

    filtered.forEach(t=>{

        teacherTable.innerHTML+=`

<tr>

<td>

<img src="${t.photo || 'https://via.placeholder.com/60'}"
style="width:60px;height:60px;border-radius:50%;object-fit:cover;">

</td>

<td>${t.name}</td>

<td>${t.email}</td>

<td>${t.phone || "-"}</td>

<td>${t.status}</td>

<td>${t.visibleOnWebsite ? "Yes":"No"}</td>

<td>${t.featured ? "Yes":"No"}</td>

<td>

<button class="approve"
onclick="approveTutor('${t.id}')">

Approve

</button>

<button class="reject"
onclick="rejectTutor('${t.id}')">

Reject

</button>

<button class="show"
onclick="toggleVisible('${t.id}',${t.visibleOnWebsite})">

${t.visibleOnWebsite?"Hide":"Show"}

</button>

<button class="feature"
onclick="toggleFeatured('${t.id}',${t.featured})">

${t.featured?"Unfeature":"Feature"}

</button>

<button class="delete"
onclick="deleteTutor('${t.id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

window.approveTutor=async(id)=>{

    await updateDoc(doc(db,"tutors",id),{

        status:"approved"

    });

    loadTutors();

}

window.rejectTutor=async(id)=>{

    await updateDoc(doc(db,"tutors",id),{

        status:"rejected"

    });

    loadTutors();

}

window.toggleVisible=async(id,current)=>{

    await updateDoc(doc(db,"tutors",id),{

        visibleOnWebsite:!current

    });

    loadTutors();

}

window.toggleFeatured=async(id,current)=>{

    await updateDoc(doc(db,"tutors",id),{

        featured:!current

    });

    loadTutors();

}

window.deleteTutor=async(id)=>{

    if(confirm("Delete this tutor?")){

        await deleteDoc(doc(db,"tutors",id));

        loadTutors();

    }

}

searchBox.addEventListener("keyup",renderTutors);

filterStatus.addEventListener("change",renderTutors);

loadTutors();