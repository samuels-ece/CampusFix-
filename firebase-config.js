// firebase-config.js
// STEP 1: Go to https://console.firebase.google.com
// STEP 2: Create a new project called "CampusFix"
// STEP 3: Add a Web App (</> icon) inside the project
// STEP 4: Copy the config object it gives you and paste it below,
//         replacing the placeholder values.
// STEP 5: In the Firebase Console, enable:
//         - Authentication > Sign-in method > Email/Password
//         - Firestore Database (start in test mode for now)
//         - Storage (start in test mode for now)

const firebaseConfig = {
  apiKey: "AIzaSyD555A_oOPUIk41sChNw6iJSUIw4WmcXvw",
  authDomain: "campusfix-2cc8d.firebaseapp.com",
  projectId: "campusfix-2cc8d",
  storageBucket: "campusfix-2cc8d.firebasestorage.app",
  messagingSenderId: "335133974711",
  appId: "1:335133974711:web:a1e377e7c42a60cf5dad32"
};

// Initialize Firebase (using compat SDK - works with plain <script> tags, no build tools needed)
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
