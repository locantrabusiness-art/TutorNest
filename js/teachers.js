import { db } from "../firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const uid = params.get("id");

if (!uid) {

    document.body.innerHTML =
        "<h2 style='text-align:center;margin-top:80px;'>Tutor Not Found</h2>";

    throw new Error("No Tutor ID");

}


async function loadTutor() {

    try {

        const snap = await getDoc(doc(db, "tutors", uid));

        if (!snap.exists()) {

            document.body.innerHTML =
                "<h2 style='text-align:center;margin-top:80px;'>Tutor Not Found</h2>";

            return;

        }

        const tutor = snap.data();

        document.getElementById("photo").src =
            tutor.photo || "assets/logo/logo.png";

        document.getElementById("name").textContent =
            tutor.name || "-";

        document.getElementById("qualification").textContent =
            tutor.qualification || "-";

        document.getElementById("subjects").textContent =
            (tutor.subjects || []).join(", ");

        document.getElementById("classes").textContent =
            (tutor.classes || []).join(", ");

        document.getElementById("experience").textContent =
            (tutor.experience || 0) + " Years";

        document.getElementById("fees").textContent =
            "₹" + (tutor.fees || "-") + "/hr";

        document.getElementById("area").textContent =
            tutor.area || "-";

        document.getElementById("mode").textContent =
            (tutor.mode || []).join(", ");

        document.getElementById("about").textContent =
            tutor.about || "No description available.";

        document.getElementById("callBtn").href =
            "tel:" + tutor.phone;

        document.getElementById("whatsappBtn").href =
            "https://wa.me/91" +
            tutor.phone +
            "?text=Hi " +
            encodeURIComponent(tutor.name) +
            ", I found your profile on TutorNest. I want to book a free demo.";

    }

    catch (err) {

        console.error(err);

        document.body.innerHTML =
            "<h2 style='text-align:center;margin-top:80px;'>Something went wrong.</h2>";

    }

}

loadTutor();