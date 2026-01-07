import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAB0Z0xNQ5cGhCYxZ-r-IPHPU7gQ7p-QMg",
    authDomain: "architecte-seo.firebaseapp.com",
    projectId: "architecte-seo",
    storageBucket: "architecte-seo.firebasestorage.app",
    messagingSenderId: "359132203830",
    appId: "1:359132203830:web:231df9a2d4c7553bf04197"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
