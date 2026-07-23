// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

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

const firebaseConfig = {
  apiKey: "AIzaSyByABmg8ZerDlHHg92NEi7Cm_0fuE2BhKA",
  authDomain: "tutornest-bb4b5.firebaseapp.com",
  projectId: "tutornest-bb4b5",
  storageBucket: "tutornest-bb4b5.firebasestorage.app",
  messagingSenderId: "1021866563110",
  appId: "1:1021866563110:web:3524e3f2bba0093cd138e7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();