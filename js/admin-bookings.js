import { db } from "../firebase.js";

import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const table = document.getElementById("bookingTable");

async function loadBookings() {
    if (!table) return;

    table.innerHTML = "<tr><td colspan='7' style='text-align:center;padding:20px;'>Loading...</td></tr>";

    try {
        const q = query(
            collection(db, "bookings"),
            where("status", "!=", null),
            orderBy("status"),
            orderBy("createdAt", "desc")
        );

        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                table.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center;padding:20px;">
                            No Demo Requests
                        </td>
                    </tr>
                `;
                return;
            }

            table.innerHTML = snapshot.docs.map(doc => {
                const booking = doc.data();
                return `
                    <tr>
                        <td>${booking.studentName || "-"}</td>
                        <td>${booking.phone || "-"}</td>
                        <td>${booking.studentClass || "-"}</td>
                        <td>${booking.subject || "-"}</td>
                        <td>${booking.area || "-"}</td>
                        <td>
                            <span class="badge ${(booking.status || "Pending").toLowerCase()}">
                                ${booking.status || "Pending"}
                            </span>
                        </td>
                        <td>
                            <button onclick="window.location='admin-dashboard-v2.html?bookingId=${doc.id}'"
                                    style="padding:8px 12px;background:#0d6efd;color:white;border:none;border-radius:6px;cursor:pointer;">
                                Manage
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");
        });
    } catch (error) {
        console.error("Error loading bookings:", error);
        table.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:20px;color:red;">
                    Error loading bookings
                </td>
            </tr>
        `;
    }
}

loadBookings();
