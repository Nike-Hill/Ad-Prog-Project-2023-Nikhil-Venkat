// Imports
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBSrGzdPBlgLRRCmAVm2jEsPJVKdHTcc_0",
    authDomain: "milestone-6ef44.firebaseapp.com",
    projectId: "milestone-6ef44",
    storageBucket: "milestone-6ef44.appspot.com",
    messagingSenderId: "1026082867274",
    appId: "1:1026082867274:web:5f0a56a1513101ffde7eb3",
    measurementId: "G-G5VC3PSFF9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage();

export { auth, firestore, storage, ref };
