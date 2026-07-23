import { auth, db, storage } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const form = document.getElementById("profileForm");

let currentUser = null;

// Image Preview
document.getElementById("photo").addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    document.getElementById("preview").src = URL.createObjectURL(file);

});

// Upload Profile Photo
async function uploadProfilePhoto(uid) {

    const file = document.getElementById("photo").files[0];

    if (!file) return null;

    const storageRef = ref(storage, "profilePhotos/" + uid);

    await uploadBytes(storageRef, file);

    return await getDownloadURL(storageRef);

}

// Check Login
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "tutor-login.html";
        return;
    }

    currentUser = user;

    const tutorRef = doc(db, "tutors", user.uid);

    const snap = await getDoc(tutorRef);

    if (snap.exists()) {

        const data = snap.data();

        document.getElementById("name").value = data.name || "";
        document.getElementById("phone").value = data.phone || "";
        document.getElementById("qualification").value = data.qualification || "";
        document.getElementById("experience").value = data.experience || "";
        document.getElementById("subjects").value = (data.subjects || []).join(", ");
        document.getElementById("classes").value = (data.classes || []).join(", ");
        document.getElementById("board").value = (data.board || []).join(", ");
        document.getElementById("mode").value = (data.mode || []).join(", ");
        document.getElementById("area").value = data.area || "";
        document.getElementById("fees").value = data.fees || "";
        document.getElementById("about").value = data.about || "";

        if (data.photo) {
            document.getElementById("preview").src = data.photo;
        }

    }

});

// Save Profile
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const photoUrl = await uploadProfilePhoto(currentUser.uid);

    const updateData = {

        name: document.getElementById("name").value,

        phone: document.getElementById("phone").value,

        qualification: document.getElementById("qualification").value,

        experience: document.getElementById("experience").value,

        subjects: document.getElementById("subjects").value
            .split(",")
            .map(s => s.trim())
            .filter(Boolean),

        classes: document.getElementById("classes").value
            .split(",")
            .map(s => s.trim())
            .filter(Boolean),

        board: document.getElementById("board").value
            .split(",")
            .map(s => s.trim())
            .filter(Boolean),

        mode: document.getElementById("mode").value
            .split(",")
            .map(s => s.trim())
            .filter(Boolean),

        area: document.getElementById("area").value,

        fees: Number(document.getElementById("fees").value),

        about: document.getElementById("about").value

    };

    if (photoUrl) {
        updateData.photo = photoUrl;
    }

    await updateDoc(doc(db, "tutors", currentUser.uid), updateData);

    alert("Profile Updated Successfully!");

});