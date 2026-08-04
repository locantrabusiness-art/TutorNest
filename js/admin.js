const $ = (id) => document.getElementById(id);
/* =====================================================
                RENDER DEMO BOOKINGS
===================================================== */

function renderDemoBookings() {

    if (!demoBookingsTable) return;

    const keyword = demoSearch.value.trim().toLowerCase();
    const status = demoFilter.value;

    const data = state.demoBookings.filter(item => {

        const search =
            (item.studentName || "").toLowerCase().includes(keyword) ||
            (item.phone || "").includes(keyword) ||
            (item.parentName || "").toLowerCase().includes(keyword) ||
            (item.subject || "").toLowerCase().includes(keyword) ||
            (item.area || "").toLowerCase().includes(keyword);

        const filter =
            status === "All" ||
            status === "" ||
            (item.status || "Pending") === status;

        return search && filter;

    });

    if (!data.length) {

        demoBookingsTable.innerHTML = `
        <table>
            <tr>
                <td style="padding:40px;text-align:center;">
                    No Demo Bookings Found
                </td>
            </tr>
        </table>
        `;

        return;

    }

    let html = `
    

<table class="adminTable">

<thead>

<tr>

<th>Student</th>

<th>Phone</th>

<th>Class</th>

<th>Subject</th>

<th>Area</th>

<th>Status</th>

<th>Tutor</th>

<th>Demo</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

`;

    data.forEach(item => {

        html += `

<tr>

<td>

<b>${item.studentName || "-"}</b>

<br>

<small>${item.parentName || ""}</small>

</td>

<td>${item.phone || "-"}</td>

<td>${item.class || "-"}</td>

<td>${item.subject || "-"}</td>

<td>${item.area || "-"}</td>

<td>

<span class="${statusBadge(item.status)}">

${item.status || "Pending"}

</span>

</td>

<td>

${item.assignedTeacher || "-"}

</td>

<td>

${item.demoDate || "-"}

<br>

<small>${item.demoTime || ""}</small>

</td>

<td>

<button
class="tableBtn blue"
onclick="viewBooking('${item.id}')">

<i class="fa-solid fa-eye"></i>

</button>

<button
class="tableBtn green"
onclick="openAssignModal('${item.id}')">

<i class="fa-solid fa-user-check"></i>

</button>

<button
class="tableBtn orange"
onclick="convertToPermanent('${item.id}')">

<i class="fa-solid fa-user-graduate"></i>

</button>

<button
class="tableBtn red"
onclick="openDeleteModal('demoBookings','${item.id}')">

<i class="fa-solid fa-trash"></i>

</button>

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    demoBookingsTable.innerHTML = html;

}

/* =====================================================
                STATUS BADGE
===================================================== */

function statusBadge(status) {

    switch (status) {

        case "Pending":
            return "badge pending";

        case "Assigned":
            return "badge assigned";

        case "Completed":
            return "badge completed";

        case "Cancelled":
            return "badge cancelled";

        case "Admitted":
            return "badge admitted";

        default:
            return "badge pending";

    }

}

/* =====================================================
                VIEW BOOKING
===================================================== */

window.viewBooking = function (id) {

    const booking = state.demoBookings.find(
        x => x.id === id
    );

    if (!booking) return;

    $("studentNameView").textContent =
        booking.studentName || "--";

    $("studentClassView").textContent =
        booking.class || "--";

    $("studentStatusView").textContent =
        booking.status || "Pending";

    $("studentPhoneView").textContent =
        booking.phone || "--";

    $("parentNameView").textContent =
        booking.parentName || "--";

    $("parentPhoneView").textContent =
        booking.parentPhone || "--";

    $("studentSubjectView").textContent =
        booking.subject || "--";

    $("studentAreaView").textContent =
        booking.area || "--";

    $("studentCityView").textContent =
        booking.city || "--";

    studentModal.classList.add("show");

};

/* =====================================================
                ASSIGN MODAL
===================================================== */

window.openAssignModal = function (id) {

    state.selectedBooking = id;

    const booking = state.demoBookings.find(
        x => x.id === id
    );

    if (!booking) return;

    assignStudent.value =
        booking.studentName;

    assignTutor.innerHTML =
        `<option value="">Choose Tutor</option>`;

    state.teachers

        .filter(t => t.available !== false)

        .forEach(t => {

            assignTutor.innerHTML += `

<option value="${t.id}">

${t.name}

</option>

`;

        });

    demoDate.value = "";

    demoTime.value = "";

    assignNotes.value = "";

    assignTutorModal.classList.add("show");

};

/* =====================================================
                SAVE ASSIGNMENT
===================================================== */

async function saveAssignment() {

    if (!state.selectedBooking) return;

    if (assignTutor.value === "") {

        showToast(
            "Select Tutor",
            "error"
        );

        return;

    }

    const teacher = state.teachers.find(
        x => x.id === assignTutor.value
    );

    if (!teacher) return;

    try {

        await updateDoc(

            doc(
                db,
                "demoBookings",
                state.selectedBooking
            ),

            {

                teacherId: teacher.id,

                assignedTeacher: teacher.name,

                teacherPhone: teacher.phone,

                demoDate: demoDate.value,

                demoTime: demoTime.value,

                notes: assignNotes.value,

                status: "Assigned",

                assignedAt: serverTimestamp()

            }

        );

        assignTutorModal.classList.remove("show");

        state.selectedBooking = null;

        await loadDemoBookings();

        updateDashboard();

        showToast(
            "Tutor Assigned Successfully"
        );

    }

    catch (err) {

        console.error(err);

        showToast(
            "Assignment Failed",
            "error"
        );

    }

}
/* =====================================================
                CONVERT TO PERMANENT
===================================================== */

window.convertToPermanent = function (id) {

    state.selectedStudent = id;

    $("monthlyFees").value = "";

    $("admissionDate").value =
        new Date().toISOString().split("T")[0];

    $("courseDuration").selectedIndex = 0;

    $("commissionPercent").value = 10;

    convertStudentModal.classList.add("show");

};

async function convertStudent() {

    if (!state.selectedStudent) return;

    const booking = state.demoBookings.find(
        x => x.id === state.selectedStudent
    );

    if (!booking) return;

    const fees = Number($("monthlyFees").value);

    if (!fees) {

        showToast(
            "Enter Monthly Fees",
            "error"
        );

        return;

    }

    try {

        await addDoc(

            collection(db, "students"),

            {

                bookingId: booking.id,

                studentName: booking.studentName,

                phone: booking.phone,

                parentName: booking.parentName,

                parentPhone: booking.parentPhone,

                class: booking.class,

                subject: booking.subject,

                area: booking.area,

                city: booking.city,

                teacherId: booking.teacherId,

                teacherName: booking.assignedTeacher,

                monthlyFees: fees,

                courseDuration: $("courseDuration").value,

                commission:

                Number(

                    $("commissionPercent").value

                ),

                admissionDate:

                Timestamp.fromDate(

                    new Date(

                        $("admissionDate").value

                    )

                ),

                joinedAt: serverTimestamp(),

                status: "Active"

            }

        );

        await updateDoc(

            doc(

                db,

                "demoBookings",

                booking.id

            ),

            {

                status: "Admitted",

                admittedAt: serverTimestamp()

            }

        );

        convertStudentModal.classList.remove("show");

        await loadStudents();

        await loadDemoBookings();

        updateDashboard();

        showToast(

            "Student Converted Successfully"

        );

    }

    catch (err) {

        console.error(err);

        showToast(

            "Conversion Failed",

            "error"

        );

    }

}

/* =====================================================
                RENDER STUDENTS
===================================================== */

function renderStudents() {

    if (!studentsTable) return;

    const keyword =

        studentSearch.value

        .trim()

        .toLowerCase();

    const data =

        state.students.filter(student => {

            return (

                (student.studentName || "")

                .toLowerCase()

                .includes(keyword)

                ||

                (student.phone || "")

                .includes(keyword)

                ||

                (student.teacherName || "")

                .toLowerCase()

                .includes(keyword)

                ||

                (student.subject || "")

                .toLowerCase()

                .includes(keyword)

            );

        });

    if (!data.length) {

        studentsTable.innerHTML = `

<table>

<tr>

<td style="padding:40px;text-align:center;">

No Students Found

</td>

</tr>

</table>

`;

        return;

    }

    let html = `

<table class="adminTable">

<thead>

<tr>

<th>Name</th>

<th>Phone</th>

<th>Class</th>

<th>Teacher</th>

<th>Fees</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

`;

    data.forEach(student => {

        html += `

<tr>

<td>

<b>

${student.studentName}

</b>

<br>

<small>

${student.parentName || ""}

</small>

</td>

<td>

${student.phone || "-"}

</td>

<td>

${student.class || "-"}

</td>

<td>

${student.teacherName || "-"}

</td>

<td>

₹${student.monthlyFees || 0}

</td>

<td>

<span class="badge admitted">

${student.status || "Active"}

</span>

</td>

<td>

<button

class="tableBtn blue"

onclick="viewPermanentStudent('${student.id}')">

<i class="fa-solid fa-eye"></i>

</button>

<button

class="tableBtn green"

onclick="collectStudentFee('${student.id}')">

<i class="fa-solid fa-indian-rupee-sign"></i>

</button>

<button

class="tableBtn red"

onclick="openDeleteModal('students','${student.id}')">

<i class="fa-solid fa-trash"></i>

</button>

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

/* =====================================================
                VIEW PERMANENT STUDENT
===================================================== */

window.viewPermanentStudent = function(id){

    const student = state.students.find(

        x => x.id === id

    );

    if(!student) return;

    $("studentNameView").textContent =
    student.studentName || "--";

    $("studentClassView").textContent =
    student.class || "--";

    $("studentStatusView").textContent =
    student.status || "--";

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

    studentModal.classList.add("show");

};
/* =====================================================
                COLLECT STUDENT FEE
===================================================== */

window.collectStudentFee = async function (id) {

    const student = state.students.find(
        x => x.id === id
    );

    if (!student) return;

    const amount = prompt(
        "Enter Fee Amount",
        student.monthlyFees || 0
    );

    if (amount === null) return;

    const month = prompt(
        "Enter Month (Example: August 2026)"
    );

    if (month === null) return;

    const mode = prompt(
        "Payment Mode (Cash / UPI / Bank)"
    );

    if (mode === null) return;

    try {

        await addDoc(

            collection(db, "fees"),

            {

                studentId: student.id,

                studentName: student.studentName,

                teacherId: student.teacherId,

                teacherName: student.teacherName,

                amount: Number(amount),

                month,

                paymentMode: mode,

                status: "Paid",

                createdAt: serverTimestamp()

            }

        );

        await loadFees();

        updateDashboard();

        renderFees();

        showToast("Fee Collected");

    }

    catch (err) {

        console.error(err);

        showToast("Fee Collection Failed", "error");

    }

};

/* =====================================================
                LOAD FEES TABLE
===================================================== */

function renderFees() {

    if (!feesTable) return;

    if (!state.fees.length) {

        feesTable.innerHTML = `

<table>

<tr>

<td style="padding:40px;text-align:center">

No Fee Records

</td>

</tr>

</table>

`;

        return;

    }

    let html = `

<table class="adminTable">

<thead>

<tr>

<th>Student</th>

<th>Teacher</th>

<th>Month</th>

<th>Amount</th>

<th>Mode</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    state.fees.forEach(fee => {

        html += `

<tr>

<td>

${fee.studentName || "-"}

</td>

<td>

${fee.teacherName || "-"}

</td>

<td>

${fee.month || "-"}

</td>

<td>

₹${Number(fee.amount || 0).toLocaleString()}

</td>

<td>

${fee.paymentMode || "-"}

</td>

<td>

<span class="badge admitted">

${fee.status}

</span>

</td>

<td>

<button

class="tableBtn red"

onclick="openDeleteModal('fees','${fee.id}')">

<i class="fa-solid fa-trash"></i>

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

/* =====================================================
                DELETE MODAL
===================================================== */

window.openDeleteModal = function (

    collectionName,

    id

) {

    state.deleteCollection = collectionName;

    state.deleteId = id;

    deleteModal.classList.add("show");

};

async function deleteRecord() {

    if (!state.deleteId) return;

    try {

        await deleteDoc(

            doc(

                db,

                state.deleteCollection,

                state.deleteId

            )

        );

        deleteModal.classList.remove("show");

        switch (state.deleteCollection) {

            case "demoBookings":

                await loadDemoBookings();

                break;

            case "students":

                await loadStudents();

                break;

            case "teachers":

                await loadTeachers();

                break;

            case "fees":

                await loadFees();

                renderFees();

                break;

        }

        updateDashboard();

        showToast("Deleted Successfully");

    }

    catch (err) {

        console.error(err);

        showToast("Delete Failed", "error");

    }

}

/* =====================================================
                CLOSE MODALS
===================================================== */

document

.querySelectorAll(".closeModal")

.forEach(btn => {

    btn.onclick = () => {

        btn.closest(".modal")

        .classList

        .remove("show");

    };

});

window.onclick = e => {

    [

        assignTutorModal,

        studentModal,

        convertStudentModal,

        deleteModal

    ]

    .forEach(modal => {

        if (e.target === modal) {

            modal.classList.remove("show");

        }

    });

};

document.addEventListener(

    "keydown",

    e => {

        if (e.key === "Escape") {

            [

                assignTutorModal,

                studentModal,

                convertStudentModal,

                deleteModal

            ]

            .forEach(modal => {

                modal.classList.remove("show");

            });

        }

    }

);

/* =====================================================
                AUTO REFRESH
===================================================== */

setInterval(async () => {

    await loadDemoBookings();

    await loadStudents();

    await loadTeachers();

    await loadFees();

    updateDashboard();

}, 60000);
/* =====================================================
                THEME TOGGLE
===================================================== */

function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "tn_theme",
        isDark ? "dark" : "light"
    );

    themeBtn.innerHTML = isDark
        ? `<i class="fa-solid fa-sun"></i>`
        : `<i class="fa-solid fa-moon"></i>`;

}

(function () {

    const theme =
        localStorage.getItem("tn_theme");

    if (theme === "dark") {

        document.body.classList.add("dark");

        themeBtn.innerHTML =
            `<i class="fa-solid fa-sun"></i>`;

    }

})();

/* =====================================================
                NOTIFICATIONS
===================================================== */

async function openNotifications() {

    const snap = await getDocs(

        query(

            collection(db, "notifications"),

            orderBy("createdAt", "desc"),

            limit(10)

        )

    );

    let html = "";

    snap.forEach(docSnap => {

        const n = docSnap.data();

        html += `

<div class="notificationItem">

<h4>

${n.title || "Notification"}

</h4>

<p>

${n.message || ""}

</p>

<small>

${formatDate(n.createdAt)}

</small>

</div>

`;

    });

    if (html === "") {

        html = `

<div
style="padding:20px;text-align:center;">

No Notifications

</div>

`;

    }

    analyticsCharts.innerHTML = html;

}

/* =====================================================
                ATTENDANCE
===================================================== */

function renderAttendance() {

    if (!attendanceTable) return;

    if (!state.students.length) {

        attendanceTable.innerHTML = `

<table>

<tr>

<td style="padding:40px;text-align:center;">

No Students

</td>

</tr>

</table>

`;

        return;

    }

    let html = `

<table class="adminTable">

<thead>

<tr>

<th>Student</th>

<th>Teacher</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    state.students.forEach(student => {

        const today =
            new Date()

            .toISOString()

            .split("T")[0];

        const attendance =

            state.attendance.find(a =>

                a.studentId === student.id &&

                a.date === today

            );

        html += `

<tr>

<td>

${student.studentName}

</td>

<td>

${student.teacherName}

</td>

<td>

${attendance
    ? attendance.status
    : "Not Marked"}

</td>

<td>

<button

class="tableBtn green"

onclick="markAttendance('${student.id}')">

Present

</button>

<button

class="tableBtn red"

onclick="markAbsent('${student.id}')">

Absent

</button>

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

/* =====================================================
                MARK PRESENT
===================================================== */

window.markAttendance = async function (id) {

    const student = state.students.find(

        x => x.id === id

    );

    if (!student) return;

    await addDoc(

        collection(db, "attendance"),

        {

            studentId: student.id,

            studentName: student.studentName,

            teacherId: student.teacherId,

            teacherName: student.teacherName,

            status: "Present",

            date: new Date()

                .toISOString()

                .split("T")[0],

            createdAt: serverTimestamp()

        }

    );

    await loadAttendance();

    renderAttendance();

    showToast("Attendance Marked");

};

/* =====================================================
                MARK ABSENT
===================================================== */

window.markAbsent = async function (id) {

    const student = state.students.find(

        x => x.id === id

    );

    if (!student) return;

    await addDoc(

        collection(db, "attendance"),

        {

            studentId: student.id,

            studentName: student.studentName,

            teacherId: student.teacherId,

            teacherName: student.teacherName,

            status: "Absent",

            date: new Date()

                .toISOString()

                .split("T")[0],

            createdAt: serverTimestamp()

        }

    );

    await loadAttendance();

    renderAttendance();

    showToast("Attendance Updated");

};

/* =====================================================
                DATE FORMAT
===================================================== */

function formatDate(date) {

    if (!date) return "-";

    if (date.seconds) {

        return new Date(

            date.seconds * 1000

        ).toLocaleString();

    }

    return new Date(date)

        .toLocaleString();

}
/* =====================================================
                REPORTS
===================================================== */

function renderReports() {

    if (!analyticsCharts) return;

    const totalRevenue = state.fees.reduce(

        (sum, fee) => sum + Number(fee.amount || 0),

        0

    );

    const pendingDemo = state.demoBookings.filter(

        x => (x.status || "Pending") === "Pending"

    ).length;

    const assignedDemo = state.demoBookings.filter(

        x => x.status === "Assigned"

    ).length;

    const admittedStudents = state.students.length;

    analyticsCharts.innerHTML = `

<div class="reportGrid">

<div class="reportCard">

<h2>${state.demoBookings.length}</h2>

<p>Total Demo Bookings</p>

</div>

<div class="reportCard">

<h2>${pendingDemo}</h2>

<p>Pending Demo</p>

</div>

<div class="reportCard">

<h2>${assignedDemo}</h2>

<p>Assigned Demo</p>

</div>

<div class="reportCard">

<h2>${admittedStudents}</h2>

<p>Permanent Students</p>

</div>

<div class="reportCard">

<h2>${state.teachers.length}</h2>

<p>Total Teachers</p>

</div>

<div class="reportCard">

<h2>₹${totalRevenue.toLocaleString()}</h2>

<p>Total Revenue</p>

</div>

</div>

`;

}

/* =====================================================
                SETTINGS
===================================================== */

$("saveSettings").onclick = async () => {

    try {

        await updateDoc(

            doc(db, "settings", "company"),

            {

                companyName: $("companyName").value,

                founder: $("founderName").value,

                phone: $("companyPhone").value,

                whatsapp: $("companyWhatsapp").value,

                email: $("companyEmail").value,

                location: $("companyLocation").value,

                tagline: $("companyTagline").value,

                updatedAt: serverTimestamp()

            }

        );

        showToast("Settings Saved");

    }

    catch (err) {

        console.error(err);

        showToast("Unable To Save", "error");

    }

};

/* =====================================================
                EXPORT EXCEL
===================================================== */

$("exportExcel").onclick = () => {

    let csv =

`Student,Phone,Teacher,Class,Subject,Status\n`;

    state.students.forEach(student => {

        csv +=

`${student.studentName},

${student.phone},

${student.teacherName},

${student.class},

${student.subject},

${student.status}

\n`;

    });

    const blob = new Blob(

        [csv],

        {

            type:

            "text/csv;charset=utf-8;"

        }

    );

    const url =

        URL.createObjectURL(blob);

    const link =

        document.createElement("a");

    link.href = url;

    link.download =

        "TutorNest-Students.csv";

    link.click();

};

/* =====================================================
                EXPORT PDF
===================================================== */

$("exportPDF").onclick = () => {

    window.print();

};

/* =====================================================
                COMMISSION
===================================================== */

function renderCommission() {

    if (!commissionTable) return;

    let html = `

<table class="adminTable">

<thead>

<tr>

<th>Teacher</th>

<th>Students</th>

<th>Revenue</th>

<th>Commission</th>

</tr>

</thead>

<tbody>

`;

    state.teachers.forEach(teacher => {

        const students =

            state.students.filter(

                x => x.teacherId === teacher.id

            );

        let revenue = 0;

        students.forEach(student => {

            revenue +=

            Number(student.monthlyFees || 0);

        });

        const commission =

            revenue * 0.10;

        html += `

<tr>

<td>

${teacher.name}

</td>

<td>

${students.length}

</td>

<td>

₹${revenue.toLocaleString()}

</td>

<td>

₹${commission.toLocaleString()}

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

/* =====================================================
                FLOATING ACTIONS
===================================================== */

window.scrollToTop = () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

};

/* =====================================================
                INITIAL PAGE LOAD
===================================================== */

window.addEventListener(

    "load",

    () => {

        renderReports();

        renderAttendance();

        renderFees();

        renderCommission();

    }

);

/* =====================================================
                ONLINE / OFFLINE
===================================================== */

window.addEventListener(

    "online",

    () => {

        showToast(

            "Internet Connected"

        );

    }

);

window.addEventListener(

    "offline",

    () => {

        showToast(

            "Internet Disconnected",

            "error"

        );

    }

);

/* =====================================================
                END OF CHUNK
===================================================== */
/* =====================================================
                TEACHER SEARCH
===================================================== */

function renderTeachers() {

    if (!teachersTable) return;

    const keyword =
        teacherSearch.value
        .trim()
        .toLowerCase();

    const teachers =

        state.teachers.filter(t =>

            (t.name || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (t.phone || "")
            .includes(keyword)

            ||

            (t.subjects || [])
            .join(",")
            .toLowerCase()
            .includes(keyword)

            ||

            (t.areas || [])
            .join(",")
            .toLowerCase()
            .includes(keyword)

        );

    if (!teachers.length) {

        teachersTable.innerHTML = `

<table>

<tr>

<td style="padding:40px;text-align:center;">

No Teachers Found

</td>

</tr>

</table>

`;

        return;

    }

    let html = `

<table class="adminTable">

<thead>

<tr>

<th>Name</th>

<th>Phone</th>

<th>Subjects</th>

<th>Areas</th>

<th>Students</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

`;

    teachers.forEach(teacher => {

        const totalStudents =

            state.students.filter(

                x =>

                x.teacherId === teacher.id

            ).length;

        html += `

<tr>

<td>

${teacher.name}

</td>

<td>

${teacher.phone}

</td>

<td>

${(teacher.subjects || [])

.join(", ")}

</td>

<td>

${(teacher.areas || [])

.join(", ")}

</td>

<td>

${totalStudents}

</td>

<td>

<span class="badge ${teacher.available===false?"pending":"admitted"}">

${teacher.available===false?"Busy":"Available"}

</span>

</td>

<td>

<button

class="tableBtn blue"

onclick="toggleTeacherAvailability('${teacher.id}')">

<i class="fa-solid fa-repeat"></i>

</button>

<button

class="tableBtn red"

onclick="openDeleteModal('teachers','${teacher.id}')">

<i class="fa-solid fa-trash"></i>

</button>

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

/* =====================================================
            TOGGLE AVAILABILITY
===================================================== */

window.toggleTeacherAvailability = async function(id){

    const teacher =

        state.teachers.find(

            x=>x.id===id

        );

    if(!teacher) return;

    try{

        await updateDoc(

            doc(db,"teachers",id),

            {

                available:

                !teacher.available

            }

        );

        await loadTeachers();

        renderTeachers();

        showToast(

            "Teacher Updated"

        );

    }

    catch(err){

        console.error(err);

        showToast(

            "Unable To Update",

            "error"

        );

    }

};

/* =====================================================
                ADD TEACHER
===================================================== */

$("newTeacherBtn").onclick=async()=>{

    const name=

    prompt("Teacher Name");

    if(!name) return;

    const phone=

    prompt("Phone");

    if(!phone) return;

    const subjects=

    prompt("Subjects (Comma Separated)");

    const areas=

    prompt("Areas (Comma Separated)");

    try{

        await addDoc(

            collection(db,"teachers"),

            {

                name,

                phone,

                subjects:

                subjects

                ?subjects

                .split(",")

                .map(x=>x.trim())

                :[],

                areas:

                areas

                ?areas

                .split(",")

                .map(x=>x.trim())

                :[],

                available:true,

                createdAt:

                serverTimestamp()

            }

        );

        await loadTeachers();

        renderTeachers();

        updateDashboard();

        showToast(

            "Teacher Added"

        );

    }

    catch(err){

        console.error(err);

        showToast(

            "Unable To Add",

            "error"

        );

    }

};

/* =====================================================
                ADD STUDENT
===================================================== */

$("addPermanentStudent").onclick=()=>{

    alert(

"Students are created automatically after demo conversion."

    );

};

/* =====================================================
                QUICK ACTIONS
===================================================== */

$("addTeacherBtn").onclick=()=>{

    $("newTeacherBtn").click();

};

$("assignDemoBtn").onclick=()=>{

    document

    .getElementById("demoBookings")

    .scrollIntoView({

        behavior:"smooth"

    });

};

$("addStudentBtn").onclick=()=>{

    document

    .getElementById("students")

    .scrollIntoView({

        behavior:"smooth"

    });

};

$("feesBtn").onclick=()=>{

    document

    .getElementById("fees")

    .scrollIntoView({

        behavior:"smooth"

    });

};

$("attendanceBtn").onclick=()=>{

    document

    .getElementById("attendance")

    .scrollIntoView({

        behavior:"smooth"

    });

};

$("reportBtn").onclick=()=>{

    document

    .getElementById("reports")

    .scrollIntoView({

        behavior:"smooth"

    });

};
/* =====================================================
                SIDEBAR ACTIVE MENU
===================================================== */

const sections = document.querySelectorAll("section[id]");

const navLinks = document.querySelectorAll(".menu a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const top = section.offsetTop - 150;
        const height = section.offsetHeight;

        if (scrollY >= top && scrollY < top + height) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});

/* =====================================================
                SMOOTH NAVIGATION
===================================================== */

navLinks.forEach(link => {

    link.addEventListener("click", e => {

        e.preventDefault();

        const target = document.querySelector(

            link.getAttribute("href")

        );

        if (!target) return;

        target.scrollIntoView({

            behavior: "smooth"

        });

    });

});

/* =====================================================
                SAVE COMPANY SETTINGS
===================================================== */

async function saveCompanySettings() {

    try {

        await updateDoc(

            doc(db, "settings", "company"),

            {

                companyName: $("companyName").value.trim(),

                founder: $("founderName").value.trim(),

                phone: $("companyPhone").value.trim(),

                whatsapp: $("companyWhatsapp").value.trim(),

                email: $("companyEmail").value.trim(),

                location: $("companyLocation").value.trim(),

                tagline: $("companyTagline").value.trim(),

                updatedAt: serverTimestamp()

            }

        );

        showToast("Settings Updated");

    }

    catch (error) {

        console.error(error);

        showToast(

            "Unable To Save",

            "error"

        );

    }

}

$("saveSettings").onclick = saveCompanySettings;

/* =====================================================
                ATTENDANCE DATE
===================================================== */

if ($("attendanceDate")) {

    $("attendanceDate").value =

        new Date()

        .toISOString()

        .split("T")[0];

}

/* =====================================================
                FEES MONTH
===================================================== */

if ($("feesMonth")) {

    $("feesMonth").value =

        new Date()

        .toISOString()

        .slice(0, 7);

}

/* =====================================================
                COMMISSION MONTH
===================================================== */

if ($("commissionMonth")) {

    $("commissionMonth").value =

        new Date()

        .toISOString()

        .slice(0, 7);

}

/* =====================================================
                EXPORT REPORT
===================================================== */

$("reportBtn").onclick = () => {

    $("reports").scrollIntoView({

        behavior: "smooth"

    });

};

$("exportPDF").onclick = () => {

    window.print();

};

/* =====================================================
                SEARCH SHORTCUT
===================================================== */

document.addEventListener(

    "keydown",

    e => {

        if (

            e.ctrlKey &&

            e.key.toLowerCase() === "f"

        ) {

            e.preventDefault();

            demoSearch.focus();

        }

    }

);

/* =====================================================
                NETWORK STATUS
===================================================== */

window.addEventListener(

    "online",

    () => {

        showToast("Internet Connected");

    }

);

window.addEventListener(

    "offline",

    () => {

        showToast(

            "Internet Disconnected",

            "error"

        );

    }

);

/* =====================================================
                DASHBOARD REFRESH
===================================================== */

async function refreshDashboard() {

    showLoader();

    try {

        await Promise.all([

            loadDemoBookings(),

            loadStudents(),

            loadTeachers(),

            loadFees(),

            loadAttendance()

        ]);

        updateDashboard();

        renderReports();

        renderAttendance();

        renderFees();

        renderCommission();

    }

    catch (err) {

        console.error(err);

    }

    finally {

        hideLoader();

    }

}

/* =====================================================
                AUTO REFRESH
===================================================== */

setInterval(

    refreshDashboard,

    60000

);

/* =====================================================
                WINDOW FUNCTIONS
===================================================== */

window.refreshDashboard = refreshDashboard;

window.renderReports = renderReports;

window.renderFees = renderFees;

window.renderTeachers = renderTeachers;

window.renderStudents = renderStudents;

window.renderAttendance = renderAttendance;

window.renderCommission = renderCommission;

/* =====================================================
                APP READY
===================================================== */

console.clear();

console.log("==========================================");
console.log(" TutorNest Admin Dashboard V2 Loaded");
console.log("==========================================");
console.log("✓ Firebase Connected");
console.log("✓ Authentication Ready");
console.log("✓ Demo Booking Module Ready");
console.log("✓ Students Module Ready");
console.log("✓ Teachers Module Ready");
console.log("✓ Attendance Module Ready");
console.log("✓ Fees Module Ready");
console.log("✓ Commission Module Ready");
console.log("✓ Reports Module Ready");
console.log("✓ Settings Module Ready");
console.log("✓ Notifications Ready");
console.log("✓ Dashboard Ready");
console.log("==========================================");
/* ==========================================================
ATTENDANCE HISTORY MODULE
Paste at END of admin.js
========================================================== */

let attendanceHistoryStudent = null;
let attendanceHistory = [];

const attendanceHistoryModal =
document.getElementById(
"attendanceHistoryModal"
);

window.viewAttendanceHistory =
async function(studentId){

attendanceHistoryStudent =
state.students.find(
x=>x.id===studentId
);

if(!attendanceHistoryStudent)return;

document.getElementById(
"attendanceStudentName"
).textContent=
attendanceHistoryStudent.studentName;

document.getElementById(
"attendanceStudentClass"
).textContent=
attendanceHistoryStudent.class;

document.getElementById(
"attendanceStudentTeacher"
).textContent=
attendanceHistoryStudent.teacherName;

attendanceHistoryModal
.classList.add("show");

await loadAttendanceHistory();

};

async function loadAttendanceHistory(){

showLoader();

attendanceHistory=[];

const monthInput=
document.getElementById(
"attendanceMonth"
);

if(monthInput.value===""){

monthInput.value=
new Date()
.toISOString()
.slice(0,7);

}

const month=
monthInput.value;

const snap=
await getDocs(

query(

collection(db,"attendance"),

where(

"studentId",

"==",

attendanceHistoryStudent.id

),

orderBy("date","desc")

)

);

snap.forEach(docSnap=>{

attendanceHistory.push({

id:docSnap.id,

...docSnap.data()

});

});

const filtered=

attendanceHistory.filter(a=>

a.date.startsWith(month)

);

renderAttendanceHistory(filtered);

hideLoader();

}

document
.getElementById(
"attendanceMonth"
)
.addEventListener(

"change",

()=>{

loadAttendanceHistory();

}

);

function renderAttendanceHistory(data){

let present=0;
let absent=0;
let leave=0;

data.forEach(item=>{

if(item.status==="Present")
present++;

if(item.status==="Absent")
absent++;

if(item.status==="Leave")
leave++;

});

const total=

present+
absent+
leave;

const percent=

total===0
?0
:Math.round(
present*100/total
);

document.getElementById(
"presentCount"
).textContent=present;

document.getElementById(
"absentCount"
).textContent=absent;

document.getElementById(
"leaveCount"
).textContent=leave;

document.getElementById(
"attendancePercent"
).textContent=

percent+"%";

document.getElementById(
"attendanceBar"
).style.width=

percent+"%";

renderAttendanceCalendar(data);

renderAttendanceTable(data);

}

function renderAttendanceCalendar(data){

const calendar=

document.getElementById(
"attendanceCalendar"
);

calendar.innerHTML="";

if(data.length===0){

calendar.innerHTML=

"<p>No Attendance Found</p>";

return;

}

data.reverse().forEach(item=>{

const div=
document.createElement("div");

div.className=

"attendanceDay "+

item.status.toLowerCase();

const today=

new Date()

.toISOString()

.split("T")[0];

if(item.date===today){

div.classList.add("today");

}

div.innerHTML=`

<strong>

${item.date.split("-")[2]}

</strong>

<br>

<small>

${item.status}

</small>

`;

calendar.appendChild(div);

});

}

function renderAttendanceTable(data){

const table=

document.getElementById(
"attendanceHistoryTable"
);

if(data.length===0){

table.innerHTML=`

<table>

<tr>

<td
style="padding:40px;
text-align:center;">

No Attendance

</td>

</tr>

</table>

`;

return;

}

let html=`

<table>

<thead>

<tr>

<th>Date</th>

<th>Status</th>

<th>Teacher</th>

<th>Remark</th>

</tr>

</thead>

<tbody>

`;

data.forEach(item=>{

let cls="";

if(item.status==="Present")
cls="statusPresent";

if(item.status==="Absent")
cls="statusAbsent";

if(item.status==="Leave")
cls="statusLeave";

html+=`

<tr>

<td>

${item.date}

</td>

<td>

<span
class="${cls}">

${item.status}

</span>

</td>

<td>

${item.teacherName||"-"}

</td>

<td>

${item.remark||"-"}

</td>

</tr>

`;

});

html+=`

</tbody>

</table>

`;

table.innerHTML=html;

}

/* ==========================================================
OPEN BUTTON FROM STUDENTS TABLE
========================================================== */

const oldRenderStudents=
renderStudents;

renderStudents=function(){

oldRenderStudents();

document

.querySelectorAll(

".attendanceBtn"

)

.forEach(btn=>{

btn.onclick=()=>{

viewAttendanceHistory(

btn.dataset.id

);

};

});

};

/* ==========================================================
EXPORT EXCEL
========================================================== */

document

.getElementById(

"exportAttendanceExcel"

)

.onclick=()=>{

let csv=

"Date,Status,Teacher,Remark\n";

attendanceHistory.forEach(a=>{

csv+=

`${a.date},

${a.status},

${a.teacherName},

${a.remark||""}

\n`;

});

const blob=

new Blob(

[csv],

{

type:

"text/csv"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download=

attendanceHistoryStudent.studentName+

"-attendance.csv";

a.click();

};

/* ==========================================================
EXPORT PDF
========================================================== */

document

.getElementById(

"exportAttendancePDF"

)

.onclick=()=>{

window.print();

};
/* ==========================================================


/* ==========================================================
ATTENDANCE ANALYTICS
========================================================== */

async function calculateAttendanceAnalytics(){

let totalPresent=0;
let totalAbsent=0;
let totalLeave=0;

state.attendance.forEach(a=>{

switch(a.status){

case "Present":
totalPresent++;
break;

case "Absent":
totalAbsent++;
break;

case "Leave":
totalLeave++;
break;

}

});

const total=

totalPresent+
totalAbsent+
totalLeave;

const percentage=

total===0
?0
:Math.round(
(totalPresent*100)/total
);

const dashboard=document.getElementById(
"analyticsCharts"
);

dashboard.innerHTML+=`

<div class="reportGrid">

<div class="reportCard">

<h2>

${totalPresent}

</h2>

<p>

Present

</p>

</div>

<div class="reportCard">

<h2>

${totalAbsent}

</h2>

<p>

Absent

</p>

</div>

<div class="reportCard">

<h2>

${totalLeave}

</h2>

<p>

Leave

</p>

</div>

<div class="reportCard">

<h2>

${percentage}%

</h2>

<p>

Attendance %

</p>

</div>

</div>

`;

}

/* ==========================================================
MONTHLY ATTENDANCE REPORT
========================================================== */

window.monthlyAttendanceReport=

async function(month){

showLoader();

const snap=

await getDocs(

query(

collection(db,"attendance"),

orderBy("date","desc")

)

);

let data=[];

snap.forEach(doc=>{

const d=doc.data();

if(d.date.startsWith(month)){

data.push(d);

}

});

let grouped={};

data.forEach(item=>{

if(!grouped[item.studentId]){

grouped[item.studentId]={

name:item.studentName,

present:0,

absent:0,

leave:0

};

}

switch(item.status){

case "Present":

grouped[item.studentId]

.present++;

break;

case "Absent":

grouped[item.studentId]

.absent++;

break;

case "Leave":

grouped[item.studentId]

.leave++;

break;

}

});

let html=`

<table class="adminTable">

<thead>

<tr>

<th>

Student

</th>

<th>

Present

</th>

<th>

Absent

</th>

<th>

Leave

</th>

<th>

Percentage

</th>

</tr>

</thead>

<tbody>

`;

Object.values(grouped)

.forEach(student=>{

const total=

student.present+

student.absent+

student.leave;

const per=

total===0
?0
:Math.round(
student.present*100/total
);

html+=`

<tr>

<td>

${student.name}

</td>

<td>

${student.present}

</td>

<td>

${student.absent}

</td>

<td>

${student.leave}

</td>

<td>

${per}%

</td>

</tr>

`;

});

html+=`

</tbody>

</table>

`;

document.getElementById(

"analyticsCharts"

).innerHTML=

html;

hideLoader();

};

/* ==========================================================
TODAY SUMMARY
========================================================== */

async function todayAttendance(){

const today=

new Date()

.toISOString()

.split("T")[0];

const present=

state.attendance.filter(

a=>

a.date===today &&

a.status==="Present"

).length;

const absent=

state.attendance.filter(

a=>

a.date===today &&

a.status==="Absent"

).length;

const leave=

state.attendance.filter(

a=>

a.date===today &&

a.status==="Leave"

).length;

console.log({

present,

absent,

leave

});

}

/* ==========================================================
INITIALIZE
========================================================== */

document

.addEventListener(

"DOMContentLoaded",

()=>{

calculateAttendanceAnalytics();

todayAttendance();

}

);
/* ==========================================================
TEACHER ATTENDANCE DASHBOARD
PASTE AT END OF admin.js
========================================================== */

window.viewTeacherAttendance =
async function(teacherId){

showLoader();

const teacher=

state.teachers.find(

t=>t.id===teacherId

);

if(!teacher){

hideLoader();

return;

}

const students=

state.students.filter(

s=>s.teacherId===teacherId

);

let html=`

<h2 style="margin-bottom:25px;">

${teacher.name}

Attendance Dashboard

</h2>

<table class="adminTable">

<thead>

<tr>

<th>

Student

</th>

<th>

Present

</th>

<th>

Absent

</th>

<th>

Leave

</th>

<th>

Percentage

</th>

<th>

Action

</th>

</tr>

</thead>

<tbody>

`;

for(const student of students){

const attendance=

state.attendance.filter(

a=>

a.studentId===student.id

);

const present=

attendance.filter(

a=>a.status==="Present"

).length;

const absent=

attendance.filter(

a=>a.status==="Absent"

).length;

const leave=

attendance.filter(

a=>a.status==="Leave"

).length;

const total=

present+

absent+

leave;

const percent=

total===0

?0

:Math.round(

present*100/total

);

html+=`

<tr>

<td>

${student.studentName}

</td>

<td>

${present}

</td>

<td>

${absent}

</td>

<td>

${leave}

</td>

<td>

${percent}%

</td>

<td>

<button

class="tableBtn blue"

onclick="viewAttendanceHistory('${student.id}')">

History

</button>

</td>

</tr>

`;

}

html+=`

</tbody>

</table>

`;

document.getElementById(

"analyticsCharts"

).innerHTML=

html;

hideLoader();

};

/* ==========================================================
MONTHLY RANKING
========================================================== */

window.studentAttendanceRanking=

function(){

let ranking=[];

state.students.forEach(student=>{

const attendance=

state.attendance.filter(

a=>

a.studentId===student.id

);

const present=

attendance.filter(

a=>a.status==="Present"

).length;

const absent=

attendance.filter(

a=>a.status==="Absent"

).length;

const leave=

attendance.filter(

a=>a.status==="Leave"

).length;

const total=

present+

absent+

leave;

const percentage=

total===0

?0

:Math.round(

present*100/total

);

ranking.push({

name:student.studentName,

percentage

});

});

ranking.sort(

(a,b)=>

b.percentage-

a.percentage

);

let html=`

<table class="adminTable">

<thead>

<tr>

<th>

Rank

</th>

<th>

Student

</th>

<th>

Attendance

</th>

</tr>

</thead>

<tbody>

`;

ranking.forEach(

(student,index)=>{

html+=`

<tr>

<td>

#${index+1}

</td>

<td>

${student.name}

</td>

<td>

${student.percentage}%

</td>

</tr>

`;

});

html+=`

</tbody>

</table>

`;

document.getElementById(

"analyticsCharts"

).innerHTML=

html;

};

/* ==========================================================
LOW ATTENDANCE ALERT
========================================================== */

window.lowAttendanceStudents=

function(){

const low=[];

state.students.forEach(student=>{

const attendance=

state.attendance.filter(

a=>

a.studentId===student.id

);

const present=

attendance.filter(

a=>a.status==="Present"

).length;

const absent=

attendance.filter(

a=>a.status==="Absent"

).length;

const leave=

attendance.filter(

a=>a.status==="Leave"

).length;

const total=

present+

absent+

leave;

const per=

total===0

?0

:Math.round(

present*100/total

);

if(per<75){

low.push({

student,

per

});

}

});

if(low.length===0){

showToast(

"All Students Above 75%"

);

return;

}

let message="";

low.forEach(x=>{

message+=

`${x.student.studentName}

 (${x.per}%)

\n`;

});

alert(

"Low Attendance Students\n\n"+

message

);

};

/* ==========================================================
AUTO DAILY CHECK
========================================================== */

setTimeout(()=>{

lowAttendanceStudents();

},3000);
/* ==========================================================
PARENT ATTENDANCE REPORT
PASTE AT END OF admin.js
========================================================== */

window.generateParentAttendanceReport =
function(studentId){

const student =
state.students.find(
x=>x.id===studentId
);

if(!student) return;

const attendance =
state.attendance.filter(
a=>a.studentId===studentId
);

const present =
attendance.filter(
a=>a.status==="Present"
).length;

const absent =
attendance.filter(
a=>a.status==="Absent"
).length;

const leave =
attendance.filter(
a=>a.status==="Leave"
).length;

const total =
present+absent+leave;

const percentage =
total===0
?0
:Math.round(
(present*100)/total
);

let html=`

<div class="parentAttendanceCard">

<h2>

Attendance Report

</h2>

<hr>

<p>

<b>Student :</b>

${student.studentName}

</p>

<p>

<b>Teacher :</b>

${student.teacherName}

</p>

<p>

<b>Class :</b>

${student.class}

</p>

<p>

<b>Present :</b>

${present}

</p>

<p>

<b>Absent :</b>

${absent}

</p>

<p>

<b>Leave :</b>

${leave}

</p>

<p>

<b>Attendance :</b>

${percentage}%

</p>

</div>

`;

document
.getElementById(
"analyticsCharts"
)
.innerHTML=html;

};

/* ==========================================================
STUDENT PROFILE SUMMARY
========================================================== */

window.studentSummary =
function(studentId){

const student=
state.students.find(
s=>s.id===studentId
);

if(!student)return;

const fees=
state.fees.filter(
f=>f.studentId===studentId
);

const attendance=
state.attendance.filter(
a=>a.studentId===studentId
);

const paid=
fees.reduce(
(sum,x)=>
sum+Number(x.amount||0),
0
);

const present=
attendance.filter(
x=>x.status==="Present"
).length;

const absent=
attendance.filter(
x=>x.status==="Absent"
).length;

const leave=
attendance.filter(
x=>x.status==="Leave"
).length;

const total=
present+absent+leave;

const attendancePercent=
total===0
?0
:Math.round(
present*100/total
);

document.getElementById(
"analyticsCharts"
).innerHTML=`

<div class="reportGrid">

<div class="reportCard">

<h2>

${student.studentName}

</h2>

<p>

Student

</p>

</div>

<div class="reportCard">

<h2>

₹${paid}

</h2>

<p>

Total Fees Paid

</p>

</div>

<div class="reportCard">

<h2>

${attendancePercent}%

</h2>

<p>

Attendance

</p>

</div>

<div class="reportCard">

<h2>

${student.teacherName}

</h2>

<p>

Assigned Teacher

</p>

</div>

</div>

`;

};

/* ==========================================================
BULK ATTENDANCE
========================================================== */

window.bulkAttendance =
async function(status){

const date=
document.getElementById(
"attendanceDate"
).value;

if(!date){

showToast(
"Select Date",
"error"
);

return;

}

showLoader();

for(const student of state.students){

await addDoc(

collection(db,"attendance"),

{

studentId:student.id,

studentName:student.studentName,

teacherId:student.teacherId,

teacherName:student.teacherName,

status,

date,

createdAt:serverTimestamp()

}

);

}

hideLoader();

await loadAttendance();

renderAttendance();

showToast(

"Bulk Attendance Saved"

);

};

/* ==========================================================
TODAY PRESENT %
========================================================== */

window.todayAttendancePercentage=
function(){

const today=

new Date()

.toISOString()

.split("T")[0];

const todayAttendance=

state.attendance.filter(

a=>a.date===today

);

if(todayAttendance.length===0){

return 0;

}

const present=

todayAttendance.filter(

a=>a.status==="Present"

).length;

return Math.round(

(present*100)/

todayAttendance.length

);

};

/* ==========================================================
DASHBOARD ATTENDANCE CARD
========================================================== */

function updateAttendanceDashboard(){

const percentage=

todayAttendancePercentage();

const card=document.createElement("div");

card.className="statCard blue";

card.innerHTML=`

<div>

<h5>

Today's Attendance

</h5>

<h2>

${percentage}%

</h2>

<p>

Overall Present

</p>

</div>

<i class="fa-solid fa-calendar-check"></i>

`;

const stats=

document.querySelector(

".statsGrid"

);

if(stats){

stats.appendChild(card);

}

}

document.addEventListener(

"DOMContentLoaded",

()=>{

setTimeout(

updateAttendanceDashboard,

1500

);

});
/* ==========================================================
ATTENDANCE EDIT / DELETE / REMARKS
PASTE AT END OF admin.js
========================================================== */

window.editAttendance = async function(id){

const record =
attendanceHistory.find(
x=>x.id===id
);

if(!record) return;

const status = prompt(
"Status (Present/Absent/Leave)",
record.status
);

if(status===null) return;

const remark = prompt(
"Remark",
record.remark || ""
);

try{

await updateDoc(

doc(
db,
"attendance",
id
),

{

status,

remark,

updatedAt:serverTimestamp()

}

);

showToast(

"Attendance Updated"

);

await loadAttendance();

await loadAttendanceHistory();

renderAttendance();

}catch(err){

console.error(err);

showToast(

"Update Failed",

"error"

);

}

};

window.deleteAttendance =
async function(id){

if(!confirm(
"Delete Attendance?"
)) return;

try{

await deleteDoc(

doc(
db,
"attendance",
id
)

);

attendanceHistory=
attendanceHistory.filter(
x=>x.id!==id
);

renderAttendanceHistory(
attendanceHistory
);

showToast(
"Attendance Deleted"
);

}catch(err){

console.error(err);

showToast(
"Delete Failed",
"error"
);

}

};

/* ==========================================================
REPLACE renderAttendanceTable()
ACTION COLUMN ONLY
========================================================== */

/*

<th>Action</th>

<td>

<button
class="tableBtn green"
onclick="editAttendance('${item.id}')">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="tableBtn red"
onclick="deleteAttendance('${item.id}')">

<i class="fa-solid fa-trash"></i>

</button>

</td>

*/

/* ==========================================================
ATTENDANCE STREAK
========================================================== */

window.studentAttendanceStreak=
function(studentId){

const records=

state.attendance

.filter(

a=>a.studentId===studentId

)

.sort(

(a,b)=>

a.date.localeCompare(b.date)

);

let streak=0;

for(let i=records.length-1;i>=0;i--){

if(records[i].status==="Present"){

streak++;

}else{

break;

}

}

return streak;

};

/* ==========================================================
TOP 10 ATTENDANCE
========================================================== */

window.topAttendanceStudents=
function(){

const result=[];

state.students.forEach(student=>{

const attendance=

state.attendance.filter(

a=>a.studentId===student.id

);

const present=

attendance.filter(

a=>a.status==="Present"

).length;

const total=

attendance.length;

const percent=

total===0
?0
:Math.round(

present*100/total

);

result.push({

student,

percent

});

});

result.sort(

(a,b)=>

b.percent-a.percent

);

return result.slice(0,10);

};

/* ==========================================================
DASHBOARD WIDGET
========================================================== */

window.renderAttendanceWidget=
function(){

const top=

topAttendanceStudents();

let html=`

<div class="sectionCard">

<h2>

Top Attendance

</h2>

<table class="adminTable">

<thead>

<tr>

<th>

Rank

</th>

<th>

Student

</th>

<th>

Attendance

</th>

<th>

Streak

</th>

</tr>

</thead>

<tbody>

`;

top.forEach(

(item,index)=>{

html+=`

<tr>

<td>

#${index+1}

</td>

<td>

${item.student.studentName}

</td>

<td>

${item.percent}%

</td>

<td>

${studentAttendanceStreak(

item.student.id

)}

 Days

</td>

</tr>

`;

});

html+=`

</tbody>

</table>

</div>

`;

document.getElementById(

"analyticsCharts"

).innerHTML+=html;

};

/* ==========================================================
AUTO LOAD
========================================================== */

setTimeout(()=>{

renderAttendanceWidget();

},2500);
/* ==========================================================
STUDENT PROFILE TIMELINE
PASTE AT END OF admin.js
========================================================== */

window.openStudentTimeline =
async function(studentId){

showLoader();

const student =
state.students.find(
x=>x.id===studentId
);

if(!student){

hideLoader();

return;

}

const attendance =

state.attendance.filter(
a=>a.studentId===studentId
);

const fees =

state.fees.filter(
f=>f.studentId===studentId
);

attendance.sort(
(a,b)=>b.date.localeCompare(a.date)
);

fees.sort(
(a,b)=>{

if(!a.createdAt||!b.createdAt)
return 0;

return(

b.createdAt.seconds-

a.createdAt.seconds

);

});

let html=`

<div class="timelineWrapper">

<h2>

${student.studentName}

</h2>

<div class="timeline">

`;

attendance.forEach(item=>{

html+=`

<div class="timelineItem">

<div class="timelineIcon">

<i class="fa-solid fa-calendar-check"></i>

</div>

<div class="timelineContent">

<h4>

Attendance

</h4>

<p>

${item.status}

</p>

<small>

${item.date}

</small>

</div>

</div>

`;

});

fees.forEach(item=>{

html+=`

<div class="timelineItem">

<div class="timelineIcon">

<i class="fa-solid fa-indian-rupee-sign"></i>

</div>

<div class="timelineContent">

<h4>

Fee Paid

</h4>

<p>

₹${item.amount}

</p>

<small>

${item.month}

</small>

</div>

</div>

`;

});

html+=`

</div>

</div>

`;

document.getElementById(

"analyticsCharts"

).innerHTML=

html;

hideLoader();

};

/* ==========================================================
STUDENT PERFORMANCE
========================================================== */

window.studentPerformance =
function(studentId){

const attendance=

state.attendance.filter(

a=>a.studentId===studentId

);

const fees=

state.fees.filter(

f=>f.studentId===studentId

);

const present=

attendance.filter(

a=>a.status==="Present"

).length;

const absent=

attendance.filter(

a=>a.status==="Absent"

).length;

const leave=

attendance.filter(

a=>a.status==="Leave"

).length;

const total=

attendance.length;

const percent=

total===0

?0

:Math.round(

present*100/total

);

const feePaid=

fees.reduce(

(sum,x)=>

sum+

Number(x.amount||0),

0

);

return{

attendance:percent,

present,

absent,

leave,

feePaid

};

};

/* ==========================================================
DASHBOARD STUDENT CARD
========================================================== */

window.studentOverview =
function(studentId){

const student=

state.students.find(

x=>x.id===studentId

);

if(!student)return;

const report=

studentPerformance(

studentId

);

document.getElementById(

"analyticsCharts"

).innerHTML=`

<div class="reportGrid">

<div class="reportCard">

<h2>

${student.studentName}

</h2>

<p>

Student

</p>

</div>

<div class="reportCard">

<h2>

${report.attendance}%

</h2>

<p>

Attendance

</p>

</div>

<div class="reportCard">

<h2>

₹${report.feePaid}

</h2>

<p>

Fees Paid

</p>

</div>

<div class="reportCard">

<h2>

${student.teacherName}

</h2>

<p>

Teacher

</p>

</div>

</div>

`;

};

/* ==========================================================
AUTO MONTHLY RESET CHECK
========================================================== */

window.monthlyAttendanceCleanup =
async function(){

const month=

new Date()

.toISOString()

.slice(0,7);

const old=

state.attendance.filter(

a=>

!a.date.startsWith(month)

);

console.log(

"Old Records :",

old.length

);

};

/* ==========================================================
INITIALIZE
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{

setTimeout(()=>{

monthlyAttendanceCleanup();

},4000);

});
/* ==========================================================
ATTENDANCE HEATMAP + CONSECUTIVE ABSENCE ALERT
PASTE AT END OF admin.js
========================================================== */

window.renderAttendanceHeatmap =
function(studentId){

const container =
document.getElementById(
"attendanceCalendar"
);

if(!container) return;

container.innerHTML="";

const year =
new Date().getFullYear();

const month =
new Date().getMonth();

const totalDays =
new Date(
year,
month+1,
0
).getDate();

const map={};

attendanceHistory.forEach(record=>{

map[record.date]=record.status;

});

for(let day=1;day<=totalDays;day++){

const date=

`${year}-${
String(month+1)
.padStart(2,"0")
}-${
String(day)
.padStart(2,"0")
}`;

const box=
document.createElement("div");

box.className=
"attendanceDay";

box.innerHTML=day;

if(map[date]==="Present"){

box.classList.add(
"present"
);

}

else if(map[date]==="Absent"){

box.classList.add(
"absent"
);

}

else if(map[date]==="Leave"){

box.classList.add(
"leave"
);

}

box.title=

map[date]||

"No Record";

container.appendChild(box);

}

};

/* ==========================================================
CONSECUTIVE ABSENCE CHECK
========================================================== */

window.consecutiveAbsence =
function(studentId){

const records=

state.attendance

.filter(

a=>a.studentId===studentId

)

.sort(

(a,b)=>

b.date.localeCompare(a.date)

);

let count=0;

for(const item of records){

if(item.status==="Absent"){

count++;

}else{

break;

}

}

return count;

};

/* ==========================================================
LOW ATTENDANCE WARNING
========================================================== */

window.studentAttendanceWarning =
function(studentId){

const absent=

consecutiveAbsence(
studentId
);

if(absent>=3){

showToast(

"⚠ Student absent for "+
absent+
" consecutive days",

"error"

);

}

};

/* ==========================================================
MONTHLY ATTENDANCE GRAPH DATA
========================================================== */

window.getAttendanceGraphData =
function(studentId){

const data=[];

for(let i=1;i<=31;i++){

const date=
new Date()

.toISOString()

.slice(0,7)+

"-"+

String(i)

.padStart(2,"0");

const attendance=

attendanceHistory.find(

a=>a.date===date

);

data.push({

day:i,

status:

attendance

?attendance.status

:"None"

});

}

return data;

};

/* ==========================================================
ATTENDANCE FILTER
========================================================== */

window.filterAttendance =
function(status){

const filtered=

attendanceHistory.filter(

a=>a.status===status

);

renderAttendanceTable(

filtered

);

};

/* ==========================================================
BUTTON EVENTS
========================================================== */

document

.getElementById(

"presentCount"

)

.onclick=()=>{

filterAttendance(

"Present"

);

};

document

.getElementById(

"absentCount"

)

.onclick=()=>{

filterAttendance(

"Absent"

);

};

document

.getElementById(

"leaveCount"

)

.onclick=()=>{

filterAttendance(

"Leave"

);

};

/* ==========================================================
RESTORE TABLE
========================================================== */

document

.getElementById(

"attendancePercent"

)

.onclick=()=>{

renderAttendanceTable(

attendanceHistory

);

};

/* ==========================================================
LOAD EXTRA FEATURES
========================================================== */

const oldHistory=
loadAttendanceHistory;

loadAttendanceHistory=
async function(){

await oldHistory();

renderAttendanceHeatmap(

attendanceHistoryStudent.id

);

studentAttendanceWarning(

attendanceHistoryStudent.id

);

};
/* ==========================================================
ATTENDANCE DASHBOARD WIDGETS
PASTE AT END OF admin.js
========================================================== */

window.renderAttendanceDashboardWidgets =
function(){

const dashboard =
document.getElementById(
"analyticsCharts"
);

if(!dashboard) return;

const totalStudents =
state.students.length;

const totalAttendance =
state.attendance.length;

const present =
state.attendance.filter(
a=>a.status==="Present"
).length;

const absent =
state.attendance.filter(
a=>a.status==="Absent"
).length;

const leave =
state.attendance.filter(
a=>a.status==="Leave"
).length;

const percentage =
totalAttendance===0
?0
:Math.round(
present*100/totalAttendance
);

const today =
new Date()
.toISOString()
.split("T")[0];

const todayAttendance =
state.attendance.filter(
a=>a.date===today
).length;

dashboard.innerHTML=`

<div class="reportGrid">

<div class="reportCard">

<h2>${totalStudents}</h2>

<p>Total Students</p>

</div>

<div class="reportCard">

<h2>${todayAttendance}</h2>

<p>Today's Entries</p>

</div>

<div class="reportCard">

<h2>${present}</h2>

<p>Total Present</p>

</div>

<div class="reportCard">

<h2>${absent}</h2>

<p>Total Absent</p>

</div>

<div class="reportCard">

<h2>${leave}</h2>

<p>Total Leave</p>

</div>

<div class="reportCard">

<h2>${percentage}%</h2>

<p>Overall Attendance</p>

</div>

</div>

`;

};

/* ==========================================================
ATTENDANCE SEARCH
========================================================== */

window.searchAttendanceStudent =
function(keyword){

keyword=keyword.toLowerCase();

const data=

attendanceHistory.filter(

a=>

(a.studentName||"")

.toLowerCase()

.includes(keyword)

||

(a.teacherName||"")

.toLowerCase()

.includes(keyword)

);

renderAttendanceTable(data);

};

/* ==========================================================
LAST 30 DAYS
========================================================== */

window.lastThirtyDaysAttendance =
function(studentId){

const today=new Date();

const filtered=

state.attendance.filter(a=>{

if(a.studentId!==studentId)
return false;

const d=new Date(a.date);

const diff=

(today-d)/(1000*60*60*24);

return diff<=30;

});

renderAttendanceTable(filtered);

};

/* ==========================================================
MARK LEAVE
========================================================== */

window.markLeave =
async function(studentId){

const student=

state.students.find(

x=>x.id===studentId

);

if(!student)return;

await addDoc(

collection(db,"attendance"),

{

studentId:student.id,

studentName:student.studentName,

teacherId:student.teacherId,

teacherName:student.teacherName,

status:"Leave",

date:new Date()

.toISOString()

.split("T")[0],

remark:"Approved Leave",

createdAt:serverTimestamp()

}

);

await loadAttendance();

renderAttendance();

showToast(

"Leave Marked"

);

};

/* ==========================================================
BULK ABSENT
========================================================== */

window.bulkAbsent =
function(){

bulkAttendance(

"Absent"

);

};

/* ==========================================================
BULK PRESENT
========================================================== */

window.bulkPresent =
function(){

bulkAttendance(

"Present"

);

};

/* ==========================================================
BULK LEAVE
========================================================== */

window.bulkLeave =
function(){

bulkAttendance(

"Leave"

);

};

/* ==========================================================
ATTENDANCE REFRESH
========================================================== */

window.refreshAttendanceModule =
async function(){

showLoader();

await loadAttendance();

renderAttendance();

renderAttendanceDashboardWidgets();

hideLoader();

};

/* ==========================================================
INITIAL LOAD
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{

setTimeout(

refreshAttendanceModule,

2000

);

});
/* ==========================================================
MONTHLY ATTENDANCE SUMMARY + FIRESTORE STATS
PASTE AT END OF admin.js
========================================================== */

window.generateAttendanceSummary =
async function(month){

showLoader();

const snapshot = await getDocs(

query(

collection(db,"attendance"),

orderBy("date","asc")

)

);

const summary={};

snapshot.forEach(doc=>{

const data=doc.data();

if(!data.date.startsWith(month))
return;

if(!summary[data.studentId]){

summary[data.studentId]={

name:data.studentName,

teacher:data.teacherName,

present:0,

absent:0,

leave:0,

total:0

};

}

summary[data.studentId].total++;

switch(data.status){

case "Present":

summary[data.studentId].present++;

break;

case "Absent":

summary[data.studentId].absent++;

break;

case "Leave":

summary[data.studentId].leave++;

break;

}

});

let html=`

<table class="adminTable">

<thead>

<tr>

<th>Student</th>

<th>Teacher</th>

<th>Present</th>

<th>Absent</th>

<th>Leave</th>

<th>%</th>

</tr>

</thead>

<tbody>

`;

Object.values(summary).forEach(student=>{

const percent=

student.total===0

?0

:Math.round(

(student.present*100)/

student.total

);

html+=`

<tr>

<td>${student.name}</td>

<td>${student.teacher}</td>

<td>${student.present}</td>

<td>${student.absent}</td>

<td>${student.leave}</td>

<td>${percent}%</td>

</tr>

`;

});

html+=`

</tbody>

</table>

`;

document.getElementById(

"analyticsCharts"

).innerHTML=

html;

hideLoader();

};

/* ==========================================================
TEACHER PERFORMANCE
========================================================== */

window.teacherAttendancePerformance=
function(){

const teacherMap={};

state.attendance.forEach(item=>{

if(!teacherMap[item.teacherId]){

teacherMap[item.teacherId]={

teacher:item.teacherName,

present:0,

absent:0,

leave:0

};

}

switch(item.status){

case "Present":

teacherMap[item.teacherId]

.present++;

break;

case "Absent":

teacherMap[item.teacherId]

.absent++;

break;

case "Leave":

teacherMap[item.teacherId]

.leave++;

break;

}

});

let html=`

<table class="adminTable">

<thead>

<tr>

<th>Teacher</th>

<th>Present</th>

<th>Absent</th>

<th>Leave</th>

</tr>

</thead>

<tbody>

`;

Object.values(teacherMap).forEach(t=>{

html+=`

<tr>

<td>${t.teacher}</td>

<td>${t.present}</td>

<td>${t.absent}</td>

<td>${t.leave}</td>

</tr>

`;

});

html+=`

</tbody>

</table>

`;

document.getElementById(

"analyticsCharts"

).innerHTML=

html;

};

/* ==========================================================
STUDENT ATTENDANCE JSON EXPORT
========================================================== */

window.exportAttendanceJSON=
function(){

const blob=

new Blob(

[JSON.stringify(

attendanceHistory,

null,

2

)],

{

type:"application/json"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download=

"attendance-history.json";

a.click();

};

/* ==========================================================
MONTH SELECT SHORTCUT
========================================================== */

window.currentAttendanceMonth=
function(){

document.getElementById(

"attendanceMonth"

).value=

new Date()

.toISOString()

.slice(0,7);

loadAttendanceHistory();

};

/* ==========================================================
ATTENDANCE LIVE COUNTER
========================================================== */

window.liveAttendanceCounter=
function(){

const total=

attendanceHistory.length;

const present=

attendanceHistory.filter(

x=>x.status==="Present"

).length;

const absent=

attendanceHistory.filter(

x=>x.status==="Absent"

).length;

const leave=

attendanceHistory.filter(

x=>x.status==="Leave"

).length;

console.table({

Total:total,

Present:present,

Absent:absent,

Leave:leave

});

};

/* ==========================================================
AUTO UPDATE EVERY 30 SECONDS
========================================================== */

setInterval(()=>{

if(attendanceHistoryModal

&&

attendanceHistoryModal

.classList.contains("show")){

loadAttendanceHistory();

}

},30000);
/* ==========================================================
ATTENDANCE AUDIT LOG + PARENT NOTIFICATION QUEUE
PASTE AT END OF admin.js
========================================================== */

const attendanceAuditCollection =
collection(db,"attendanceAudit");

async function createAttendanceAudit(action,data){

try{

await addDoc(

attendanceAuditCollection,

{

action,

studentId:data.studentId||"",

studentName:data.studentName||"",

teacherId:data.teacherId||"",

teacherName:data.teacherName||"",

status:data.status||"",

remark:data.remark||"",

attendanceDate:data.date||"",

createdAt:serverTimestamp(),

admin:

state.admin?.name||

"Admin"

}

);

}catch(err){

console.error(err);

}

}

/* ==========================================================
QUEUE PARENT NOTIFICATION
========================================================== */

async function queueAttendanceNotification(data){

try{

await addDoc(

collection(db,"notificationQueue"),

{

type:"attendance",

studentId:data.studentId,

studentName:data.studentName,

parentPhone:data.parentPhone||"",

teacherName:data.teacherName,

status:data.status,

date:data.date,

sent:false,

createdAt:serverTimestamp()

}

);

}catch(err){

console.error(err);

}

}

/* ==========================================================
SAVE ATTENDANCE
========================================================== */

window.saveAttendanceRecord =
async function(record){

await addDoc(

collection(db,"attendance"),

record

);

await createAttendanceAudit(

"CREATE",

record

);

await queueAttendanceNotification(

record

);

};

/* ==========================================================
ATTENDANCE BY DATE
========================================================== */

window.getAttendanceByDate =
function(date){

return state.attendance.filter(

x=>x.date===date

);

};

/* ==========================================================
ATTENDANCE BY TEACHER
========================================================== */

window.getTeacherAttendance =
function(id){

return state.attendance.filter(

x=>x.teacherId===id

);

};

/* ==========================================================
ATTENDANCE BY STUDENT
========================================================== */

window.getStudentAttendance =
function(id){

return state.attendance.filter(

x=>x.studentId===id

);

};

/* ==========================================================
TOTAL WORKING DAYS
========================================================== */

window.getWorkingDays =
function(month){

const attendance=

state.attendance.filter(

a=>a.date.startsWith(month)

);

const dates=

new Set();

attendance.forEach(x=>{

dates.add(x.date);

});

return dates.size;

};

/* ==========================================================
MONTHLY ATTENDANCE %
========================================================== */

window.getAttendancePercentage =
function(studentId,month){

const records=

state.attendance.filter(

a=>

a.studentId===studentId

&&

a.date.startsWith(month)

);

const working=

getWorkingDays(month);

const present=

records.filter(

x=>x.status==="Present"

).length;

if(working===0)return 0;

return Math.round(

present*100/working

);

};

/* ==========================================================
MONTHLY DEFAULTERS
========================================================== */

window.getAttendanceDefaulters =
function(month){

return state.students.filter(student=>{

return getAttendancePercentage(

student.id,

month

)<75;

});

};

/* ==========================================================
ATTENDANCE SUMMARY OBJECT
========================================================== */

window.getAttendanceSummary =
function(studentId){

const records=

getStudentAttendance(

studentId

);

return{

present:

records.filter(

x=>x.status==="Present"

).length,

absent:

records.filter(

x=>x.status==="Absent"

).length,

leave:

records.filter(

x=>x.status==="Leave"

).length,

total:

records.length

};

};

/* ==========================================================
ATTENDANCE GRAPH DATASET
========================================================== */

window.getAttendanceDataset =
function(studentId){

const records=

getStudentAttendance(

studentId

);

return records.map(item=>({

x:item.date,

y:

item.status==="Present"

?1

:item.status==="Leave"

?0.5

:0

}));

};

/* ==========================================================
END ATTENDANCE MODULE
========================================================== */
/* ==========================================================
ATTENDANCE HOLIDAYS + LEAVE APPROVAL SYSTEM
PASTE AT END OF admin.js
========================================================== */

state.holidays = [];
state.leaveRequests = [];

/* ==========================================================
LOAD HOLIDAYS
========================================================== */

async function loadHolidays(){

const snap = await getDocs(

query(

collection(db,"holidays"),

orderBy("date","asc")

)

);

state.holidays=[];

snap.forEach(doc=>{

state.holidays.push({

id:doc.id,

...doc.data()

});

});

}

/* ==========================================================
LOAD LEAVE REQUESTS
========================================================== */

async function loadLeaveRequests(){

const snap=await getDocs(

query(

collection(db,"leaveRequests"),

orderBy("createdAt","desc")

)

);

state.leaveRequests=[];

snap.forEach(doc=>{

state.leaveRequests.push({

id:doc.id,

...doc.data()

});

});

}

/* ==========================================================
IS HOLIDAY
========================================================== */

window.isHoliday=function(date){

return state.holidays.some(

x=>x.date===date

);

};

/* ==========================================================
ADD HOLIDAY
========================================================== */

window.addHoliday=
async function(){

const date=

prompt("Holiday Date (YYYY-MM-DD)");

if(!date)return;

const title=

prompt("Holiday Name");

if(!title)return;

await addDoc(

collection(db,"holidays"),

{

date,

title,

createdAt:serverTimestamp()

}

);

await loadHolidays();

showToast(

"Holiday Added"

);

};

/* ==========================================================
REQUEST LEAVE
========================================================== */

window.requestLeave=
async function(student){

const date=

prompt("Leave Date");

if(!date)return;

const reason=

prompt("Reason");

if(!reason)return;

await addDoc(

collection(db,"leaveRequests"),

{

studentId:student.id,

studentName:student.studentName,

teacherId:student.teacherId,

teacherName:student.teacherName,

parentPhone:student.parentPhone,

date,

reason,

status:"Pending",

createdAt:serverTimestamp()

}

);

showToast(

"Leave Request Sent"

);

};

/* ==========================================================
APPROVE LEAVE
========================================================== */

window.approveLeave=
async function(id){

const leave=

state.leaveRequests.find(

x=>x.id===id

);

if(!leave)return;

await updateDoc(

doc(

db,

"leaveRequests",

id

),

{

status:"Approved",

approvedAt:serverTimestamp()

}

);

await addDoc(

collection(db,"attendance"),

{

studentId:leave.studentId,

studentName:leave.studentName,

teacherId:leave.teacherId,

teacherName:leave.teacherName,

status:"Leave",

date:leave.date,

remark:leave.reason,

createdAt:serverTimestamp()

}

);

await loadAttendance();

await loadLeaveRequests();

showToast(

"Leave Approved"

);

};

/* ==========================================================
REJECT LEAVE
========================================================== */

window.rejectLeave=
async function(id){

await updateDoc(

doc(

db,

"leaveRequests",

id

),

{

status:"Rejected",

updatedAt:serverTimestamp()

}

);

await loadLeaveRequests();

showToast(

"Leave Rejected"

);

};

/* ==========================================================
TODAY HOLIDAY CHECK
========================================================== */

window.todayHolidayCheck=
function(){

const today=

new Date()

.toISOString()

.split("T")[0];

if(isHoliday(today)){

showToast(

"Today is Holiday"

);

return true;

}

return false;

};

/* ==========================================================
AUTO BLOCK ATTENDANCE ON HOLIDAY
========================================================== */

const oldMarkAttendance=

window.markAttendance;

window.markAttendance=

async function(id){

if(todayHolidayCheck())return;

await oldMarkAttendance(id);

};

const oldMarkAbsent=

window.markAbsent;

window.markAbsent=

async function(id){

if(todayHolidayCheck())return;

await oldMarkAbsent(id);

};

/* ==========================================================
HOLIDAY SUMMARY
========================================================== */

window.renderHolidayList=
function(){

let html=`

<table class="adminTable">

<thead>

<tr>

<th>Date</th>

<th>Holiday</th>

</tr>

</thead>

<tbody>

`;

state.holidays.forEach(item=>{

html+=`

<tr>

<td>${item.date}</td>

<td>${item.title}</td>

</tr>

`;

});

html+=`

</tbody>

</table>

`;

document.getElementById(

"analyticsCharts"

).innerHTML=

html;

};

/* ==========================================================
INITIALIZE
========================================================== */

document.addEventListener(

"DOMContentLoaded",

async()=>{

await loadHolidays();

await loadLeaveRequests();

});
/* ==========================================================
ATTENDANCE BACKUP + RESTORE + DUPLICATE CHECK
PASTE AT END OF admin.js
========================================================== */

window.checkAttendanceExists =
function(studentId,date){

return state.attendance.some(

item=>

item.studentId===studentId &&

item.date===date

);

};

/* ==========================================================
SAFE SAVE ATTENDANCE
========================================================== */

window.safeAttendance =
async function(record){

if(

checkAttendanceExists(

record.studentId,

record.date

)

){

showToast(

"Attendance Already Exists",

"error"

);

return;

}

await addDoc(

collection(db,"attendance"),

record

);

state.attendance.push(record);

showToast(

"Attendance Saved"

);

};

/* ==========================================================
BACKUP JSON
========================================================== */

window.backupAttendance =
function(){

const backup={

generatedAt:

new Date().toISOString(),

total:

state.attendance.length,

records:

state.attendance

};

const blob=

new Blob(

[

JSON.stringify(

backup,

null,

2

)

],

{

type:

"application/json"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download=

"attendance-backup.json";

a.click();

};

/* ==========================================================
RESTORE JSON
========================================================== */

window.restoreAttendance =
async function(file){

const reader=

new FileReader();

reader.onload=

async function(e){

const json=

JSON.parse(

e.target.result

);

showLoader();

for(const record of json.records){

const exists=

checkAttendanceExists(

record.studentId,

record.date

);

if(exists)

continue;

await addDoc(

collection(db,"attendance"),

{

studentId:

record.studentId,

studentName:

record.studentName,

teacherId:

record.teacherId,

teacherName:

record.teacherName,

status:

record.status,

remark:

record.remark||"",

date:

record.date,

createdAt:

serverTimestamp()

}

);

}

hideLoader();

await loadAttendance();

renderAttendance();

showToast(

"Backup Restored"

);

};

reader.readAsText(file);

};

/* ==========================================================
DELETE MONTH ATTENDANCE
========================================================== */

window.deleteAttendanceMonth =
async function(month){

if(

!confirm(

"Delete Attendance Of "+month+" ?"

)

)return;

showLoader();

const snap=

await getDocs(

query(

collection(db,"attendance")

)

);

for(const document of snap.docs){

const data=

document.data();

if(

data.date.startsWith(month)

){

await deleteDoc(

doc(

db,

"attendance",

document.id

)

);

}

}

hideLoader();

await loadAttendance();

renderAttendance();

showToast(

"Month Deleted"

);

};

/* ==========================================================
FIND MISSING ATTENDANCE
========================================================== */

window.findMissingAttendance =
function(date){

const missing=[];

state.students.forEach(student=>{

const found=

state.attendance.find(

a=>

a.studentId===student.id

&&

a.date===date

);

if(!found){

missing.push(student);

}

});

return missing;

};

/* ==========================================================
AUTO REMINDER
========================================================== */

window.checkPendingAttendance =
function(){

const today=

new Date()

.toISOString()

.split("T")[0];

const missing=

findMissingAttendance(today);

if(

missing.length>0

){

showToast(

missing.length+

" Students Attendance Pending",

"error"

);

}

};

/* ==========================================================
RUN EVERY 5 MINUTES
========================================================== */

setInterval(

checkPendingAttendance,

300000

);
/* ==========================================================
ATTENDANCE INSIGHTS ENGINE
PASTE AT END OF admin.js
========================================================== */

window.attendanceInsights =
function(studentId){

const student=

state.students.find(

s=>s.id===studentId

);

if(!student)return;

const records=

state.attendance.filter(

a=>a.studentId===studentId

);

const monthly={};

records.forEach(record=>{

const month=

record.date.substring(0,7);

if(!monthly[month]){

monthly[month]={

present:0,

absent:0,

leave:0

};

}

switch(record.status){

case"Present":

monthly[month].present++;

break;

case"Absent":

monthly[month].absent++;

break;

case"Leave":

monthly[month].leave++;

break;

}

});

let html=`

<div class="sectionCard">

<h2>

Attendance Insights

</h2>

<table class="adminTable">

<thead>

<tr>

<th>Month</th>

<th>Present</th>

<th>Absent</th>

<th>Leave</th>

<th>%</th>

</tr>

</thead>

<tbody>

`;

Object.keys(monthly).sort().reverse().forEach(month=>{

const item=monthly[month];

const total=

item.present+

item.absent+

item.leave;

const per=

total===0

?0

:Math.round(

item.present*100/total

);

html+=`

<tr>

<td>${month}</td>

<td>${item.present}</td>

<td>${item.absent}</td>

<td>${item.leave}</td>

<td>${per}%</td>

</tr>

`;

});

html+=`

</tbody>

</table>

</div>

`;

document.getElementById(

"analyticsCharts"

).innerHTML=

html;

};

/* ==========================================================
PERFECT ATTENDANCE STUDENTS
========================================================== */

window.perfectAttendance =
function(month){

const perfect=[];

state.students.forEach(student=>{

const records=

state.attendance.filter(

a=>

a.studentId===student.id &&

a.date.startsWith(month)

);

if(records.length===0)return;

const absent=

records.some(

x=>x.status==="Absent"

);

if(!absent){

perfect.push(student);

}

});

return perfect;

};

/* ==========================================================
ATTENDANCE LEADERBOARD
========================================================== */

window.renderAttendanceLeaderboard =
function(month){

const board=[];

state.students.forEach(student=>{

board.push({

student,

percentage:

getAttendancePercentage(

student.id,

month

)

});

});

board.sort(

(a,b)=>

b.percentage-a.percentage

);

let html=`

<table class="adminTable">

<thead>

<tr>

<th>Rank</th>

<th>Student</th>

<th>Attendance</th>

</tr>

</thead>

<tbody>

`;

board.forEach((item,index)=>{

html+=`

<tr>

<td>#${index+1}</td>

<td>${item.student.studentName}</td>

<td>${item.percentage}%</td>

</tr>

`;

});

html+=`

</tbody>

</table>

`;

document.getElementById(

"analyticsCharts"

).innerHTML=

html;

};

/* ==========================================================
MONTHLY AUTO REPORT
========================================================== */

window.autoAttendanceReport =
function(){

const month=

new Date()

.toISOString()

.slice(0,7);

generateAttendanceSummary(

month

);

};

/* ==========================================================
ATTENDANCE HEALTH SCORE
========================================================== */

window.getAttendanceHealth =
function(studentId){

const per=

getAttendancePercentage(

studentId,

new Date()

.toISOString()

.slice(0,7)

);

if(per>=95)

return{

label:"Excellent",

color:"#22c55e"

};

if(per>=85)

return{

label:"Good",

color:"#3b82f6"

};

if(per>=75)

return{

label:"Average",

color:"#f59e0b"

};

return{

label:"Poor",

color:"#ef4444"

};

};

/* ==========================================================
END
========================================================== */
/* ==========================================================
ATTENDANCE REMINDER & MONTH CLOSE SYSTEM
PASTE AT END OF admin.js
========================================================== */

window.sendAttendanceReminder =
async function(studentId){

const student=

state.students.find(

s=>s.id===studentId

);

if(!student)return;

await addDoc(

collection(db,"notificationQueue"),

{

type:"attendanceReminder",

studentId:student.id,

studentName:student.studentName,

parentPhone:student.parentPhone||"",

teacherName:student.teacherName,

message:

`Attendance of ${student.studentName} is below required percentage.`,

status:"Pending",

createdAt:serverTimestamp()

}

);

showToast(

"Reminder Queued"

);

};

/* ==========================================================
AUTO REMINDER BELOW 75%
========================================================== */

window.checkAttendanceReminder =
function(){

const month=

new Date()

.toISOString()

.slice(0,7);

state.students.forEach(student=>{

const percentage=

getAttendancePercentage(

student.id,

month

);

if(

percentage<75

){

sendAttendanceReminder(

student.id

);

}

});

};

/* ==========================================================
MONTH CLOSE
========================================================== */

window.closeAttendanceMonth =
async function(month){

if(

!confirm(

"Close Attendance for "+month+" ?"

)

)return;

await addDoc(

collection(db,"attendanceMonthClose"),

{

month,

closedBy:

state.admin?.name||

"Admin",

closedAt:

serverTimestamp()

}

);

showToast(

"Attendance Closed"

);

};

/* ==========================================================
CHECK CLOSED
========================================================== */

window.isAttendanceClosed =
async function(month){

const snap=

await getDocs(

query(

collection(db,"attendanceMonthClose"),

where(

"month",

"==",

month

)

)

);

return !snap.empty;

};

/* ==========================================================
SAFE MARK ATTENDANCE
========================================================== */

const originalSafeAttendance =
window.safeAttendance;

window.safeAttendance =
async function(record){

const month=

record.date.substring(0,7);

const closed=

await isAttendanceClosed(

month

);

if(closed){

showToast(

"Attendance Month Closed",

"error"

);

return;

}

await originalSafeAttendance(

record

);

};

/* ==========================================================
MONTHLY REPORT DOWNLOAD
========================================================== */

window.downloadAttendanceCSV =
function(month){

const rows=

state.attendance.filter(

a=>

a.date.startsWith(month)

);

let csv=

"Student,Teacher,Date,Status\n";

rows.forEach(r=>{

csv+=

`${r.studentName},${r.teacherName},${r.date},${r.status}\n`;

});

const blob=

new Blob(

[csv],

{

type:"text/csv"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download=

`${month}-attendance.csv`;

a.click();

};

/* ==========================================================
AUTO DAILY REMINDER
========================================================== */

setInterval(

checkAttendanceReminder,

86400000

);
/* ==========================================================
ATTENDANCE STATISTICS CACHE + FAST SEARCH
PASTE AT END OF admin.js
========================================================== */

state.attendanceCache = new Map();

/* ==========================================================
BUILD CACHE
========================================================== */

window.buildAttendanceCache = function(){

state.attendanceCache.clear();

state.attendance.forEach(record=>{

if(!state.attendanceCache.has(record.studentId)){

state.attendanceCache.set(

record.studentId,

[]

);

}

state.attendanceCache

.get(record.studentId)

.push(record);

});

};

/* ==========================================================
GET CACHE
========================================================== */

window.cachedAttendance=function(studentId){

return state.attendanceCache.get(studentId)||[];

};

/* ==========================================================
FAST PERCENTAGE
========================================================== */

window.cachedAttendancePercentage=

function(studentId){

const records=

cachedAttendance(studentId);

if(records.length===0)return 0;

const present=

records.filter(

x=>x.status==="Present"

).length;

return Math.round(

present*100/

records.length

);

};

/* ==========================================================
SEARCH STUDENT ATTENDANCE
========================================================== */

window.searchAttendance=function(){

const keyword=

prompt("Student Name");

if(!keyword)return;

const records=

state.attendance.filter(

a=>

(a.studentName||"")

.toLowerCase()

.includes(

keyword.toLowerCase()

)

);

renderAttendanceTable(records);

};

/* ==========================================================
TODAY ABSENT LIST
========================================================== */

window.todayAbsentStudents=

function(){

const today=

new Date()

.toISOString()

.split("T")[0];

return state.attendance.filter(

a=>

a.date===today &&

a.status==="Absent"

);

};

/* ==========================================================
TODAY PRESENT LIST
========================================================== */

window.todayPresentStudents=

function(){

const today=

new Date()

.toISOString()

.split("T")[0];

return state.attendance.filter(

a=>

a.date===today &&

a.status==="Present"

);

};

/* ==========================================================
TODAY LEAVE LIST
========================================================== */

window.todayLeaveStudents=

function(){

const today=

new Date()

.toISOString()

.split("T")[0];

return state.attendance.filter(

a=>

a.date===today &&

a.status==="Leave"

);

};

/* ==========================================================
DOWNLOAD ABSENT LIST
========================================================== */

window.exportAbsentList=

function(){

const rows=

todayAbsentStudents();

let csv=

"Student,Teacher,Date\n";

rows.forEach(x=>{

csv+=

`${x.studentName},${x.teacherName},${x.date}\n`;

});

const blob=

new Blob(

[csv],

{

type:"text/csv"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download="AbsentList.csv";

a.click();

};

/* ==========================================================
ATTENDANCE REFRESH CACHE
========================================================== */

const oldAttendanceLoad=

loadAttendance;

loadAttendance=

async function(){

await oldAttendanceLoad();

buildAttendanceCache();

};

/* ==========================================================
ATTENDANCE SCORE
========================================================== */

window.studentAttendanceScore=

function(studentId){

const p=

cachedAttendancePercentage(

studentId

);

if(p>=95)return 5;

if(p>=90)return 4;

if(p>=80)return 3;

if(p>=70)return 2;

return 1;

};

/* ==========================================================
END CACHE MODULE
========================================================== */
/* ==========================================================
ATTENDANCE TIMETABLE INTEGRATION
PASTE AT END OF admin.js
========================================================== */

state.timetable = [];

/* ==========================================================
LOAD TIMETABLE
========================================================== */

async function loadTimetable(){

const snap = await getDocs(

query(

collection(db,"timetable"),

orderBy("day")

)

);

state.timetable=[];

snap.forEach(doc=>{

state.timetable.push({

id:doc.id,

...doc.data()

});

});

}

/* ==========================================================
TODAY CLASSES
========================================================== */

window.todayClasses =
function(){

const days=[

"Sunday",

"Monday",

"Tuesday",

"Wednesday",

"Thursday",

"Friday",

"Saturday"

];

const today=

days[

new Date().getDay()

];

return state.timetable.filter(

x=>x.day===today

);

};

/* ==========================================================
ATTENDANCE DUE LIST
========================================================== */

window.pendingAttendanceClasses=
function(){

const today=

new Date()

.toISOString()

.split("T")[0];

const pending=[];

todayClasses().forEach(cls=>{

const found=

state.attendance.find(

a=>

a.studentId===cls.studentId

&&

a.date===today

);

if(!found){

pending.push(cls);

}

});

return pending;

};

/* ==========================================================
SHOW PENDING CLASSES
========================================================== */

window.renderPendingAttendance=
function(){

const pending=

pendingAttendanceClasses();

let html=`

<table class="adminTable">

<thead>

<tr>

<th>

Student

</th>

<th>

Teacher

</th>

<th>

Time

</th>

<th>

Action

</th>

</tr>

</thead>

<tbody>

`;

pending.forEach(item=>{

html+=`

<tr>

<td>

${item.studentName}

</td>

<td>

${item.teacherName}

</td>

<td>

${item.time}

</td>

<td>

<button

class="tableBtn green"

onclick="markAttendance('${item.studentId}')">

Present

</button>

<button

class="tableBtn red"

onclick="markAbsent('${item.studentId}')">

Absent

</button>

<button

class="tableBtn orange"

onclick="markLeave('${item.studentId}')">

Leave

</button>

</td>

</tr>

`;

});

html+=`

</tbody>

</table>

`;

document.getElementById(

"analyticsCharts"

).innerHTML=

html;

};

/* ==========================================================
AUTO CHECK EVERY 10 MINUTES
========================================================== */

setInterval(()=>{

const pending=

pendingAttendanceClasses();

if(pending.length>0){

showToast(

pending.length+

" Classes Pending Attendance"

);

}

},600000);

/* ==========================================================
LOAD MODULE
========================================================== */

document.addEventListener(

"DOMContentLoaded",

async()=>{

await loadTimetable();

});