//=====================================================
// TutorNest Admin Dashboard
// admin.js
// Part 1
//=====================================================

import {
    auth,
    db,
    storage
} from "../firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    onSnapshot,
    limit,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";



//=====================================================
// Collections
//=====================================================
const pageLoader = document.getElementById("pageLoader");

function hidePageLoader(){

    if(pageLoader){

        pageLoader.style.display = "none";

    }

}

window.addEventListener("load",()=>{

    setTimeout(()=>{

        hidePageLoader();

    },1000);

});
const demoRef = collection(db, "demoBookings");
const teacherRef = collection(db,"tutors");
const studentRef = collection(db, "students");
const attendanceRef = collection(db, "attendance");
const feesRef = collection(db, "fees");
const settingsRef = collection(db, "settings");
const commissionRef = collection(db, "commission");



//=====================================================
// DOM
//=====================================================

const $ = id => document.getElementById(id);

const loader = $("pageLoader");
const toastMessage = $("toastMessage");
const toastContainer = $("toastContainer");

const demoTable = $("demoBookingsTable");
const studentsTable = $("studentsTable");
const teachersTable = $("teachersTable");
const attendanceTable = $("attendanceTable");
const feesTable = $("feesTable");
const commissionTable = $("commissionTable");

const demoCount = $("demoCount");
const studentCount = $("studentCount");
const teacherCount = $("teacherCount");
const revenueCount = $("revenueCount");

const demoSearch = $("demoSearch");
const demoFilter = $("demoFilter");

const studentSearch = $("studentSearch");
const teacherSearch = $("teacherSearch");

const notificationBtn = $("notificationBtn");
const themeBtn = $("themeBtn");

const assignTutorModal = $("assignTutorModal");
const studentModal = $("studentModal");
const convertStudentModal = $("convertStudentModal");
const deleteModal = $("deleteModal");



//=====================================================
// State
//=====================================================

let demoBookings = [];
let students = [];
let teachers = [];
let attendance = [];
let fees = [];
let commissions = [];

let selectedDemo = null;
let selectedStudent = null;
let selectedTeacher = null;
let deleteTarget = null;

let darkMode = false;



//=====================================================
// Loader
//=====================================================

function showLoader() {

    if (!loader) return;

    loader.style.display = "flex";

}

function hideLoader() {

    if (!loader) return;

    loader.style.display = "none";

}



//=====================================================
// Toast
//=====================================================

let toastTimer;

function showToast(message, type = "success") {

    if (!toastContainer) return;

    clearTimeout(toastTimer);

    toastContainer.style.display = "block";

    const toast = toastContainer.querySelector(".toast");

    toast.className = "toast";

    toast.classList.add(type);

    const icon = toast.querySelector("i");

    switch (type) {

        case "success":
            icon.className = "fa-solid fa-circle-check";
            break;

        case "error":
            icon.className = "fa-solid fa-circle-xmark";
            break;

        case "warning":
            icon.className = "fa-solid fa-triangle-exclamation";
            break;

        default:
            icon.className = "fa-solid fa-circle-info";

    }

    toastMessage.textContent = message;

    toastTimer = setTimeout(() => {

        toastContainer.style.display = "none";

    }, 3500);

}



//=====================================================
// Utility
//=====================================================
//=====================================================
// Utility Functions
//=====================================================

function formatMoney(amount = 0){

    return "₹" + Number(amount)
        .toLocaleString("en-IN");

}


function today(){

    return new Date()
        .toISOString()
        .split("T")[0];

}


function monthValue(){

    return new Date()
        .toISOString()
        .slice(0,7);

}
function formatDate(date){

    if(!date) return "--";

    try{

        if(date?.toDate){
            date = date.toDate();
        }

        const d = new Date(date);

        if(isNaN(d.getTime()))
            return "--";

        return new Intl.DateTimeFormat("en-IN",{

            day:"2-digit",
            month:"short",
            year:"numeric"

        }).format(d);

    }
    catch(e){

        return "--";

    }

}

//=====================================================
// Theme
//=====================================================

function loadTheme() {

    const saved = localStorage.getItem("admin-theme");

    if (saved === "dark") {

        enableDark();

    }

}

function enableDark() {

    document.body.classList.add("dark");

    darkMode = true;

    localStorage.setItem("admin-theme", "dark");

    if (themeBtn)
        themeBtn.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

}

function disableDark() {

    document.body.classList.remove("dark");

    darkMode = false;

    localStorage.setItem("admin-theme", "light");

    if (themeBtn)
        themeBtn.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

}

themeBtn?.addEventListener("click", () => {

    darkMode ? disableDark() : enableDark();

});



//=====================================================
// Auth
//=====================================================

onAuthStateChanged(auth, async user => {

    try {

        if (!user) {

            window.location.href = "../login.html";

            return;

        }

        console.log(
            "Admin Logged In:",
            user.email
        );

        await initializeDashboard();

        hideLoader();

    }

    catch(error){

        console.error(
            "Dashboard Load Error:",
            error
        );

        hideLoader();

        showToast(
            "Dashboard loading failed",
            "error"
        );

    }

});

async function logout() {

    await signOut(auth);

    location.href = "../login.html";

}

document.querySelector(".logoutBtn")?.addEventListener("click", e => {

    e.preventDefault();

    logout();

});



//=====================================================
// Initializer
//=====================================================

async function initializeDashboard() {

    showLoader();

    try {

        loadTheme();

        startRealtimeListeners();

        bindEvents();

        renderAnalytics();

        updateDashboardStats();

    }

    catch(error){

        console.error(error);

    }

    finally{

        hideLoader();

    }

}
//============================================================
// FIRESTORE REALTIME ENGINE
//============================================================

const cache = {
    demos: [],
    students: [],
    teachers: [],
    attendance: [],
    fees: [],
    commissions: [],
    settings: {}
};

const unsubscribe = {};

let dashboardReady = false;

function startRealtimeListeners() {

    unsubscribe.demo = onSnapshot(

        query(
            demoRef,
            orderBy("createdAt", "desc")
        ),

        snapshot => {

            cache.demos = snapshot.docs.map(doc => ({

                id: doc.id,
                ...doc.data()

            }));

            renderDemoTable();

            updateDashboardStats();

        }

    );



    unsubscribe.students = onSnapshot(

        query(
            studentRef,
            orderBy("createdAt", "desc")
        ),

        snapshot => {

            cache.students = snapshot.docs.map(doc => ({

                id: doc.id,
                ...doc.data()

            }));

            renderStudentsTable();

            updateDashboardStats();

        }

    );



    unsubscribe.teachers = onSnapshot(

        query(
            teacherRef,
            orderBy("createdAt", "desc")
        ),

        snapshot => {

            cache.teachers = snapshot.docs.map(doc => ({

                id: doc.id,
                ...doc.data()

            }));

            renderTeachersTable();

            updateDashboardStats();

            populateTutorDropdown();

        }

    );



    unsubscribe.attendance = onSnapshot(

        attendanceRef,

        snapshot => {

            cache.attendance = snapshot.docs.map(doc => ({

                id: doc.id,
                ...doc.data()

            }));

            renderAttendanceTable();

        }

    );



    unsubscribe.fees = onSnapshot(

        feesRef,

        snapshot => {

            cache.fees = snapshot.docs.map(doc => ({

                id: doc.id,
                ...doc.data()

            }));

            renderFeesTable();

            updateDashboardStats();

        }

    );



    unsubscribe.commission = onSnapshot(

        commissionRef,

        snapshot => {

            cache.commissions = snapshot.docs.map(doc => ({

                id: doc.id,
                ...doc.data()

            }));

            renderCommissionTable();

        }

    );



    unsubscribe.settings = onSnapshot(

        doc(db, "settings", "company"),

        snap => {

            if (!snap.exists()) return;

            cache.settings = snap.data();

            fillCompanySettings();

        }

    );

}



//============================================================
// DASHBOARD STATS
//============================================================

function updateDashboardStats() {

    demoCount.textContent =
        cache.demos.filter(x =>
            x.status === "Pending"
        ).length;

    studentCount.textContent =
        cache.students.filter(x =>
            x.active !== false
        ).length;

    teacherCount.textContent =
        cache.teachers.filter(x =>
            x.active !== false
        ).length;

    const revenue = cache.fees.reduce(

        (sum, fee) => {

            if (fee.status === "Paid")
                return sum + Number(fee.amount || 0);

            return sum;

        },

        0

    );

    revenueCount.textContent = formatMoney(revenue);

}



//============================================================
// SETTINGS
//============================================================

function fillCompanySettings() {

    if ($("companyName"))
        $("companyName").value =
        cache.settings.companyName || "";

    if ($("founderName"))
        $("founderName").value =
        cache.settings.founderName || "";

    if ($("companyPhone"))
        $("companyPhone").value =
        cache.settings.phone || "";

    if ($("companyWhatsapp"))
        $("companyWhatsapp").value =
        cache.settings.whatsapp || "";

    if ($("companyEmail"))
        $("companyEmail").value =
        cache.settings.email || "";

    if ($("companyLocation"))
        $("companyLocation").value =
        cache.settings.location || "";

    if ($("companyTagline"))
        $("companyTagline").value =
        cache.settings.tagline || "";

}

async function saveCompanySettings() {

    await setDoc(

        doc(db, "settings", "company"),

        {

            companyName: $("companyName").value.trim(),

            founderName: $("founderName").value.trim(),

            phone: $("companyPhone").value.trim(),

            whatsapp: $("companyWhatsapp").value.trim(),

            email: $("companyEmail").value.trim(),

            location: $("companyLocation").value.trim(),

            tagline: $("companyTagline").value.trim(),

            updatedAt: serverTimestamp()

        }

    );

    showToast("Settings Saved");

}



//============================================================
// TUTOR DROPDOWN
//============================================================

function populateTutorDropdown() {

    const select = $("assignTutor");

    if (!select) return;

    select.innerHTML =
        `<option value="">Choose Tutor</option>`;

    cache.teachers.forEach(tutor => {

    if (tutor.active === false) return;

    const option =
        document.createElement("option");

    option.value = tutor.id;

    option.textContent =
        tutor.name +
        " • " +
        (tutor.subject || "Tutor");

    select.appendChild(option);

});
}



//============================================================
// SEARCH
//============================================================

demoSearch?.addEventListener(

    "input",

    renderDemoTable

);

demoFilter?.addEventListener(

    "change",

    renderDemoTable

);

studentSearch?.addEventListener(

    "input",

    renderStudentsTable

);

teacherSearch?.addEventListener(

    "input",

    renderTeachersTable

);

$("saveSettings")?.addEventListener(

    "click",

    saveCompanySettings

);
//============================================================
// DEMO BOOKINGS TABLE
//============================================================

function renderDemoTable() {

    if (!demoTable) return;

    const keyword = demoSearch.value.trim().toLowerCase();

    const filter = demoFilter.value;

    let records = [...cache.demos];

    if (keyword) {

        records = records.filter(item => {

            return (

                (item.studentName || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (item.parentName || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (item.phone || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (item.city || "")
                .toLowerCase()
                .includes(keyword)

            );

        });

    }

    if (filter !== "All") {

        records = records.filter(

            item => item.status === filter

        );

    }

    if (!records.length) {

        demoTable.innerHTML = emptyTable(

            "No Demo Booking Found"

        );

        return;

    }

    let html = `

<table>

<thead>

<tr>

<th>Student</th>

<th>Parent</th>

<th>Phone</th>

<th>Class</th>

<th>Subject</th>

<th>Area</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    records.forEach(item => {

        html += `

<tr>

<td>${item.studentName || "--"}</td>

<td>${item.parentName || "--"}</td>

<td>${item.phone || "--"}</td>

<td>${item.class || "--"}</td>

<td>${item.subject || "--"}</td>

<td>${item.area || "--"}</td>

<td>

<span class="status ${String(item.status).toLowerCase()}">

${item.status}

</span>

</td>

<td>

<div class="actionButtons">

<button
class="actionBtn viewDemo"
data-id="${item.id}">

<i class="fa-solid fa-eye"></i>

</button>

<button class="actionBtn deleteDemo" data-id="${item.id}">
<i class="fa-solid fa-trash"></i>
</button>

<button
class="actionBtn assignDemo"
data-id="${item.id}">

<i class="fa-solid fa-user-check"></i>

</button>

<button
class="actionBtn convertDemo"
data-id="${item.id}">

<i class="fa-solid fa-user-graduate"></i>

</button>

<button
class="actionBtn deleteDemo"
data-id="${item.id}">

<i class="fa-solid fa-trash"></i>

</button>

</div>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    demoTable.innerHTML = html;

}



//============================================================
// STUDENTS TABLE
//============================================================

function renderStudentsTable() {

    if (!studentsTable) return;

    const keyword = studentSearch.value
        .trim()
        .toLowerCase();

    let records = cache.students;

    if (keyword) {

        records = records.filter(student => {

            return (

                (student.name || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (student.parentName || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (student.phone || "")
                .includes(keyword)

                ||

                (student.teacherName || "")
                .toLowerCase()
                .includes(keyword)

            );

        });

    }

    if (!records.length) {

        studentsTable.innerHTML = emptyTable(

            "No Student Found"

        );

        return;

    }

    let html = `

<table>

<thead>

<tr>

<th>Student</th>

<th>Teacher</th>

<th>Class</th>

<th>Fees</th>

<th>Admission</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    records.forEach(student => {

        html += `

<tr>

<td>${student.name}</td>

<td>${student.teacherName || "--"}</td>

<td>${student.class}</td>

<td>${formatMoney(student.monthlyFees)}</td>

<td>${formatDate(student.admissionDate)}</td>

<td>

<span class="status active">

Active

</span>

</td>

<td>

<div class="actionButtons">

<button
class="actionBtn studentView"
data-id="${student.id}">

<i class="fa-solid fa-eye"></i>

</button>

<button
class="actionBtn attendanceHistory"
data-id="${student.id}">

<i class="fa-solid fa-calendar-days"></i>

</button>

<button
class="actionBtn collectFee"
data-id="${student.id}">

<i class="fa-solid fa-money-bill-wave"></i>

</button>

<button
class="actionBtn deleteStudent"
data-id="${student.id}">

<i class="fa-solid fa-trash"></i>

</button>

</div>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    studentsTable.innerHTML = html;

}



//============================================================
// EMPTY STATE
//============================================================

function emptyTable(title) {

    return `

<div class="emptyState">

<i class="fa-solid fa-box-open"></i>

<h3>${title}</h3>

<p>

There is no available data at this moment.

</p>

</div>

`;

}
//============================================================
// TEACHERS TABLE
//============================================================

function renderTeachersTable() {

    if (!teachersTable) return;

    const keyword = teacherSearch.value
        .trim()
        .toLowerCase();

    let records = [...cache.teachers];

    if (keyword) {

        records = records.filter(teacher => {

            return (

                (teacher.name || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (teacher.phone || "")
                .includes(keyword)

                ||

                (teacher.subject || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (teacher.city || "")
                .toLowerCase()
                .includes(keyword)

            );

        });

    }

    if (!records.length) {

        teachersTable.innerHTML = emptyTable(
            "No Teacher Found"
        );

        return;

    }

    let html = `

<table>

<thead>

<tr>

<th>Teacher</th>

<th>Phone</th>

<th>Subject</th>

<th>Students</th>

<th>Commission</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    records.forEach(teacher => {

        const totalStudents = cache.students.filter(

            student => student.teacherId === teacher.id

        ).length;

        html += `

<tr>

<td>${teacher.name}</td>

<td>${teacher.phone || "--"}</td>

<td>${teacher.subject || "--"}</td>

<td>${totalStudents}</td>

<td>${teacher.commission || 10}%</td>

<td>

<span class="status active">

${teacher.active === false ? "Inactive" : "Active"}

</span>

</td>

<td>

<div class="actionButtons">

<button
class="actionBtn teacherView"
data-id="${teacher.id}">

<i class="fa-solid fa-eye"></i>

</button>

<button onclick="toggleFeatured('${teacher.id}',${teacher.featured || false})">

${teacher.featured 
? "Remove Feature"
: "Feature Tutor"}

</button>

<button
class="actionBtn teacherEdit"
data-id="${teacher.id}">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="actionBtn teacherDelete"
data-id="${teacher.id}">

<i class="fa-solid fa-trash"></i>

</button>

</div>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    teachersTable.innerHTML = html;

}



//============================================================
// ATTENDANCE TABLE
//============================================================

function renderAttendanceTable() {

    if (!attendanceTable) return;

    if (!cache.students.length) {

        attendanceTable.innerHTML = emptyTable(
            "No Student Available"
        );

        return;

    }

    const selectedDate =
        $("attendanceDate").value || today();

    let html = `

<table>

<thead>

<tr>

<th>Student</th>

<th>Teacher</th>

<th>Class</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

    cache.students.forEach(student => {

        const record = cache.attendance.find(item => {

            return (

                item.studentId === student.id

                &&

                item.date === selectedDate

            );

        });

        html += `

<tr>

<td>${student.name}</td>

<td>${student.teacherName || "--"}</td>

<td>${student.class}</td>

<td>

<select
class="attendanceSelect"
data-id="${student.id}">

<option
value="Present"
${record?.status === "Present" ? "selected" : ""}>

Present

</option>

<option
value="Absent"
${record?.status === "Absent" ? "selected" : ""}>

Absent

</option>

<option
value="Leave"
${record?.status === "Leave" ? "selected" : ""}>

Leave

</option>

</select>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    attendanceTable.innerHTML = html;

}



//============================================================
// FEES TABLE
//============================================================

function renderFeesTable() {

    if (!feesTable) return;

    if (!cache.students.length) {

        feesTable.innerHTML =
            emptyTable("No Student Found");

        return;

    }

    const month = $("feesMonth").value;

    let html = `

<table>

<thead>

<tr>

<th>Student</th>

<th>Teacher</th>

<th>Fees</th>

<th>Month</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    cache.students.forEach(student => {

        const fee = cache.fees.find(item => {

            return (

                item.studentId === student.id

                &&

                item.month === month

            );

        });

        html += `

<tr>

<td>${student.name}</td>

<td>${student.teacherName || "--"}</td>

<td>${formatMoney(student.monthlyFees)}</td>

<td>${month}</td>

<td>

<span class="status ${fee?.status === "Paid" ? "completed" : "pending"}">

${fee?.status || "Pending"}

</span>

</td>

<td>

<button
class="actionBtn collectFeeBtn"
data-id="${student.id}">

<i class="fa-solid fa-money-bill-wave"></i>

</button>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    feesTable.innerHTML = html;

}
//============================================================
// COMMISSION TABLE
//============================================================

function renderCommissionTable() {

    if (!commissionTable) return;

    if (!cache.teachers.length) {

        commissionTable.innerHTML = emptyTable(
            "No Teacher Found"
        );

        return;

    }

    const month = $("commissionMonth").value;

    let html = `

<table>

<thead>

<tr>

<th>Teacher</th>

<th>Students</th>

<th>Total Fees</th>

<th>Commission %</th>

<th>Commission</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

    cache.teachers.forEach(teacher => {

        const teacherStudents = cache.students.filter(

            student => student.teacherId === teacher.id

        );

        let totalFees = 0;

        teacherStudents.forEach(student => {

            const fee = cache.fees.find(item =>

                item.studentId === student.id &&
                item.month === month &&
                item.status === "Paid"

            );

            if (fee)
                totalFees += Number(fee.amount || 0);

        });

        const percent =
            Number(teacher.commission || 10);

        const commissionAmount =
            (totalFees * percent) / 100;

        html += `

<tr>

<td>${teacher.name}</td>

<td>${teacherStudents.length}</td>

<td>${formatMoney(totalFees)}</td>

<td>${percent}%</td>

<td>${formatMoney(commissionAmount)}</td>

<td>

<span class="status completed">

Calculated

</span>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    commissionTable.innerHTML = html;

}



//============================================================
// EVENTS
//============================================================

function bindEvents() {

    document.addEventListener(

        "click",

        handleGlobalClick

    );

    $("attendanceDate")?.addEventListener(

        "change",

        renderAttendanceTable

    );

    $("feesMonth")?.addEventListener(

        "change",

        renderFeesTable

    );

    $("commissionMonth")?.addEventListener(

        "change",

        renderCommissionTable

    );

    $("calculateCommission")?.addEventListener(

        "click",

        renderCommissionTable

    );

    $("collectFeesBtn")?.addEventListener(

        "click",

        collectMonthlyFees

    );

    $("markAttendanceBtn")?.addEventListener(

        "click",

        saveAttendance

    );

}



//============================================================
// GLOBAL CLICK
//============================================================

function handleGlobalClick(e) {

    const btn = e.target.closest("button");

    if (!btn) return;

    if (btn.classList.contains("viewDemo")) {

        openStudentDetails(

            btn.dataset.id

        );

    }

    else if (btn.classList.contains("assignDemo")) {

        openAssignTutor(

            btn.dataset.id

        );

    }

    else if (btn.classList.contains("convertDemo")) {

        openConvertModal(

            btn.dataset.id

        );

    }

    else if (btn.classList.contains("deleteDemo")) {

        askDelete(

            "demo",

            btn.dataset.id

        );

    }

    else if (btn.classList.contains("studentView")) {

        openPermanentStudent(

            btn.dataset.id

        );

    }

    else if (btn.classList.contains("attendanceHistory")) {

        openAttendanceHistory(

            btn.dataset.id

        );

    }

    else if (btn.classList.contains("collectFee")) {

        collectSingleFee(

            btn.dataset.id

        );

    }

    else if (btn.classList.contains("deleteStudent")) {

        askDelete(

            "student",

            btn.dataset.id

        );

    }

    else if (btn.classList.contains("teacherView")) {

        openTeacherProfile(

            btn.dataset.id

        );

    }

    else if (btn.classList.contains("teacherEdit")) {

        editTeacher(

            btn.dataset.id

        );

    }

    else if (btn.classList.contains("teacherDelete")) {

        askDelete(

            "teacher",

            btn.dataset.id

        );

    }

}



//============================================================
// MODALS
//============================================================

function openModal(modal) {

    modal?.classList.add("show");

}

function closeModal(modal) {

    modal?.classList.remove("show");

}

document

.querySelectorAll(".closeModal")

.forEach(button => {

    button.addEventListener(

        "click",

        () => {

            closeModal(

                button.closest(".modal")

            );

        }

    );

});

window.addEventListener(

    "click",

    e => {

        if (

            e.target.classList.contains("modal")

        ) {

            closeModal(e.target);

        }

    }

);
//============================================================
// ASSIGN TUTOR
//============================================================

function openAssignTutor(id) {

    selectedDemo = cache.demos.find(item => item.id === id);

    if (!selectedDemo) return;

    $("assignStudent").value =
        selectedDemo.studentName || "";

    $("assignTutor").value = "";

    $("demoDate").value = "";

    $("demoTime").value = "";

    $("assignNotes").value =
        selectedDemo.notes || "";

    openModal(assignTutorModal);

}

$("confirmAssign")?.addEventListener(

    "click",

    assignTutorToDemo

);
async function toggleFeatured(id,currentStatus){

    try{

        await updateDoc(

            doc(db,"tutors",id),

            {

                featured:
                    !currentStatus

            }

        );

        showToast(
            "Feature Status Updated"
        );

    }

    catch(error){

        console.error(error);

    }

}

async function assignTutorToDemo() {

    if (!selectedDemo) return;

    const tutorId = $("assignTutor").value;

    if (!tutorId) {

        showToast(
            "Please select a tutor",
            "warning"
        );

        return;

    }

    const teacher = cache.teachers.find(

        t => t.id === tutorId

    );

    showLoader();

    try {

        await updateDoc(

            doc(db, "demoBookings", selectedDemo.id),

            {

                teacherId: teacher.id,

                teacherName: teacher.name,

                teacherPhone: teacher.phone || "",

                demoDate: $("demoDate").value,

                demoTime: $("demoTime").value,

                notes: $("assignNotes").value.trim(),

                status: "Assigned",

                assignedAt: serverTimestamp()

            }

        );

        closeModal(assignTutorModal);

        showToast("Tutor Assigned Successfully");

    }

    catch (error) {

        console.error(error);

        showToast(
            "Assignment Failed",
            "error"
        );

    }

    finally {

        hideLoader();

    }

}



//============================================================
// STUDENT DETAILS
//============================================================

function openStudentDetails(id) {

    const student = cache.demos.find(

        item => item.id === id

    );

    if (!student) return;

    $("studentNameView").textContent =
        student.studentName || "--";

    $("studentClassView").textContent =
        student.class || "--";

    $("studentStatusView").textContent =
        student.status || "Pending";

    $("studentStatusView").className =
        "status " +
        String(student.status)
        .toLowerCase();

    $("studentPhoneView").textContent =
        student.phone || "--";

    $("parentNameView").textContent =
        student.parentName || "--";

    $("parentPhoneView").textContent =
        student.parentPhone || "--";

    $("studentSubjectView").textContent =
        student.subject || "--";

    $("studentAreaView").textContent =
        student.area || "--";

    $("studentCityView").textContent =
        student.city || "--";

    openModal(studentModal);

}



//============================================================
// CONVERT TO PERMANENT STUDENT
//============================================================

function openConvertModal(id) {

    selectedDemo = cache.demos.find(

        demo => demo.id === id

    );

    if (!selectedDemo) return;

    $("monthlyFees").value = "";

    $("admissionDate").value = today();

    $("courseDuration").selectedIndex = 0;

    $("commissionPercent").value = 10;

    openModal(convertStudentModal);

}

$("convertStudentBtn")?.addEventListener(

    "click",

    convertDemoToStudent

);

async function convertDemoToStudent() {

    if (!selectedDemo) return;

    const teacher = cache.teachers.find(

        item => item.id === selectedDemo.teacherId

    );

    showLoader();

    try {

        await addDoc(
    studentRef,
    {

        demoId: selectedDemo.id || "",

        name:
            selectedDemo.studentName || "",

        parentName:
            selectedDemo.parentName || "",

        phone:
            selectedDemo.phone || selectedDemo.mobile || selectedDemo.phoneNumber || "",

        parentPhone:
            selectedDemo.parentPhone || "",

        class:
            selectedDemo.class || "",

        subject:
            selectedDemo.subject || "",

        area:
            selectedDemo.area || "",

        city:
            selectedDemo.city || "",

        teacherId:
            selectedDemo.teacherId || "",

        teacherName:
            selectedDemo.teacherName || "",

        monthlyFees:
            Number(
                $("monthlyFees").value || 0
            ),

        commissionPercent:
            Number(
                $("commissionPercent").value || 10
            ),

        admissionDate:
            $("admissionDate").value || today(),

        duration:
            $("courseDuration").value || "",

        active:true,

        createdAt:
            serverTimestamp()

    }
);
        await updateDoc(

            doc(
                db,
                "demoBookings",
                selectedDemo.id
            ),

            {

                status: "Completed",

                converted: true,

                convertedAt:
                    serverTimestamp()

            }

        );

        closeModal(convertStudentModal);

        showToast(
            "Student Converted Successfully"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Conversion Failed",
            "error"
        );

    }

    finally {

        hideLoader();

    }

}
//============================================================
// ATTENDANCE SAVE ENGINE
//============================================================

async function saveAttendance() {

    const date = $("attendanceDate").value;

    if (!date) {

        showToast(
            "Please select attendance date",
            "warning"
        );

        return;

    }

    const selects = document.querySelectorAll(
        ".attendanceSelect"
    );

    if (!selects.length) {

        showToast(
            "No attendance records found",
            "warning"
        );

        return;

    }

    showLoader();

    try {

        const batch = writeBatch(db);

        selects.forEach(select => {

            const studentId = select.dataset.id;

            const student = cache.students.find(
                x => x.id === studentId
            );

            if (!student) return;

            const attendanceDoc = doc(
                attendanceRef
            );

            batch.set(attendanceDoc, {

                studentId,

                studentName: student.name,

                teacherId: student.teacherId,

                teacherName: student.teacherName,

                class: student.class,

                subject: student.subject,

                status: select.value,

                date,

                createdAt: serverTimestamp()

            });

        });

        await batch.commit();

        showToast(
            "Attendance Saved Successfully"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Unable to save attendance",
            "error"
        );

    }

    finally {

        hideLoader();

    }

}



//============================================================
// MONTHLY FEES
//============================================================

async function collectMonthlyFees() {

    const month = $("feesMonth").value;

    if (!month) {

        showToast(
            "Select month first",
            "warning"
        );

        return;

    }

    if (!cache.students.length) {

        showToast(
            "No students found",
            "warning"
        );

        return;

    }

    showLoader();

    try {

        const batch = writeBatch(db);

        cache.students.forEach(student => {

            const alreadyPaid = cache.fees.find(

                fee =>

                fee.studentId === student.id &&

                fee.month === month

            );

            if (alreadyPaid) return;

            const feeDoc = doc(feesRef);

            batch.set(feeDoc, {

                studentId: student.id,

                studentName: student.name,

                teacherId: student.teacherId,

                teacherName: student.teacherName,

                amount: Number(
                    student.monthlyFees || 0
                ),

                month,

                status: "Pending",

                createdAt: serverTimestamp()

            });

        });

        await batch.commit();

        showToast(
            "Monthly Fees Generated"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Fee generation failed",
            "error"
        );

    }

    finally {

        hideLoader();

    }

}



//============================================================
// SINGLE FEE COLLECTION
//============================================================

async function collectSingleFee(studentId) {

    const student = cache.students.find(

        item => item.id === studentId

    );

    if (!student) return;

    const month = $("feesMonth").value;

    const fee = cache.fees.find(

        item =>

        item.studentId === studentId &&

        item.month === month

    );

    if (!fee) {

        showToast(
            "Fee record not found",
            "warning"
        );

        return;

    }

    showLoader();

    try {

        await updateDoc(

            doc(db, "fees", fee.id),

            {

                status: "Paid",

                paidAt: serverTimestamp(),

                amount: Number(
                    student.monthlyFees
                )

            }

        );

        showToast(
            "Fee Collected Successfully"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Unable to collect fee",
            "error"
        );

    }

    finally {

        hideLoader();

    }

}



//============================================================
// DELETE SYSTEM
//============================================================

function askDelete(type, id) {

    deleteTarget = {

        type,

        id

    };

    openModal(deleteModal);

}

$("confirmDeleteBtn")?.addEventListener(

    "click",

    confirmDelete

);

async function confirmDelete() {

    if (!deleteTarget) return;

    showLoader();

    try {

        switch (deleteTarget.type) {

            case "demo":

                await deleteDoc(

                    doc(
                        db,
                        "demoBookings",
                        deleteTarget.id
                    )

                );

                break;

            case "student":

                await deleteDoc(

                    doc(
                        db,
                        "students",
                        deleteTarget.id
                    )

                );

                break;

            case "teacher":

                await deleteDoc(

                    doc(
                        db,
                        "teachers",
                        deleteTarget.id
                    )

                );

                break;

        }

        closeModal(deleteModal);

        deleteTarget = null;

        showToast(
            "Record Deleted Successfully"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Delete Failed",
            "error"
        );

    }

    finally {

        hideLoader();

    }

}

document.querySelector(
    "#deleteModal .cancelBtn"
)?.addEventListener(

    "click",

    () => {

        deleteTarget = null;

        closeModal(deleteModal);

    }

);
//============================================================
// TEACHER PROFILE
//============================================================

function openTeacherProfile(id) {

    const teacher = cache.teachers.find(

        item => item.id === id

    );

    if (!teacher) return;

    const totalStudents = cache.students.filter(

        student => student.teacherId === teacher.id

    );

    const totalFees = cache.fees
        .filter(

            fee =>

            fee.teacherId === teacher.id &&

            fee.status === "Paid"

        )
        .reduce(

            (sum, fee) =>

                sum + Number(fee.amount || 0),

            0

        );

    alert(

`Teacher : ${teacher.name}

Phone : ${teacher.phone || "--"}

Subject : ${teacher.subject || "--"}

City : ${teacher.city || "--"}

Students : ${totalStudents.length}

Revenue : ${formatMoney(totalFees)}

Commission : ${teacher.commission || 10}%`

    );

}



//============================================================
// EDIT TEACHER
//============================================================

async function editTeacher(id) {

    const teacher = cache.teachers.find(

        item => item.id === id

    );

    if (!teacher) return;

    const name = prompt(

        "Teacher Name",

        teacher.name

    );

    if (name === null) return;

    const phone = prompt(

        "Phone",

        teacher.phone

    );

    if (phone === null) return;

    const subject = prompt(

        "Subject",

        teacher.subject

    );

    if (subject === null) return;

    const city = prompt(

        "City",

        teacher.city

    );

    if (city === null) return;

    const commission = prompt(

        "Commission %",

        teacher.commission || 10

    );

    showLoader();

    try {

        await updateDoc(

            doc(db, "teachers", id),

            {

                name: name.trim(),

                phone: phone.trim(),

                subject: subject.trim(),

                city: city.trim(),

                commission: Number(

                    commission

                ),

                updatedAt:

                    serverTimestamp()

            }

        );

        showToast(

            "Teacher Updated"

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "Update Failed",

            "error"

        );

    }

    finally {

        hideLoader();

    }

}



//============================================================
// PERMANENT STUDENT PROFILE
//============================================================

function openPermanentStudent(id) {

    const student = cache.students.find(

        item => item.id === id

    );

    if (!student) return;

    $("studentNameView").textContent =
        student.name;

    $("studentClassView").textContent =
        student.class;

    $("studentStatusView").textContent =
        "Active";

    $("studentStatusView").className =
        "status active";

    $("studentPhoneView").textContent =
        student.phone || "--";

    $("parentNameView").textContent =
        student.parentName || "--";

    $("parentPhoneView").textContent =
        student.parentPhone || "--";

    $("studentSubjectView").textContent =
        student.subject || "--";

    $("studentAreaView").textContent =
        student.area || "--";

    $("studentCityView").textContent =
        student.city || "--";

    openModal(studentModal);

}



//============================================================
// ATTENDANCE HISTORY
//============================================================

function openAttendanceHistory(studentId) {

    const student = cache.students.find(

        item => item.id === studentId

    );

    if (!student) return;

    $("attendanceStudentName").textContent =
        student.name;

    $("attendanceStudentClass").textContent =
        student.class;

    $("attendanceStudentTeacher").textContent =
        student.teacherName;

    $("attendanceMonth").value =
        monthValue();

    renderAttendanceHistory(studentId);

    openModal(

        $("attendanceHistoryModal")

    );

}

function renderAttendanceHistory(studentId) {

    const month = $("attendanceMonth").value;

    const records = cache.attendance.filter(

        item =>

            item.studentId === studentId &&

            item.date.startsWith(month)

    );

    const present = records.filter(

        x => x.status === "Present"

    ).length;

    const absent = records.filter(

        x => x.status === "Absent"

    ).length;

    const leave = records.filter(

        x => x.status === "Leave"

    ).length;

    const total = records.length || 1;

    const percent = Math.round(

        (present / total) * 100

    );

    $("presentCount").textContent =
        present;

    $("absentCount").textContent =
        absent;

    $("leaveCount").textContent =
        leave;

    $("attendancePercent").textContent =
        percent + "%";

    $("attendanceBar").style.width =
        percent + "%";

    let calendar = "";

    records.forEach(record => {

        calendar += `

<div class="attendanceDay ${record.status.toLowerCase()}">

<strong>

${record.date.split("-")[2]}

</strong>

<span>

${record.status}

</span>

</div>

`;

    });

    $("attendanceCalendar").innerHTML =
        calendar || emptyTable("No Attendance");

    let table = `

<table>

<thead>

<tr>

<th>Date</th>

<th>Status</th>

</tr>

</thead>

<tbody>

`;

    records.forEach(record => {

        table += `

<tr>

<td>${formatDate(record.date)}</td>

<td>

<span class="status ${record.status.toLowerCase()}">

${record.status}

</span>

</td>

</tr>

`;

    });

    table += `

</tbody>

</table>

`;

    $("attendanceHistoryTable").innerHTML =
        records.length
            ? table
            : emptyTable("No Attendance");

}

$("attendanceMonth")?.addEventListener(

    "change",

    () => {

        const student = cache.students.find(

            item =>

                item.name ===
                $("attendanceStudentName").textContent

        );

        if (student)

            renderAttendanceHistory(

                student.id

            );

    }

);
//============================================================
// EXPORT EXCEL
//============================================================

$("exportExcel")?.addEventListener(

    "click",

    exportDashboardExcel

);

async function exportDashboardExcel() {

    try {

        const workbook = [];

        workbook.push([
            "Student",
            "Teacher",
            "Class",
            "Monthly Fees",
            "Status"
        ]);

        cache.students.forEach(student => {

            workbook.push([

                student.name,

                student.teacherName,

                student.class,

                student.monthlyFees,

                student.active
                    ? "Active"
                    : "Inactive"

            ]);

        });

        const csv = workbook

            .map(row =>

                row.map(value => `"${value}"`).join(",")

            )

            .join("\n");

        const blob = new Blob(

            [csv],

            {

                type: "text/csv"

            }

        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download =

            "TutorNest_Students.csv";

        a.click();

        URL.revokeObjectURL(url);

        showToast("Excel Exported");

    }

    catch (error) {

        console.error(error);

        showToast(

            "Export Failed",

            "error"

        );

    }

}



//============================================================
// EXPORT PDF
//============================================================

$("exportPDF")?.addEventListener(

    "click",

    exportDashboardPDF

);

function exportDashboardPDF() {

    const win = window.open("", "_blank");

    let html = `

<html>

<head>

<title>

TutorNest Report

</title>

<style>

body{

font-family:Arial;

padding:30px;

}

table{

width:100%;

border-collapse:collapse;

}

th,td{

border:1px solid #ddd;

padding:10px;

text-align:left;

}

th{

background:#2563eb;

color:#fff;

}

h1{

margin-bottom:25px;

}

</style>

</head>

<body>

<h1>

TutorNest Student Report

</h1>

<table>

<thead>

<tr>

<th>Name</th>

<th>Teacher</th>

<th>Class</th>

<th>Fees</th>

</tr>

</thead>

<tbody>

`;

    cache.students.forEach(student => {

        html += `

<tr>

<td>${student.name}</td>

<td>${student.teacherName}</td>

<td>${student.class}</td>

<td>${formatMoney(student.monthlyFees)}</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

</body>

</html>

`;

    win.document.write(html);

    win.document.close();

    win.focus();

    win.print();

    showToast(

        "PDF Ready"

    );

}



//============================================================
// NOTIFICATION
//============================================================

notificationBtn?.addEventListener(

    "click",

    () => {

        const pending = cache.demos.filter(

            item =>

                item.status === "Pending"

        ).length;

        const unpaid = cache.fees.filter(

            fee =>

                fee.status !== "Paid"

        ).length;

        alert(

`TutorNest Notifications

Pending Demo :

${pending}

Pending Fees :

${unpaid}

Teachers :

${cache.teachers.length}

Students :

${cache.students.length}`

        );

    }

);



//============================================================
// REPORTS
//============================================================

function generateDashboardReport() {

    return {

        demos: cache.demos.length,

        pendingDemo:

            cache.demos.filter(

                x =>

                    x.status === "Pending"

            ).length,

        teachers:

            cache.teachers.length,

        students:

            cache.students.length,

        revenue:

            cache.fees

            .filter(

                fee =>

                    fee.status === "Paid"

            )

            .reduce(

                (sum, fee) =>

                    sum +

                    Number(

                        fee.amount || 0

                    ),

                0

            ),

        attendance:

            cache.attendance.length

    };

}



//============================================================
// QUICK ACTION BUTTONS
//============================================================

$("assignDemoBtn")?.addEventListener(

    "click",

    () => {

        location.href = "#demoBookings";

    }

);

$("attendanceBtn")?.addEventListener(

    "click",

    () => {

        location.href = "#attendance";

    }

);

$("feesBtn")?.addEventListener(

    "click",

    () => {

        location.href = "#fees";

    }

);

$("reportBtn")?.addEventListener(

    "click",

    () => {

        location.href = "#reports";

    }

);

$("newTeacherBtn")?.addEventListener(

    "click",

    () => {

        showToast(

            "Teacher Registration Module Coming Next"

        );

    }

);

$("addTeacherBtn")?.addEventListener(

    "click",

    () => {

        $("newTeacherBtn")?.click();

    }

);

$("addStudentBtn")?.addEventListener(

    "click",

    () => {

        showToast(

            "Student Registration Module Coming Next"

        );

    }

);

$("addPermanentStudent")?.addEventListener(

    "click",

    () => {

        $("addStudentBtn")?.click();

    }

);



//============================================================
// CLEANUP
//============================================================

window.addEventListener(

    "beforeunload",

    () => {

        Object.values(

            unsubscribe

        ).forEach(listener => {

            if (

                typeof listener ===

                "function"

            ) {

                listener();

            }

        });

    }

);



//============================================================
// END OF PART
// NEXT:
// • Teacher Registration
// • Student Registration
// • Firebase Storage Image Upload
// • Analytics Charts
// • Authentication Roles
// • Advanced Reports
// • Audit Logs
//============================================================
//============================================================
// TEACHER REGISTRATION MODULE
//============================================================

$("newTeacherBtn")?.addEventListener(

    "click",

    createTeacher

);

$("addTeacherBtn")?.addEventListener(

    "click",

    createTeacher

);

async function createTeacher() {

    const name = prompt("Teacher Name");

    if (!name) return;

    const phone = prompt("Phone Number");

    if (!phone) return;

    const email = prompt("Email");

    if (!email) return;

    const subject = prompt("Subject");

    if (!subject) return;

    const qualification = prompt("Qualification");

    if (!qualification) return;

    const experience = prompt("Experience");

    if (!experience) return;

    const city = prompt("City");

    if (!city) return;

    const area = prompt("Area");

    if (!area) return;

    const commission = Number(

        prompt("Commission %", "10")

    );

    showLoader();

    try {

        await addDoc(

            teacherRef,

            {

                teacherCode:

                    "TN-T-" +

                    Date.now(),

                name: name.trim(),

                phone: phone.trim(),

                email: email.trim(),

                subject: subject.trim(),

                qualification:

                    qualification.trim(),

                experience:

                    experience.trim(),

                city: city.trim(),

                area: area.trim(),

                commission,

                active: true,

                verified: true,

                rating: 5,

                totalStudents: 0,

                joinedAt:

                    serverTimestamp(),

                createdAt:

                    serverTimestamp()

            }

        );

        showToast(

            "Teacher Added Successfully"

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "Teacher Creation Failed",

            "error"

        );

    }

    finally {

        hideLoader();

    }

}



//============================================================
// STUDENT REGISTRATION
//============================================================

$("addStudentBtn")?.addEventListener(

    "click",

    createStudent

);

$("addPermanentStudent")?.addEventListener(

    "click",

    createStudent

);

async function createStudent() {

    const name = prompt("Student Name");

    if (!name) return;

    const parent = prompt("Parent Name");

    if (!parent) return;

    const phone = prompt("Student Phone");

    if (!phone) return;

    const parentPhone = prompt("Parent Phone");

    if (!parentPhone) return;

    const studentClass = prompt("Class");

    if (!studentClass) return;

    const subject = prompt("Subject");

    if (!subject) return;

    const city = prompt("City");

    if (!city) return;

    const area = prompt("Area");

    if (!area) return;

    const monthlyFees = Number(

        prompt("Monthly Fees")

    );

    const teacherId = $("assignTutor").value;

    const teacher = cache.teachers.find(

        t => t.id === teacherId

    );

    showLoader();

    try {

        await addDoc(

            studentRef,

            {

                studentCode:

                    "TN-S-" +

                    Date.now(),

                name,

                parentName: parent,

                phone,

                parentPhone,

                class: studentClass,

                subject,

                city,

                area,

                teacherId:

                    teacher?.id || "",

                teacherName:

                    teacher?.name || "",

                monthlyFees,

                admissionDate:

                    today(),

                active: true,

                createdAt:

                    serverTimestamp()

            }

        );

        showToast(

            "Student Added Successfully"

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "Student Creation Failed",

            "error"

        );

    }

    finally {

        hideLoader();

    }

}



//============================================================
// STORAGE IMAGE UPLOAD
//============================================================

async function uploadProfileImage(

    file,

    folder

) {

    if (!file) return "";

    const imageRef = ref(

        storage,

        `${folder}/${Date.now()}_${file.name}`

    );

    await uploadBytes(

        imageRef,

        file

    );

    return await getDownloadURL(

        imageRef

    );

}
async function deleteTutor(id){

    if(!confirm("Remove this tutor?")) return;

    try{

        await deleteDoc(
            doc(db,"tutors",id)
        );

        showToast(
            "Tutor Removed Successfully"
        );

    }

    catch(error){

        console.error(error);

        showToast(
            "Delete Failed",
            "error"
        );

    }

}

async function deleteProfileImage(url) {

    if (!url) return;

    try {

        const imageRef = ref(

            storage,

            url

        );

        await deleteObject(

            imageRef

        );

    }

    catch (e) {

        console.error(e);

    }

}



//============================================================
// ANALYTICS
//============================================================

function renderAnalytics() {

    const charts = $("analyticsCharts");

    if (!charts) return;

    const paid = cache.fees.filter(

        fee => fee.status === "Paid"

    ).length;

    const pending = cache.fees.filter(

        fee => fee.status !== "Paid"

    ).length;

    const activeTeachers = cache.teachers.filter(

        teacher => teacher.active

    ).length;

    const activeStudents = cache.students.filter(

        student => student.active

    ).length;

    charts.innerHTML = `

<div class="chartCard">

<h3>Overview</h3>

<div class="detailsGrid">

<div>

<label>Students</label>

<p>${activeStudents}</p>

</div>

<div>

<label>Teachers</label>

<p>${activeTeachers}</p>

</div>

<div>

<label>Paid Fees</label>

<p>${paid}</p>

</div>

<div>

<label>Pending Fees</label>

<p>${pending}</p>

</div>

</div>

</div>

<div class="chartCard">

<h3>Revenue</h3>

<div class="detailsGrid">

<div>

<label>Total Revenue</label>

<p>

${formatMoney(

cache.fees

.filter(f=>f.status==="Paid")

.reduce(

(a,b)=>a+Number(b.amount||0),

0

)

)}

</p>

</div>

<div>

<label>Demo Bookings</label>

<p>

${cache.demos.length}

</p>

</div>

<div>

<label>Attendance</label>

<p>

${cache.attendance.length}

</p>

</div>

<div>

<label>Commission Records</label>

<p>

${cache.commissions.length}

</p>

</div>

</div>

</div>

`;

}



//============================================================
// AUTO REFRESH ANALYTICS
//============================================================

setInterval(() => {

    renderAnalytics();

}, 5000);
//============================================================
// ROLE & PERMISSION ENGINE
//============================================================

const USER_ROLES = {

    SUPER_ADMIN: "super_admin",

    ADMIN: "admin",

    MANAGER: "manager",

    ACCOUNTANT: "accountant",

    TEACHER: "teacher"

};

let currentUser = null;

let currentRole = USER_ROLES.ADMIN;

async function loadCurrentUser(uid) {

    try {

        const snap = await getDoc(

            doc(db, "admins", uid)

        );

        if (!snap.exists()) return;

        currentUser = {

            id: uid,

            ...snap.data()

        };

        currentRole =

            currentUser.role ||

            USER_ROLES.ADMIN;

        applyPermissions();

    }

    catch (e) {

        console.error(e);

    }

}

function can(permission) {

    const permissions = {

        super_admin: [

            "*"

        ],

        admin: [

            "students",

            "teachers",

            "fees",

            "attendance",

            "reports"

        ],

        manager: [

            "students",

            "teachers",

            "attendance"

        ],

        accountant: [

            "fees",

            "reports"

        ],

        teacher: [

            "attendance"

        ]

    };

    const rolePermissions =

        permissions[currentRole] || [];

    return (

        rolePermissions.includes("*")

        ||

        rolePermissions.includes(permission)

    );

}

function applyPermissions() {

    if (

        !can("teachers")

    ) {

        $("newTeacherBtn")?.remove();

    }

    if (

        !can("fees")

    ) {

        $("feesBtn")?.remove();

    }

    if (

        !can("reports")

    ) {

        $("reportBtn")?.remove();

    }

}



//============================================================
// AUDIT LOG
//============================================================

async function addAuditLog(

    action,

    module,

    details = {}

) {

    try {

        await addDoc(

            collection(db, "auditLogs"),

            {

                userId:

                    currentUser?.id || "",

                userName:

                    currentUser?.name || "",

                role:

                    currentRole,

                action,

                module,

                details,

                createdAt:

                    serverTimestamp()

            }

        );

    }

    catch (e) {

        console.error(e);

    }

}



//============================================================
// DASHBOARD SEARCH
//============================================================

function globalSearch(keyword) {

    keyword = keyword

        .trim()

        .toLowerCase();

    return {

        students:

            cache.students.filter(

                student =>

                    JSON.stringify(student)

                    .toLowerCase()

                    .includes(keyword)

            ),

        teachers:

            cache.teachers.filter(

                teacher =>

                    JSON.stringify(teacher)

                    .toLowerCase()

                    .includes(keyword)

            ),

        demos:

            cache.demos.filter(

                demo =>

                    JSON.stringify(demo)

                    .toLowerCase()

                    .includes(keyword)

            )

    };

}



//============================================================
// FIRESTORE PAGINATION
//============================================================

let lastDemoDocument = null;

let demoLoading = false;

async function loadMoreDemos() {

    if (demoLoading) return;

    demoLoading = true;

    try {

        let q;

        if (lastDemoDocument) {

            q = query(

                demoRef,

                orderBy(

                    "createdAt",

                    "desc"

                ),

                startAfter(

                    lastDemoDocument

                ),

                limit(20)

            );

        }

        else {

            q = query(

                demoRef,

                orderBy(

                    "createdAt",

                    "desc"

                ),

                limit(20)

            );

        }

        const snap =

            await getDocs(q);

        if (

            snap.empty

        ) {

            demoLoading = false;

            return;

        }

        lastDemoDocument =

            snap.docs[

                snap.docs.length - 1

            ];

        snap.docs.forEach(docSnap => {

            cache.demos.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        renderDemoTable();

    }

    catch (e) {

        console.error(e);

    }

    finally {

        demoLoading = false;

    }

}



//============================================================
// NOTIFICATION ENGINE
//============================================================

async function pushNotification(

    title,

    message,

    type = "info"

) {

    try {

        await addDoc(

            collection(

                db,

                "notifications"

            ),

            {

                title,

                message,

                type,

                read: false,

                createdAt:

                    serverTimestamp()

            }

        );

    }

    catch (e) {

        console.error(e);

    }

}

function listenNotifications() {

    onSnapshot(

        query(

            collection(

                db,

                "notifications"

            ),

            where(

                "read",

                "==",

                false

            )

        ),

        snapshot => {

            notificationBtn.innerHTML =

                `

<i class="fa-solid fa-bell"></i>

${snapshot.size>0?

`<span class="notificationBadge">

${snapshot.size}

</span>`

:""}

`;

        }

    );

}



//============================================================
// AUTO SAVE LOCAL CACHE
//============================================================

function saveLocalCache() {

    localStorage.setItem(

        "tn_dashboard_cache",

        JSON.stringify({

            students:

                cache.students,

            teachers:

                cache.teachers,

            demos:

                cache.demos,

            fees:

                cache.fees

        })

    );

}

function loadLocalCache() {

    const data =

        localStorage.getItem(

            "tn_dashboard_cache"

        );

    if (!data) return;

    try {

        const parsed =

            JSON.parse(data);

        cache.students =

            parsed.students || [];

        cache.teachers =

            parsed.teachers || [];

        cache.demos =

            parsed.demos || [];

        cache.fees =

            parsed.fees || [];

    }

    catch (e) {

        console.error(e);

    }

}

setInterval(

    saveLocalCache,

    30000

);
//============================================================
// BACKUP & RESTORE ENGINE
//============================================================

$("backupBtn")?.addEventListener(

    "click",

    backupDatabase

);

async function backupDatabase() {

    showLoader();

    try {

        const backup = {

            exportedAt: new Date().toISOString(),

            students: cache.students,

            teachers: cache.teachers,

            demos: cache.demos,

            attendance: cache.attendance,

            fees: cache.fees,

            commissions: cache.commissions,

            settings: cache.settings

        };

        const blob = new Blob(

            [

                JSON.stringify(

                    backup,

                    null,

                    2

                )

            ],

            {

                type: "application/json"

            }

        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download =

            `TutorNest_Backup_${Date.now()}.json`;

        a.click();

        URL.revokeObjectURL(url);

        showToast(

            "Backup Downloaded"

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "Backup Failed",

            "error"

        );

    }

    finally {

        hideLoader();

    }

}



//============================================================
// DASHBOARD SUMMARY
//============================================================

function dashboardSummary() {

    const activeStudents = cache.students.filter(

        student => student.active

    ).length;

    const activeTeachers = cache.teachers.filter(

        teacher => teacher.active

    ).length;

    const pendingDemo = cache.demos.filter(

        demo =>

            demo.status === "Pending"

    ).length;

    const assignedDemo = cache.demos.filter(

        demo =>

            demo.status === "Assigned"

    ).length;

    const completedDemo = cache.demos.filter(

        demo =>

            demo.status === "Completed"

    ).length;

    const revenue = cache.fees

        .filter(

            fee =>

                fee.status === "Paid"

        )

        .reduce(

            (a, b) =>

                a + Number(b.amount || 0),

            0

        );

    return {

        activeStudents,

        activeTeachers,

        pendingDemo,

        assignedDemo,

        completedDemo,

        revenue

    };

}



//============================================================
// FIREBASE HEALTH CHECK
//============================================================

async function firebaseHealthCheck() {

    try {

        await getDocs(

            query(

                teacherRef,

                limit(1)

            )

        );

        console.log(

            "Firebase Connected"

        );

    }

    catch (error) {

        console.error(

            "Firebase Offline",

            error

        );

        showToast(

            "Firebase Connection Error",

            "error"

        );

    }

}



//============================================================
// AUTO REFRESH
//============================================================

let refreshTimer = null;

function startAutoRefresh() {

    stopAutoRefresh();

    refreshTimer = setInterval(

        () => {

            renderAnalytics();

            updateDashboardStats();

        },

        60000

    );

}

function stopAutoRefresh() {

    if (!refreshTimer) return;

    clearInterval(refreshTimer);

    refreshTimer = null;

}



//============================================================
// WINDOW ONLINE/OFFLINE
//============================================================

window.addEventListener(

    "offline",

    () => {

        showToast(

            "Internet Disconnected",

            "warning"

        );

    }

);

window.addEventListener(

    "online",

    () => {

        showToast(

            "Internet Connected"

        );

        firebaseHealthCheck();

    }

);



//============================================================
// SCROLL ACTIVE MENU
//============================================================

const sections = document.querySelectorAll(

    "section[id]"

);

const menuLinks = document.querySelectorAll(

    ".menu a"

);

window.addEventListener(

    "scroll",

    () => {

        let current = "";

        sections.forEach(section => {

            const top =

                section.offsetTop - 120;

            if (

                scrollY >= top

            ) {

                current =

                    section.id;

            }

        });

        menuLinks.forEach(link => {

            link.classList.remove(

                "active"

            );

            if (

                link.getAttribute("href") ===

                "#" + current

            ) {

                link.classList.add(

                    "active"

                );

            }

        });

    }

);



//============================================================
// ESC CLOSE MODALS
//============================================================

window.addEventListener(

    "keydown",

    e => {

        if (

            e.key !== "Escape"

        ) return;

        document

            .querySelectorAll(

                ".modal.show"

            )

            .forEach(modal =>

                closeModal(modal)

            );

    }

);



//============================================================
// FINAL INITIALIZATION
//============================================================

async function bootDashboard() {

    showLoader();

    loadLocalCache();

    loadTheme();

    firebaseHealthCheck();

    startRealtimeListeners();

    listenNotifications();

    renderAnalytics();

    updateDashboardStats();

    startAutoRefresh();

    hideLoader();

}

bootDashboard();



//============================================================
// END OF FILE
//============================================================
//============================================================
// PERFORMANCE ENGINE
//============================================================

const Performance = {

    debounceTimers: new Map(),

    debounce(key, callback, delay = 300) {

        clearTimeout(

            this.debounceTimers.get(key)

        );

        this.debounceTimers.set(

            key,

            setTimeout(callback, delay)

        );

    },

    throttleLock: false,

    throttle(callback, delay = 500) {

        if (this.throttleLock) return;

        this.throttleLock = true;

        callback();

        setTimeout(() => {

            this.throttleLock = false;

        }, delay);

    }

};



//============================================================
// SMART SEARCH
//============================================================

demoSearch?.addEventListener(

    "input",

    () =>

        Performance.debounce(

            "demo",

            renderDemoTable,

            250

        )

);

studentSearch?.addEventListener(

    "input",

    () =>

        Performance.debounce(

            "student",

            renderStudentsTable,

            250

        )

);

teacherSearch?.addEventListener(

    "input",

    () =>

        Performance.debounce(

            "teacher",

            renderTeachersTable,

            250

        )

);



//============================================================
// FIRESTORE COUNTERS
//============================================================

async function updateTeacherStudentCount(

    teacherId

) {

    const total = cache.students.filter(

        student =>

            student.teacherId === teacherId

    ).length;

    try {

        await updateDoc(

            doc(

                db,

                "teachers",

                teacherId

            ),

            {

                totalStudents: total,

                updatedAt:

                    serverTimestamp()

            }

        );

    }

    catch (e) {

        console.error(e);

    }

}

async function syncTeacherCounters() {

    for (

        const teacher of cache.teachers

    ) {

        await updateTeacherStudentCount(

            teacher.id

        );

    }

}



//============================================================
// MONTHLY REVENUE
//============================================================

function calculateMonthlyRevenue(

    month

) {

    return cache.fees

        .filter(

            fee =>

                fee.month === month &&

                fee.status === "Paid"

        )

        .reduce(

            (sum, fee) =>

                sum +

                Number(

                    fee.amount || 0

                ),

            0

        );

}

function calculatePendingRevenue(

    month

) {

    return cache.fees

        .filter(

            fee =>

                fee.month === month &&

                fee.status !== "Paid"

        )

        .reduce(

            (sum, fee) =>

                sum +

                Number(

                    fee.amount || 0

                ),

            0

        );

}



//============================================================
// TEACHER COMMISSION
//============================================================

function calculateTeacherCommission(

    teacherId,

    month

) {

    const teacher = cache.teachers.find(

        item =>

            item.id === teacherId

    );

    if (!teacher)

        return {

            total: 0,

            commission: 0

        };

    const total = cache.fees

        .filter(

            fee =>

                fee.teacherId === teacherId &&

                fee.month === month &&

                fee.status === "Paid"

        )

        .reduce(

            (sum, fee) =>

                sum +

                Number(

                    fee.amount || 0

                ),

            0

        );

    return {

        total,

        commission:

            total *

            Number(

                teacher.commission || 10

            ) /

            100

    };

}



//============================================================
// ATTENDANCE SUMMARY
//============================================================

function attendanceSummary(

    studentId

) {

    const records =

        cache.attendance.filter(

            record =>

                record.studentId ===

                studentId

        );

    const present =

        records.filter(

            r =>

                r.status ===

                "Present"

        ).length;

    const absent =

        records.filter(

            r =>

                r.status ===

                "Absent"

        ).length;

    const leave =

        records.filter(

            r =>

                r.status ===

                "Leave"

        ).length;

    return {

        total:

            records.length,

        present,

        absent,

        leave,

        percentage:

            records.length

                ? Math.round(

                    present *

                    100 /

                    records.length

                )

                : 0

    };

}



//============================================================
// DATA VALIDATION
//============================================================

function validatePhone(

    phone

) {

    return /^[6-9]\d{9}$/

        .test(

            String(phone)

            .replace(

                /\D/g,

                ""

            )

        );

}

function validateEmail(

    email

) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        .test(email);

}

function validateAmount(

    amount

) {

    return (

        !isNaN(amount) &&

        Number(amount) > 0

    );

}

function required(

    value

) {

    return String(

        value || ""

    )

    .trim()

    .length > 0;

}



//============================================================
// UUID
//============================================================

function generateCode(

    prefix

) {

    return (

        prefix +

        "-" +

        Date.now()

        .toString()

        .slice(-8) +

        "-" +

        Math.random()

        .toString(36)

        .substring(2, 6)

        .toUpperCase()

    );

}
//============================================================
// REPORTS ENGINE
//============================================================

const reportEngine = {

    daily(date = today()) {

        const attendance = cache.attendance.filter(

            record => record.date === date

        );

        const paidFees = cache.fees.filter(

            fee =>

                fee.status === "Paid" &&

                fee.paidAt &&

                fee.paidAt.toDate

                    ? fee.paidAt.toDate().toISOString().slice(0, 10) === date
                    : false

        );

        return {

            date,

            present: attendance.filter(

                x => x.status === "Present"

            ).length,

            absent: attendance.filter(

                x => x.status === "Absent"

            ).length,

            leave: attendance.filter(

                x => x.status === "Leave"

            ).length,

            feeCollection:

                paidFees.reduce(

                    (sum, fee) =>

                        sum +

                        Number(

                            fee.amount || 0

                        ),

                    0

                )

        };

    },



    monthly(month) {

        return {

            students:

                cache.students.length,

            teachers:

                cache.teachers.length,

            demos:

                cache.demos.filter(

                    demo =>

                        demo.createdAt?.toDate?.()

                        ?.toISOString()

                        .startsWith(month)

                ).length,

            fees:

                calculateMonthlyRevenue(

                    month

                ),

            pending:

                calculatePendingRevenue(

                    month

                )

        };

    }

};



//============================================================
// ADVANCED FILTER ENGINE
//============================================================

function filterStudents(filters = {}) {

    return cache.students.filter(student => {

        if (

            filters.teacher &&

            student.teacherId !== filters.teacher

        )

            return false;

        if (

            filters.class &&

            student.class !== filters.class

        )

            return false;

        if (

            filters.subject &&

            student.subject !== filters.subject

        )

            return false;

        if (

            filters.city &&

            student.city !== filters.city

        )

            return false;

        if (

            filters.active !== undefined &&

            student.active !== filters.active

        )

            return false;

        return true;

    });

}

function filterTeachers(filters = {}) {

    return cache.teachers.filter(teacher => {

        if (

            filters.subject &&

            teacher.subject !== filters.subject

        )

            return false;

        if (

            filters.city &&

            teacher.city !== filters.city

        )

            return false;

        if (

            filters.active !== undefined &&

            teacher.active !== filters.active

        )

            return false;

        return true;

    });

}



//============================================================
// FIRESTORE HELPERS
//============================================================

async function createDocument(

    collectionRef,

    data

) {

    const ref = await addDoc(

        collectionRef,

        {

            ...data,

            createdAt:

                serverTimestamp(),

            updatedAt:

                serverTimestamp()

        }

    );

    return ref.id;

}

async function updateDocument(

    collectionName,

    id,

    data

) {

    await updateDoc(

        doc(

            db,

            collectionName,

            id

        ),

        {

            ...data,

            updatedAt:

                serverTimestamp()

        }

    );

}

async function removeDocument(

    collectionName,

    id

) {

    await deleteDoc(

        doc(

            db,

            collectionName,

            id

        )

    );

}



//============================================================
// DASHBOARD KPIs
//============================================================

function calculateKPIs() {

    const activeStudents =

        cache.students.filter(

            s => s.active

        ).length;

    const activeTeachers =

        cache.teachers.filter(

            t => t.active

        ).length;

    const demoConversion =

        cache.demos.length

            ?

            Math.round(

                cache.students.length *

                100 /

                cache.demos.length

            )

            : 0;

    const attendanceRate = (() => {

        const present =

            cache.attendance.filter(

                x =>

                    x.status === "Present"

            ).length;

        return cache.attendance.length

            ?

            Math.round(

                present *

                100 /

                cache.attendance.length

            )

            : 0;

    })();

    return {

        activeStudents,

        activeTeachers,

        demoConversion,

        attendanceRate,

        monthlyRevenue:

            calculateMonthlyRevenue(

                monthValue()

            )

    };

}



//============================================================
// REALTIME CLOCK
//============================================================

function startDashboardClock() {

    const target =

        document.querySelector(

            ".topLeft p"

        );

    if (!target) return;

    setInterval(() => {

        const now = new Date();

        target.innerHTML =

            `Welcome back 👋 | ${now.toLocaleDateString("en-IN")} ${now.toLocaleTimeString("en-IN")}`;

    }, 1000);

}



//============================================================
// SESSION KEEP ALIVE
//============================================================

let lastActivity = Date.now();

["mousemove","keydown","click","touchstart"]

.forEach(event => {

    window.addEventListener(

        event,

        () => {

            lastActivity = Date.now();

        }

    );

});

setInterval(() => {

    const idleMinutes =

        (Date.now() - lastActivity)

        / 60000;

    if (idleMinutes >= 30) {

        showToast(

            "Session inactive for 30 minutes",

            "warning"

        );

    }

}, 60000);



//============================================================
// AUTO START
//============================================================

startDashboardClock();
//============================================================
// IMAGE MANAGER
//============================================================

const ImageManager = {

    async upload(file, folder = "uploads") {

        if (!file) return "";

        const extension =

            file.name.split(".").pop();

        const fileName =

            `${folder}/${Date.now()}_${Math.random()
                .toString(36)
                .substring(2,8)}.${extension}`;

        const storageRef = ref(

            storage,

            fileName

        );

        await uploadBytes(

            storageRef,

            file

        );

        return await getDownloadURL(

            storageRef

        );

    },



    async remove(downloadURL) {

        if (!downloadURL) return;

        try {

            const storageRef = ref(

                storage,

                downloadURL

            );

            await deleteObject(

                storageRef

            );

        }

        catch(error){

            console.error(error);

        }

    }

};



//============================================================
// DASHBOARD CACHE
//============================================================

const DashboardCache = {

    save() {

        localStorage.setItem(

            "TutorNestDashboard",

            JSON.stringify({

                students:

                    cache.students,

                teachers:

                    cache.teachers,

                demos:

                    cache.demos,

                attendance:

                    cache.attendance,

                fees:

                    cache.fees,

                commissions:

                    cache.commissions

            })

        );

    },



    load() {

        const data =

            localStorage.getItem(

                "TutorNestDashboard"

            );

        if(!data) return;

        try{

            const parsed=

                JSON.parse(data);

            cache.students=

                parsed.students||[];

            cache.teachers=

                parsed.teachers||[];

            cache.demos=

                parsed.demos||[];

            cache.attendance=

                parsed.attendance||[];

            cache.fees=

                parsed.fees||[];

            cache.commissions=

                parsed.commissions||[];

        }

        catch(e){

            console.error(e);

        }

    },



    clear(){

        localStorage.removeItem(

            "TutorNestDashboard"

        );

    }

};



//============================================================
// TEACHER STATISTICS
//============================================================

function teacherStatistics(id){

    const teacher=

        cache.teachers.find(

            t=>t.id===id

        );

    if(!teacher) return null;

    const students=

        cache.students.filter(

            s=>s.teacherId===id

        );

    const paidFees=

        cache.fees.filter(

            fee=>

            fee.teacherId===id &&

            fee.status==="Paid"

        );

    const totalRevenue=

        paidFees.reduce(

            (sum,item)=>

            sum+

            Number(item.amount||0),

            0

        );

    const attendance=

        cache.attendance.filter(

            a=>a.teacherId===id

        );

    const present=

        attendance.filter(

            a=>a.status==="Present"

        ).length;

    return{

        teacher,

        totalStudents:

            students.length,

        totalRevenue,

        commission:

            totalRevenue*

            Number(

                teacher.commission||10

            )/100,

        attendance,

        attendanceRate:

            attendance.length

            ?

            Math.round(

                present*

                100/

                attendance.length

            )

            :0

    };

}



//============================================================
// STUDENT STATISTICS
//============================================================

function studentStatistics(id){

    const student=

        cache.students.find(

            s=>s.id===id

        );

    if(!student) return null;

    const attendance=

        attendanceSummary(id);

    const paid=

        cache.fees.filter(

            fee=>

            fee.studentId===id &&

            fee.status==="Paid"

        );

    const pending=

        cache.fees.filter(

            fee=>

            fee.studentId===id &&

            fee.status!=="Paid"

        );

    return{

        student,

        attendance,

        totalPaid:

            paid.reduce(

                (sum,item)=>

                sum+

                Number(item.amount||0),

                0

            ),

        pendingFees:

            pending.reduce(

                (sum,item)=>

                sum+

                Number(item.amount||0),

                0

            )

    };

}



//============================================================
// FIREBASE BATCH DELETE
//============================================================

async function batchDeleteStudents(ids){

    if(!ids.length) return;

    const batch=

        writeBatch(db);

    ids.forEach(id=>{

        batch.delete(

            doc(

                db,

                "students",

                id

            )

        );

    });

    await batch.commit();

}

async function batchDeleteTeachers(ids){

    if(!ids.length) return;

    const batch=

        writeBatch(db);

    ids.forEach(id=>{

        batch.delete(

            doc(

                db,

                "teachers",

                id

            )

        );

    });

    await batch.commit();

}



//============================================================
// MONTHLY SNAPSHOT
//============================================================

async function saveMonthlySnapshot(){

    const month=

        monthValue();

    const report={

        month,

        kpi:

            calculateKPIs(),

        revenue:

            calculateMonthlyRevenue(

                month

            ),

        pendingRevenue:

            calculatePendingRevenue(

                month

            ),

        students:

            cache.students.length,

        teachers:

            cache.teachers.length,

        demos:

            cache.demos.length,

        attendance:

            cache.attendance.length,

        generatedAt:

            serverTimestamp()

    };

    await setDoc(

        doc(

            db,

            "monthlyReports",

            month

        ),

        report

    );

}



//============================================================
// AUTO CACHE SAVE
//============================================================

setInterval(

    ()=>{

        DashboardCache.save();

    },

    15000

);

DashboardCache.load();
//============================================================
// DASHBOARD INSIGHTS ENGINE
//============================================================

const DashboardInsights = {

    topTeachers(limit = 5) {

        return [...cache.teachers]

            .map(teacher => {

                const students = cache.students.filter(

                    student =>

                        student.teacherId === teacher.id

                );

                const revenue = cache.fees

                    .filter(

                        fee =>

                            fee.teacherId === teacher.id &&

                            fee.status === "Paid"

                    )

                    .reduce(

                        (sum, fee) =>

                            sum + Number(fee.amount || 0),

                        0

                    );

                return {

                    ...teacher,

                    totalStudents: students.length,

                    revenue

                };

            })

            .sort(

                (a, b) =>

                    b.revenue - a.revenue

            )

            .slice(0, limit);

    },



    topStudents(limit = 10) {

        return [...cache.students]

            .map(student => {

                const attendance =

                    attendanceSummary(student.id);

                return {

                    ...student,

                    attendance:

                        attendance.percentage

                };

            })

            .sort(

                (a, b) =>

                    b.attendance - a.attendance

            )

            .slice(0, limit);

    },



    unpaidStudents() {

        return cache.students.filter(student => {

            return cache.fees.some(

                fee =>

                    fee.studentId === student.id &&

                    fee.status !== "Paid"

            );

        });

    }

};



//============================================================
// REPORT EXPORT OBJECT
//============================================================

function buildReportObject() {

    return {

        generatedAt:

            new Date()

            .toLocaleString("en-IN"),

        dashboard:

            calculateKPIs(),

        teachers:

            DashboardInsights

            .topTeachers(),

        students:

            DashboardInsights

            .topStudents(),

        unpaid:

            DashboardInsights

            .unpaidStudents()

    };

}



//============================================================
// FIREBASE SYNC STATUS
//============================================================

const SyncEngine = {

    online: navigator.onLine,

    syncing: false,

    queue: [],

    async execute(task) {

        if (this.syncing) {

            this.queue.push(task);

            return;

        }

        this.syncing = true;

        try {

            await task();

        }

        catch (error) {

            console.error(error);

        }

        finally {

            this.syncing = false;

            if (this.queue.length) {

                const next =

                    this.queue.shift();

                this.execute(next);

            }

        }

    }

};



//============================================================
// AUTO BACKUP
//============================================================

async function automaticBackup() {

    try {

        await setDoc(

            doc(

                db,

                "system",

                "lastBackup"

            ),

            {

                generatedAt:

                    serverTimestamp(),

                students:

                    cache.students.length,

                teachers:

                    cache.teachers.length,

                demos:

                    cache.demos.length,

                attendance:

                    cache.attendance.length,

                fees:

                    cache.fees.length,

                commissions:

                    cache.commissions.length

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

setInterval(

    automaticBackup,

    1000 * 60 * 30

);



//============================================================
// SYSTEM MONITOR
//============================================================

const SystemMonitor = {

    start() {

        setInterval(() => {

            console.table({

                Students:

                    cache.students.length,

                Teachers:

                    cache.teachers.length,

                Demos:

                    cache.demos.length,

                Attendance:

                    cache.attendance.length,

                Fees:

                    cache.fees.length,

                Revenue:

                    calculateMonthlyRevenue(

                        monthValue()

                    )

            });

        }, 120000);

    }

};



//============================================================
// GLOBAL SHORTCUTS
//============================================================

window.addEventListener(

    "keydown",

    e => {

        if (

            e.ctrlKey &&

            e.key === "/"

        ) {

            e.preventDefault();

            demoSearch?.focus();

        }

        if (

            e.ctrlKey &&

            e.key.toLowerCase() === "r"

        ) {

            e.preventDefault();

            renderAnalytics();

            updateDashboardStats();

            renderDemoTable();

            renderStudentsTable();

            renderTeachersTable();

        }

        if (

            e.ctrlKey &&

            e.key.toLowerCase() === "b"

        ) {

            e.preventDefault();

            backupDatabase();

        }

    }

);



//============================================================
// MEMORY CLEANUP
//============================================================

function clearRuntimeMemory() {

    cache.attendance =

        [...cache.attendance];

    cache.students =

        [...cache.students];

    cache.teachers =

        [...cache.teachers];

    cache.demos =

        [...cache.demos];

    cache.fees =

        [...cache.fees];

    cache.commissions =

        [...cache.commissions];

}

setInterval(

    clearRuntimeMemory,

    1000 * 60 * 10

);



//============================================================
// FINAL BOOT EXTENSIONS
//============================================================

window.addEventListener(

    "load",

    () => {

        SystemMonitor.start();

        renderAnalytics();

        updateDashboardStats();

    }

);
//============================================================
// CHART ENGINE (Chart.js Ready)
//============================================================

let revenueChart = null;
let studentChart = null;

function destroyCharts() {

    if (revenueChart) {

        revenueChart.destroy();
        revenueChart = null;

    }

    if (studentChart) {

        studentChart.destroy();
        studentChart = null;

    }

}

function getMonthlyRevenueData() {

    const months = [];

    const values = [];

    for (let i = 11; i >= 0; i--) {

        const d = new Date();

        d.setMonth(d.getMonth() - i);

        const month = d.toISOString().slice(0, 7);

        months.push(

            d.toLocaleString("en-IN", {

                month: "short"

            })

        );

        values.push(

            calculateMonthlyRevenue(month)

        );

    }

    return {

        labels: months,

        values

    };

}

function getMonthlyStudentsData() {

    const labels = [];

    const values = [];

    for (let i = 11; i >= 0; i--) {

        const d = new Date();

        d.setMonth(d.getMonth() - i);

        const month = d.toISOString().slice(0, 7);

        labels.push(

            d.toLocaleString(

                "en-IN",

                {

                    month: "short"

                }

            )

        );

        values.push(

            cache.students.filter(student => {

                if (!student.createdAt?.toDate) return false;

                return student.createdAt

                    .toDate()

                    .toISOString()

                    .startsWith(month);

            }).length

        );

    }

    return {

        labels,

        values

    };

}

function renderCharts() {

    if (typeof Chart === "undefined") return;

    const revenueCanvas =

        document.getElementById(

            "revenueChart"

        );

    const studentCanvas =

        document.getElementById(

            "studentChart"

        );

    if (

        !revenueCanvas ||

        !studentCanvas

    ) return;

    destroyCharts();

    const revenue =

        getMonthlyRevenueData();

    revenueChart = new Chart(

        revenueCanvas,

        {

            type: "line",

            data: {

                labels:

                    revenue.labels,

                datasets: [

                    {

                        label:

                            "Revenue",

                        data:

                            revenue.values,

                        borderWidth: 3,

                        tension: .35,

                        fill: true

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }

    );

    const students =

        getMonthlyStudentsData();

    studentChart = new Chart(

        studentCanvas,

        {

            type: "bar",

            data: {

                labels:

                    students.labels,

                datasets: [

                    {

                        label:

                            "Admissions",

                        data:

                            students.values

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }

    );

}



//============================================================
// STUDENT ANALYTICS
//============================================================

function studentGrowthRate() {

    const currentMonth = monthValue();

    const previous = new Date();

    previous.setMonth(

        previous.getMonth() - 1

    );

    const previousMonth =

        previous

        .toISOString()

        .slice(0,7);

    const current =

        cache.students.filter(student =>

            student.createdAt?.toDate?.()

            .toISOString()

            .startsWith(currentMonth)

        ).length;

    const old =

        cache.students.filter(student =>

            student.createdAt?.toDate?.()

            .toISOString()

            .startsWith(previousMonth)

        ).length;

    if (!old) {

        return current ? 100 : 0;

    }

    return Math.round(

        ((current - old) / old) * 100

    );

}

function teacherUtilization() {

    return cache.teachers.map(

        teacher => {

            const total =

                cache.students.filter(

                    student =>

                        student.teacherId === teacher.id

                ).length;

            return {

                name:

                    teacher.name,

                students:

                    total

            };

        }

    );

}

function attendanceAnalytics() {

    const total =

        cache.attendance.length;

    const present =

        cache.attendance.filter(

            x =>

                x.status === "Present"

        ).length;

    const absent =

        cache.attendance.filter(

            x =>

                x.status === "Absent"

        ).length;

    const leave =

        cache.attendance.filter(

            x =>

                x.status === "Leave"

        ).length;

    return {

        total,

        present,

        absent,

        leave,

        percentage:

            total

            ?

            Math.round(

                present *

                100 /

                total

            )

            : 0

    };

}



//============================================================
// LIVE KPI REFRESH
//============================================================

function refreshKPIs(){

    const kpi = calculateKPIs();

    demoCount.textContent =

        cache.demos.filter(

            x=>x.status==="Pending"

        ).length;

    studentCount.textContent =

        kpi.activeStudents;

    teacherCount.textContent =

        kpi.activeTeachers;

    revenueCount.textContent =

        formatMoney(

            kpi.monthlyRevenue

        );

}

setInterval(()=>{

    refreshKPIs();
    renderCharts();

},30000);
//============================================================
// ADVANCED SEARCH ENGINE
//============================================================

const SearchEngine = {

    normalize(value) {

        return String(value || "")

            .trim()

            .toLowerCase();

    },



    search(collection, keyword, fields = []) {

        keyword = this.normalize(keyword);

        if (!keyword) return collection;

        return collection.filter(item =>

            fields.some(field =>

                this.normalize(item[field])

                .includes(keyword)

            )

        );

    },



    sort(collection, field, direction = "asc") {

        return [...collection].sort((a, b) => {

            if (a[field] > b[field])

                return direction === "asc" ? 1 : -1;

            if (a[field] < b[field])

                return direction === "asc" ? -1 : 1;

            return 0;

        });

    }

};



//============================================================
// DATE UTILITIES
//============================================================

const DateUtil = {

    today() {

        return new Date()

            .toISOString()

            .split("T")[0];

    },



    month() {

        return new Date()

            .toISOString()

            .slice(0,7);

    },



    format(date) {

        if(!date) return "--";

        if(date.toDate)

            date = date.toDate();

        return new Intl.DateTimeFormat(

            "en-IN",

            {

                day:"2-digit",

                month:"short",

                year:"numeric"

            }

        ).format(date);

    },



    timestamp(){

        return serverTimestamp();

    }

};



//============================================================
// ID GENERATOR
//============================================================

const IdGenerator={

    teacher(){

        return "TN-T-"+

            Date.now()

            .toString()

            .slice(-8);

    },



    student(){

        return "TN-S-"+

            Date.now()

            .toString()

            .slice(-8);

    },



    demo(){

        return "TN-D-"+

            Date.now()

            .toString()

            .slice(-8);

    },



    receipt(){

        return "TN-R-"+

            Date.now()

            .toString()

            .slice(-8);

    }

};



//============================================================
// PAGINATION ENGINE
//============================================================

class Pagination{

    constructor(data=[],size=10){

        this.data=data;

        this.page=1;

        this.size=size;

    }

    total(){

        return Math.ceil(

            this.data.length/

            this.size

        );

    }

    items(){

        const start=

            (this.page-1)

            *this.size;

        return this.data.slice(

            start,

            start+this.size

        );

    }

    next(){

        if(

            this.page<

            this.total()

        ){

            this.page++;

        }

        return this.items();

    }

    previous(){

        if(this.page>1){

            this.page--;

        }

        return this.items();

    }

    reset(){

        this.page=1;

    }

}



//============================================================
// LOADING BUTTON
//============================================================

function loadingButton(

    button,

    loading=true

){

    if(!button) return;

    if(loading){

        button.dataset.text=

            button.innerHTML;

        button.disabled=true;

        button.innerHTML=

        `<i class="fa-solid fa-spinner fa-spin"></i> Loading`;

    }

    else{

        button.disabled=false;

        button.innerHTML=

            button.dataset.text;

    }

}



//============================================================
// FORM VALIDATOR
//============================================================

const Validator={

    required(value){

        return String(value)

            .trim()

            .length>0;

    },



    phone(value){

        return /^[6-9]\d{9}$/

            .test(

                value

                .replace(/\D/g,"")

            );

    },



    email(value){

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

            .test(value);

    },



    number(value){

        return !isNaN(value);

    }

};



//============================================================
// CACHE OBSERVER
//============================================================

function watchCache(){

    Object.keys(cache)

    .forEach(key=>{

        Object.defineProperty(

            cache,

            key,

            {

                configurable:true,

                writable:true

            }

        );

    });

}



//============================================================
// PERFORMANCE LOGGER
//============================================================

function benchmark(

    title,

    callback

){

    const start=

        performance.now();

    callback();

    console.log(

        title,

        (

            performance.now()

            -start

        ).toFixed(2),

        "ms"

    );

}



//============================================================
// SAFE JSON
//============================================================

function clone(value){

    return JSON.parse(

        JSON.stringify(value)

    );

}



//============================================================
// FIREBASE CONNECTION WATCHER
//============================================================

window.addEventListener(

    "online",

    ()=>{

        SyncEngine.online=true;

        showToast(

            "Connected"

        );

    }

);

window.addEventListener(

    "offline",

    ()=>{

        SyncEngine.online=false;

        showToast(

            "Offline Mode",

            "warning"

        );

    }

);



//============================================================
// GLOBAL APP OBJECT
//============================================================

window.TutorNest={

    cache,

    db,

    auth,

    storage,

    reportEngine,

    DashboardInsights,

    DashboardCache,

    SearchEngine,

    Validator,

    DateUtil,

    IdGenerator,

    ImageManager

};
//============================================================
// FIREBASE TRANSACTION ENGINE
//============================================================

async function runTransactionTask(task) {

    showLoader();

    try {

        await task();

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message ||

            "Transaction Failed",

            "error"

        );

    }

    finally {

        hideLoader();

    }

}



//============================================================
// FIRESTORE CRUD SERVICE
//============================================================

const FirestoreService = {

    async create(ref, data) {

        return await addDoc(

            ref,

            {

                ...data,

                createdAt:

                    serverTimestamp(),

                updatedAt:

                    serverTimestamp()

            }

        );

    },



    async update(collectionName, id, data) {

        return await updateDoc(

            doc(

                db,

                collectionName,

                id

            ),

            {

                ...data,

                updatedAt:

                    serverTimestamp()

            }

        );

    },



    async remove(collectionName, id) {

        return await deleteDoc(

            doc(

                db,

                collectionName,

                id

            )

        );

    },



    async get(collectionName, id) {

        const snap =

            await getDoc(

                doc(

                    db,

                    collectionName,

                    id

                )

            );

        return snap.exists()

            ? {

                id: snap.id,

                ...snap.data()

            }

            : null;

    }

};



//============================================================
// LOCAL STORAGE
//============================================================

const Storage = {

    save(key, value) {

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

    },



    load(key, fallback = null) {

        try {

            const value =

                localStorage.getItem(key);

            return value

                ? JSON.parse(value)

                : fallback;

        }

        catch {

            return fallback;

        }

    },



    remove(key) {

        localStorage.removeItem(key);

    }

};



//============================================================
// DASHBOARD PREFERENCES
//============================================================

const Preference = {

    key:

        "TutorNestPreference",



    data: {

        darkMode: false,

        rowsPerPage: 20,

        autoRefresh: true,

        chart: true

    },



    load() {

        this.data =

            Storage.load(

                this.key,

                this.data

            );

    },



    save() {

        Storage.save(

            this.key,

            this.data

        );

    }

};

Preference.load();



//============================================================
// FILTER ENGINE
//============================================================

class CollectionFilter {

    constructor(data) {

        this.original = data;

        this.filtered = data;

    }

    where(field, value) {

        this.filtered =

            this.filtered.filter(

                item =>

                    item[field] === value

            );

        return this;

    }

    contains(field, value) {

        value =

            String(value)

            .toLowerCase();

        this.filtered =

            this.filtered.filter(

                item =>

                    String(

                        item[field] ||

                        ""

                    )

                    .toLowerCase()

                    .includes(value)

            );

        return this;

    }

    sort(field) {

        this.filtered.sort(

            (a,b)=>{

                if(a[field]>b[field])

                    return 1;

                if(a[field]<b[field])

                    return -1;

                return 0;

            }

        );

        return this;

    }

    result(){

        return this.filtered;

    }

}



//============================================================
// EXPORT JSON
//============================================================

function exportJSON(

    filename,

    object

){

    const blob =

        new Blob(

            [

                JSON.stringify(

                    object,

                    null,

                    2

                )

            ],

            {

                type:

                    "application/json"

            }

        );

    const url =

        URL.createObjectURL(

            blob

        );

    const a =

        document.createElement("a");

    a.href = url;

    a.download = filename;

    a.click();

    URL.revokeObjectURL(url);

}



//============================================================
// IMPORT JSON
//============================================================

async function importJSON(file){

    return new Promise(

        (resolve,reject)=>{

            const reader=

                new FileReader();

            reader.onload=()=>{

                try{

                    resolve(

                        JSON.parse(

                            reader.result

                        )

                    );

                }

                catch(error){

                    reject(error);

                }

            };

            reader.onerror=reject;

            reader.readAsText(file);

        }

    );

}



//============================================================
// CACHE STATISTICS
//============================================================

function cacheSize(){

    return {

        demos:

            cache.demos.length,

        teachers:

            cache.teachers.length,

        students:

            cache.students.length,

        attendance:

            cache.attendance.length,

        fees:

            cache.fees.length,

        commission:

            cache.commissions.length

    };

}

function logCache(){

    console.table(

        cacheSize()

    );

}



//============================================================
// AUTO LOG
//============================================================

setInterval(

    logCache,

    300000

);



//============================================================
// DEBUG HELPERS
//============================================================

window.debugDashboard=()=>{

    console.log({

        cache,

        currentUser,

        currentRole,

        kpi:

            calculateKPIs(),

        summary:

            dashboardSummary(),

        report:

            buildReportObject()

    });

};

window.clearDashboardCache=()=>{

    DashboardCache.clear();

    location.reload();

};

window.exportDashboardJSON=()=>{

    exportJSON(

        "TutorNestDashboard.json",

        buildReportObject()

    );

};



//============================================================
// INITIALIZE EXTENSIONS
//============================================================

window.addEventListener(

    "load",

    ()=>{

        Preference.load();

        renderCharts();

        refreshKPIs();

        logCache();

    }

);