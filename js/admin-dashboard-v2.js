import { auth, db } from "../firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ========================
// DOM ELEMENTS
// ========================

const logoutBtn = document.getElementById("logoutBtn");
const bookingTable = document.getElementById("bookingTable");
const teacherTable = document.getElementById("teacherTable");
const sidebarMenu = document.getElementById("sidebarMenu");

const totalEnquiriesEl = document.getElementById("totalEnquiries");
const pendingCountEl = document.getElementById("pendingCount");
const assignedCountEl = document.getElementById("assignedCount");
const admissionCountEl = document.getElementById("admissionCount");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const addEnquiryBtn = document.getElementById("addEnquiryBtn");
const enquiryModal = document.getElementById("enquiryModal");
const saveEnquiryBtn = document.getElementById("saveEnquiry");
const closeEnquiryBtn = document.getElementById("closeEnquiry");

const addTeacherBtn = document.getElementById("addTeacherBtn");
const teacherModal = document.getElementById("teacherModal");
const saveTeacherBtn = document.getElementById("saveTeacher");

const assignModal = document.getElementById("assignModal");
const saveAssignBtn = document.getElementById("saveAssign");
const closeAssignBtn = document.getElementById("closeAssign");
const teacherSelect = document.getElementById("teacherSelect");

const studentModal = document.getElementById("studentModal");
const closeStudentModalBtn = document.getElementById("closeStudentModal");

const demoModal = document.getElementById("demoModal");
const closeDemoModalBtn = document.getElementById("closeDemoModal");

// ========================
// STATE
// ========================

let currentBookingId = null;
let allBookings = [];
let allTeachers = [];

// ========================
// AUTH CHECK
// ========================

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }
    loadAllData();
});

// ========================
// LOAD DATA
// ========================

async function loadAllData() {
    await loadBookings();
    await loadTeachers();
    loadStats();
}

// ========================
// BOOKINGS
// ========================

async function loadBookings() {
    try {
        const q = query(
            collection(db, "bookings"),
            orderBy("createdAt", "desc")
        );

        onSnapshot(q, (snapshot) => {
            allBookings = [];
            snapshot.forEach((doc) => {
                allBookings.push({ id: doc.id, ...doc.data() });
            });
            renderBookingTable();
            loadStats();
        });
    } catch (error) {
        console.error("Error loading bookings:", error);
    }
}

function renderBookingTable() {
    if (!bookingTable) return;

    const searchTerm = (searchInput?.value || "").toLowerCase();
    const statusTerm = statusFilter?.value || "";

    let filtered = allBookings.filter(booking => {
        const matchSearch = !searchTerm ||
            (booking.studentName && booking.studentName.toLowerCase().includes(searchTerm)) ||
            (booking.phone && booking.phone.includes(searchTerm));

        const matchStatus = !statusTerm || booking.status === statusTerm;

        return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
        bookingTable.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;padding:20px;">
                    No bookings found
                </td>
            </tr>
        `;
        return;
    }

    bookingTable.innerHTML = filtered.map(booking => `
        <tr>
            <td>${booking.studentName || "-"}</td>
            <td>${booking.phone || "-"}</td>
            <td>${booking.studentClass || "-"}</td>
            <td>${booking.subject || "-"}</td>
            <td>${booking.area || "-"}</td>
            <td>${booking.preferredTutor || "-"}</td>
            <td>${booking.assignedTutor || "-"}</td>
            <td>
                <span class="badge ${booking.status ? booking.status.toLowerCase() : "pending"}">
                    ${booking.status || "Pending"}
                </span>
            </td>
            <td>
                <button class="call" onclick="viewBookingDetails('${booking.id}')">
                    View
                </button>
                <button class="assign" onclick="openAssignModal('${booking.id}')">
                    Assign
                </button>
            </td>
        </tr>
    `).join("");
}

window.viewBookingDetails = async function(bookingId) {
    try {
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
            alert("Booking not found");
            return;
        }

        const booking = bookingSnap.data();
        const studentDetailsEl = document.getElementById("studentDetails");

        studentDetailsEl.innerHTML = `
            <div style="margin-bottom:15px;">
                <h4>Student Information</h4>
                <p><strong>Name:</strong> ${booking.studentName || "-"}</p>
                <p><strong>Phone:</strong> ${booking.phone || "-"}</p>
                <p><strong>Class:</strong> ${booking.studentClass || "-"}</p>
                <p><strong>Subject:</strong> ${booking.subject || "-"}</p>
            </div>
            <div style="margin-bottom:15px;">
                <h4>Parent Information</h4>
                <p><strong>Name:</strong> ${booking.parentName || "-"}</p>
                <p><strong>Phone:</strong> ${booking.parentPhone || "-"}</p>
            </div>
            <div style="margin-bottom:15px;">
                <h4>Booking Details</h4>
                <p><strong>Area:</strong> ${booking.area || "-"}</p>
                <p><strong>Mode:</strong> ${booking.mode || "-"}</p>
                <p><strong>Status:</strong> ${booking.status || "-"}</p>
                <p><strong>Preferred Tutor:</strong> ${booking.preferredTutor || "-"}</p>
                <p><strong>Assigned Tutor:</strong> ${booking.assignedTutor || "-"}</p>
            </div>
            <div>
                <h4>Remarks</h4>
                <p>${booking.remarks || "No remarks"}</p>
            </div>
        `;

        studentModal.classList.add("show");
    } catch (error) {
        console.error("Error loading booking details:", error);
        alert("Error loading details");
    }
};

window.openAssignModal = async function(bookingId) {
    currentBookingId = bookingId;
    
    // Load teachers in dropdown
    teacherSelect.innerHTML = '<option value="">Select Teacher</option>';
    allTeachers.forEach(teacher => {
        const option = document.createElement("option");
        option.value = teacher.id;
        option.text = teacher.name;
        teacherSelect.appendChild(option);
    });

    assignModal.classList.add("show");
};

// ========================
// ADD/EDIT ENQUIRY
// ========================

addEnquiryBtn?.addEventListener("click", () => {
    document.getElementById("studentName").value = "";
    document.getElementById("studentPhone").value = "";
    document.getElementById("parentName").value = "";
    document.getElementById("parentPhone").value = "";
    document.getElementById("studentClass").value = "";
    document.getElementById("studentSubject").value = "";
    document.getElementById("studentArea").value = "";
    document.getElementById("studentMode").value = "Home Tuition";
    document.getElementById("studentRemarks").value = "";
    enquiryModal.classList.add("show");
});

closeEnquiryBtn?.addEventListener("click", () => {
    enquiryModal.classList.remove("show");
});

saveEnquiryBtn?.addEventListener("click", async () => {
    const studentName = document.getElementById("studentName").value.trim();
    const studentPhone = document.getElementById("studentPhone").value.trim();
    const parentName = document.getElementById("parentName").value.trim();
    const parentPhone = document.getElementById("parentPhone").value.trim();
    const studentClass = document.getElementById("studentClass").value.trim();
    const studentSubject = document.getElementById("studentSubject").value.trim();
    const studentArea = document.getElementById("studentArea").value.trim();
    const mode = document.getElementById("studentMode").value;
    const remarks = document.getElementById("studentRemarks").value.trim();

    if (!studentName || !studentPhone || !parentName || !parentPhone) {
        alert("Please fill all required fields");
        return;
    }

    try {
        saveEnquiryBtn.disabled = true;
        saveEnquiryBtn.textContent = "Saving...";

        const bookingRef = doc(collection(db, "bookings"));
        await setDoc(bookingRef, {
            studentName,
            phone: studentPhone,
            parentName,
            parentPhone,
            studentClass,
            subject: studentSubject,
            area: studentArea,
            mode,
            remarks,
            status: "Pending",
            createdAt: serverTimestamp(),
            assignedTutor: null,
            preferredTutor: null
        });

        alert("Enquiry saved successfully");
        enquiryModal.classList.remove("show");
        loadBookings();
    } catch (error) {
        console.error("Error saving enquiry:", error);
        alert("Error saving enquiry: " + error.message);
    } finally {
        saveEnquiryBtn.disabled = false;
        saveEnquiryBtn.textContent = "Save Enquiry";
    }
});

// ========================
// ASSIGN TEACHER
// ========================

saveAssignBtn?.addEventListener("click", async () => {
    if (!currentBookingId) {
        alert("No booking selected");
        return;
    }

    const selectedTeacherId = teacherSelect.value;
    const demoDate = document.getElementById("demoDate").value;
    const demoTime = document.getElementById("demoTime").value;
    const remarks = document.getElementById("remarks").value.trim();

    if (!selectedTeacherId || !demoDate || !demoTime) {
        alert("Please fill all fields");
        return;
    }

    try {
        saveAssignBtn.disabled = true;
        saveAssignBtn.textContent = "Assigning...";

        const bookingRef = doc(db, "bookings", currentBookingId);
        const selectedTeacher = allTeachers.find(t => t.id === selectedTeacherId);

        await updateDoc(bookingRef, {
            assignedTutor: selectedTeacher.name,
            assignedTutorId: selectedTeacherId,
            status: "Assigned",
            demoDate,
            demoTime,
            demoRemarks: remarks,
            updatedAt: serverTimestamp()
        });

        alert("Teacher assigned successfully");
        assignModal.classList.remove("show");
        loadBookings();
    } catch (error) {
        console.error("Error assigning teacher:", error);
        alert("Error: " + error.message);
    } finally {
        saveAssignBtn.disabled = false;
        saveAssignBtn.textContent = "Assign Teacher";
    }
});

closeAssignBtn?.addEventListener("click", () => {
    assignModal.classList.remove("show");
});

// ========================
// TEACHERS
// ========================

async function loadTeachers() {
    try {
        const q = query(
            collection(db, "tutors"),
            where("status", "==", "Approved"),
            limit(100)
        );

        const snapshot = await getDocs(q);
        allTeachers = [];

        snapshot.forEach(doc => {
            allTeachers.push({ id: doc.id, ...doc.data() });
        });

        renderTeacherTable();
    } catch (error) {
        console.error("Error loading teachers:", error);
    }
}

function renderTeacherTable() {
    if (!teacherTable) return;

    if (allTeachers.length === 0) {
        teacherTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:20px;">
                    No teachers found
                </td>
            </tr>
        `;
        return;
    }

    teacherTable.innerHTML = allTeachers.map(teacher => `
        <tr>
            <td>${teacher.name || "-"}</td>
            <td>${teacher.phone || "-"}</td>
            <td>${Array.isArray(teacher.teaching) ? teacher.teaching.map(t => t.subject).join(", ") : "-"}</td>
            <td>${teacher.area || "-"}</td>
            <td>
                <span class="badge ${teacher.status.toLowerCase()}">
                    ${teacher.status}
                </span>
            </td>
            <td>
                <button class="call" onclick="viewTeacherProfile('${teacher.id}')">
                    View
                </button>
            </td>
        </tr>
    `).join("");
}

window.viewTeacherProfile = async function(teacherId) {
    try {
        const teacherRef = doc(db, "tutors", teacherId);
        const teacherSnap = await getDoc(teacherRef);

        if (!teacherSnap.exists()) {
            alert("Teacher not found");
            return;
        }

        const teacher = teacherSnap.data();
        const subjects = Array.isArray(teacher.teaching) 
            ? teacher.teaching.map(t => `${t.subject} - ₹${t.monthlyFee}`).join(", ")
            : "-";

        alert(`
Teacher: ${teacher.name}
Email: ${teacher.email || "-"}
Phone: ${teacher.phone || "-"}
Qualification: ${teacher.qualification || "-"}
Experience: ${teacher.experience || "-"} years
Area: ${teacher.area || "-"}
Subjects: ${subjects}
Status: ${teacher.status}
        `);
    } catch (error) {
        console.error("Error loading teacher profile:", error);
    }
};

// ========================
// ADD TEACHER
// ========================

addTeacherBtn?.addEventListener("click", () => {
    teacherModal.classList.add("show");
});

document.getElementById("closeTeacherModal")?.addEventListener("click", () => {
    teacherModal.classList.remove("show");
});

// ========================
// SIDEBAR NAVIGATION
// ========================

sidebarMenu?.addEventListener("click", (e) => {
    const page = e.target.closest("li")?.dataset.page;
    if (!page) return;

    document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
    e.target.closest("li").classList.add("active");

    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });

    const sectionIndex = Array.from(sidebarMenu.querySelectorAll("li")).indexOf(e.target.closest("li"));
    const sections = document.querySelectorAll(".section");
    if (sections[sectionIndex]) {
        sections[sectionIndex].style.display = "block";
    }
});

// ========================
// STATS
// ========================

async function loadStats() {
    const total = allBookings.length;
    const pending = allBookings.filter(b => b.status === "Pending").length;
    const assigned = allBookings.filter(b => b.status === "Assigned").length;
    const admissions = allBookings.filter(b => b.status === "Permanent").length;

    totalEnquiriesEl.textContent = total;
    pendingCountEl.textContent = pending;
    assignedCountEl.textContent = assigned;
    admissionCountEl.textContent = admissions;
}

// ========================
// SEARCH & FILTER
// ========================

searchInput?.addEventListener("input", renderBookingTable);
statusFilter?.addEventListener("change", renderBookingTable);

// ========================
// LOGOUT
// ========================

logoutBtn?.addEventListener("click", async () => {
    if (confirm("Are you sure you want to logout?")) {
        try {
            await signOut(auth);
            window.location.href = "admin-login.html";
        } catch (error) {
            alert("Error logging out: " + error.message);
        }
    }
});

// ========================
// MODAL CLOSE
// ========================

closeStudentModalBtn?.addEventListener("click", () => {
    studentModal.classList.remove("show");
});

closeDemoModalBtn?.addEventListener("click", () => {
    demoModal.classList.remove("show");
});

// Close modals on background click
[enquiryModal, teacherModal, assignModal, studentModal, demoModal].forEach(modal => {
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("show");
        }
    });
});
