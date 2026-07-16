// script.js - CampusFix Login Logic (real Firebase Authentication)

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  errorMsg.textContent = '';

  if (!email || !password) {
    errorMsg.textContent = 'Please fill in both fields.';
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(function (userCredential) {
      // Check if this user is an admin (stored in Firestore "users" collection)
      const uid = userCredential.user.uid;
      return db.collection('users').doc(uid).get();
    })
    .then(function (doc) {

  if (!doc.exists) {
    errorMsg.textContent = "User profile not found.";
    return;
  }

  const role = doc.data().role;

  if (role === "admin") {
    window.location.href = "admin.html";
  } else if (role === "staff") {
    window.location.href = "staff.html";
  } else {
    window.location.href = "home.html";
  }

})
    .catch(function (error) {
      errorMsg.textContent = error.message;
    });
});
