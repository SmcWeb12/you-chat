//src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // Use Realtime DB for presence and message sync
import { getStorage } from "firebase/storage"; // For file storage (e.g., images)

// Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyBdekrIdLYbrQzTxQa3Ti_4ZB-BDcbn7Ag",
  authDomain: "chat-app1-7206a.firebaseapp.com",
  databaseURL: "https://chat-app1-7206a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-app1-7206a",
  storageBucket: "chat-app1-7206a.appspot.com",
  messagingSenderId: "1098228877013",
  appId: "1:1098228877013:web:89e0cad5d00945a007445c",
  measurementId: "G-KN80PZ4DN5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app); // Firebase Realtime Database for real-time features
const storage = getStorage(app); // Firebase Storage initialized

export { auth, db, rtdb, storage }; // Export services for use in the app
