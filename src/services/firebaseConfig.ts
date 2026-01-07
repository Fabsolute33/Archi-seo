import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAB0Z0xNQ5cGhCYxZ-r-IPHPU7gQ7p-QMg",
    authDomain: "architecte-seo.firebaseapp.com",
    projectId: "architecte-seo",
    storageBucket: "architecte-seo.firebasestorage.app",
    messagingSenderId: "359132203830",
    appId: "1:359132203830:web:231df9a2d4c7553bf04197"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
