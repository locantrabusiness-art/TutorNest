// ==============================
// Firebase SDK Imports
// ==============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    arrayUnion
} from "firebase/firestore";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// ==============================
// Firebase Config
// ==============================

const firebaseConfig = {

    apiKey: "AIzaSyByABmg8ZerDlHHg92NEi7Cm_0fuE2BhKA",

    authDomain: "tutornest-bb4b5.firebaseapp.com",

    projectId: "tutornest-bb4b5",

    storageBucket: "tutornest-bb4b5.firebasestorage.app",

    messagingSenderId: "1021866563110",

    appId: "1:1021866563110:web:3524e3f2bba0093cd138e7"

};

// ==============================
// Initialize Firebase
// ==============================

const app = initializeApp(firebaseConfig);

// ==============================
// Firebase Services
// ==============================

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

// ==============================
// Exports
// ==============================

export {

    auth,

    db,

    storage,

    googleProvider,

};