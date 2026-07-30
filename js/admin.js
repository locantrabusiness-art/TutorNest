//=============================
// TutorNest Admin Dashboard
// Part 1
//=============================

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

const logoutBtn = document.getElementById("logoutBtn");

const modal = document.getElementById("viewModal");

let tutors = [];
let filteredTutors = [];

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        location.href = "admin-login.html";
        return;
    }

    const adminSnap = await getDoc(doc(db, "admins", user.uid));

    if (!adminSnap.exists()) {

        alert("Unauthorized Access");

        await signOut(auth);

        location.href = "admin-login.html";

        return;
    }

    loadTutors();

});

async function loadTutors() {

    tutors = [];

    const snapshot = await getDocs(collection(db, "tutors"));

    snapshot.forEach((docSnap) => {

        tutors.push({

            id: docSnap.id,

            ...docSnap.data()

        });

    });

    filteredTutors = [...tutors];

    updateStats();

    renderTable(filteredTutors);

}

function updateStats() {

    totalTutors.textContent = tutors.length;

    approvedTutors.textContent =
        tutors.filter(t => t.status === "Approved").length;

    pendingTutors.textContent =
        tutors.filter(t => t.status === "Pending").length;

    rejectedTutors.textContent =
        tutors.filter(t => t.status === "Rejected").length;

}

function renderTable(data) {

    tbody.innerHTML = "";

    if (data.length === 0) {

        tbody.innerHTML = `

<tr>

<td colspan="6" style="text-align:center;padding:30px;">
No Tutors Found
</td>

</tr>

`;

        return;

    }

    data.forEach((tutor) => {

        tbody.innerHTML += `

<tr>

<td>

<img
src="${tutor.photoURL || "assets/images/default-user.png"}"
style="width:55px;height:55px;border-radius:50%;object-fit:cover;">

</td>

<td>${tutor.name || "-"}</td>

<td>${tutor.area || "-"}</td>

<td>${tutor.qualification || "-"}</td>

<td>

<span class="status ${tutor.status}">

${tutor.status || "Pending"}

</span>

</td>

<td>

<button
class="view-btn"
data-id="${tutor.id}">

View

</button>

<button
class="approve-btn"
data-id="${tutor.id}">

Approve

</button>

<button
class="reject-btn"
data-id="${tutor.id}">

Reject

</button>

<button
class="feature-btn"
data-id="${tutor.id}">

${tutor.featured ? "Unfeature" : "Feature"}

</button>

<button
class="delete-btn"
data-id="${tutor.id}">

Delete

</button>

</td>

</tr>

`;

    });

}
//=============================
// TutorNest Admin Dashboard
// Part 2
//=============================

tbody.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (!id) return;

    const tutor = tutors.find(t => t.id === id);

    if (!tutor) return;

    // =====================
    // APPROVE
    // =====================

    if (e.target.classList.contains("approve-btn")) {

        await updateDoc(doc(db, "tutors", id), {

            status: "Approved"

        });

        loadTutors();

        return;

    }

    // =====================
    // REJECT
    // =====================

    if (e.target.classList.contains("reject-btn")) {

        await updateDoc(doc(db, "tutors", id), {

            status: "Rejected"

        });

        loadTutors();

        return;

    }

    // =====================
    // FEATURE
    // =====================

    if (e.target.classList.contains("feature-btn")) {

        await updateDoc(doc(db, "tutors", id), {

            featured: !tutor.featured

        });

        loadTutors();

        return;

    }

    // =====================
    // DELETE
    // =====================

    if (e.target.classList.contains("delete-btn")) {

        const ok = confirm(`Delete ${tutor.name}?`);

        if (!ok) return;

        await deleteDoc(doc(db, "tutors", id));

        loadTutors();

        return;

    }

    // =====================
    // VIEW PROFILE
    // =====================

    if (e.target.classList.contains("view-btn")) {

        if (!modal) {

            window.open(`teacher.html?id=${id}`, "_blank");

            return;

        }

        modal.style.display = "flex";

        modal.innerHTML = `

<div class="modal-content">

<span id="closeModal">&times;</span>

<img
src="${tutor.photoURL || "assets/images/default-user.png"}"
style="width:120px;height:120px;border-radius:50%;object-fit:cover;">

<h2>${tutor.name || "-"}</h2>

<p><b>Email :</b> ${tutor.email || "-"}</p>

<p><b>Phone :</b> ${tutor.phone || "-"}</p>

<p><b>Qualification :</b> ${tutor.qualification || "-"}</p>

<p><b>Subjects :</b> ${Array.isArray(tutor.subjects)
    ? tutor.subjects.join(", ")
    : tutor.subject || "-"}</p>

<p><b>Classes :</b> ${Array.isArray(tutor.classes)
    ? tutor.classes.join(", ")
    : tutor.classes || "-"}</p>

<p><b>Experience :</b> ${tutor.experience || "-"}</p>

<p><b>Fees :</b> ₹${tutor.fees || "-"}</p>

<p><b>City :</b> ${tutor.city || "-"}</p>

<p><b>Area :</b> ${tutor.area || "-"}</p>

<p><b>Status :</b> ${tutor.status || "-"}</p>

<p><b>Featured :</b> ${tutor.featured ? "Yes" : "No"}</p>

</div>

`;

        document
            .getElementById("closeModal")
            .onclick = () => {

                modal.style.display = "none";

            };

    }

});
//=============================
// TutorNest Admin Dashboard
// Part 3
//=============================

// SEARCH

searchInput.addEventListener("input", filterTutors);

// FILTER

statusFilter.addEventListener("change", filterTutors);

function filterTutors() {

    const keyword = searchInput.value.trim().toLowerCase();

    const status = statusFilter.value;

    filteredTutors = tutors.filter((tutor) => {

        const name =
            (tutor.name || "").toLowerCase();

        const city =
            (tutor.city || "").toLowerCase();

        const area =
            (tutor.area || "").toLowerCase();

        const qualification =
            (tutor.qualification || "").toLowerCase();

        const subject = Array.isArray(tutor.subjects)
            ? tutor.subjects.join(" ").toLowerCase()
            : (tutor.subject || "").toLowerCase();

        const matchesSearch =
            name.includes(keyword) ||
            city.includes(keyword) ||
            area.includes(keyword) ||
            qualification.includes(keyword) ||
            subject.includes(keyword);

        const matchesStatus =
            status === "All" ||
            tutor.status === status;

        return matchesSearch && matchesStatus;

    });

    renderTable(filteredTutors);

}

//=============================
// LOGOUT
//=============================

logoutBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    const ok = confirm("Logout from Admin Panel?");

    if (!ok) return;

    await signOut(auth);

    location.href = "admin-login.html";

});

//=============================
// CLOSE MODAL
//=============================

window.onclick = (e) => {

    if (modal && e.target === modal) {

        modal.style.display = "none";

    }

};

//=============================
// REFRESH EVERY 15 SECONDS
//=============================

setInterval(() => {

    loadTutors();

}, 15000);

//=============================
// FEATURED TUTOR SUPPORT
//=============================

/*

Firestore Field

featured : true

Homepage Query

const q = query(
collection(db,"tutors"),
where("featured","==",true),
where("status","==","Approved")
);

Sirf Featured Tutors homepage par show honge.

*/

//=============================
// END OF PART 3
//=============================
//=============================
// TutorNest Admin Dashboard
// Part 4 (Final)
//=============================

// SORT (Newest First)

tutors.sort((a, b) => {

    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;

    return bTime - aTime;

});

//=============================
// LOADING
//=============================

async function refreshDashboard() {

    try {

        tbody.innerHTML = `

<tr>

<td colspan="6" style="text-align:center;padding:30px;">

Loading Tutors...

</td>

</tr>

`;

        await loadTutors();

    }

    catch (err) {

        console.error(err);

        tbody.innerHTML = `

<tr>

<td colspan="6" style="color:red;text-align:center;padding:30px;">

Failed to load tutors

</td>

</tr>

`;

    }

}

//=============================
// UTILITIES
//=============================

function badge(status) {

    switch (status) {

        case "Approved":
            return "approved";

        case "Rejected":
            return "rejected";

        default:
            return "pending";

    }

}

function formatSubjects(subjects) {

    if (!subjects) return "-";

    if (Array.isArray(subjects))
        return subjects.join(", ");

    return subjects;

}

function formatClasses(classes) {

    if (!classes) return "-";

    if (Array.isArray(classes))
        return classes.join(", ");

    return classes;

}

//=============================
// AUTO REFRESH
//=============================

refreshDashboard();

setInterval(refreshDashboard, 15000);

//=============================
// FEATURED TUTORS NOTE
//=============================

/*

Firestore Document

tutors
    |
    |---- uid
            |
            |---- featured : true
            |---- status : "Approved"

Homepage Query

query(
collection(db,"tutors"),
where("featured","==",true),
where("status","==","Approved")
)

Admin me "Feature" button dabate hi
featured true/false ho jayega.

Homepage automatically update ho jayega.

*/

//=============================
// END
//=============================

console.log("TutorNest Admin Dashboard Loaded Successfully");