// signup.js - CampusFix Signup Logic

const signupForm = document.getElementById('signupForm');
const errorMsg = document.getElementById('errorMsg');

signupForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  errorMsg.textContent = '';

  if (!name || !email || !password) {
    errorMsg.textContent = 'Please fill in all fields.';
    return;
  }

  if (password.length < 6) {
    errorMsg.textContent = 'Password must be at least 6 characters.';
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(function (userCredential) {
      const uid = userCredential.user.uid;
      // Store extra profile info + role in Firestore
      // NOTE: everyone signs up as "student" by default.
      // To make an admin, manually change role to "admin" in the Firestore console.
      return db.collection('users').doc(uid).set({
        name: name,
        email: email,
        role: 'student',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(function () {
      window.location.href = 'home.html';
    })
    .catch(function (error) {
      errorMsg.textContent = error.message;
    });
});
