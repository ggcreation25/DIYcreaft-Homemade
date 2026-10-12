// ===================================================================
// Firebase Configuration — GG Creation (login-page-f8c8b)
// ===================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAmF9iuT55OEJRedcLh36FMr4WXGbR2XwY",
  authDomain: "login-page-f8c8b.firebaseapp.com",
  projectId: "login-page-f8c8b",
  storageBucket: "login-page-f8c8b.firebasestorage.app",
  messagingSenderId: "635219635407",
  appId: "1:635219635407:web:63fec466b4dffa801bdbba",
  measurementId: "G-ZL74L0YHPY"
};

// Initialize Firebase reliably
if (typeof firebase !== 'undefined') {
  try {
    if (firebase.apps && !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    if (!window.auth && firebase.auth) {
      window.auth = firebase.auth();
    }
    if (!window.db && firebase.firestore) {
      window.db = firebase.firestore();
    }
    console.log("Firebase initialized successfully (Auth & Firestore ready)");
  } catch (err) {
    console.warn("Firebase initialization notice:", err.message);
  }
}
