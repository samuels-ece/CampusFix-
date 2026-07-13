// home.js - CampusFix Home Page Logic (real Firebase data)

const userNameEl = document.getElementById('userName');
const recentList = document.getElementById('recentList');

document.getElementById('logoutBtn').addEventListener('click', function (e) {
  e.preventDefault();
  auth.signOut().then(function () {
    window.location.href = 'index.html';
  });
});

auth.onAuthStateChanged(function (user) {
  if (!user) {
    // Not logged in -> send back to login page
    window.location.href = 'index.html';
    return;
  }

  // Get the user's profile info
  db.collection('users').doc(user.uid).get().then(function (doc) {
    if (doc.exists) {
      userNameEl.textContent = 'Hi, ' + doc.data().name;
    }
  });

  // Get this user's most recent complaints (up to 5)
  db.collection('complaints')
    .where('userId', '==', user.uid)
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get()
    .then(function (snapshot) {
      if (snapshot.empty) {
        return; // "No complaints reported yet." stays visible
      }
      recentList.innerHTML = '';
      snapshot.forEach(function (doc) {
        const c = doc.data();
        const card = document.createElement('div');
        card.className = 'complaint-item';
        card.innerHTML = `
          <strong>${c.issueType}</strong> - ${c.building}, Room ${c.room}
          <span class="status status-${c.status.toLowerCase().replace(' ', '-')}">${c.status}</span>
        `;
        recentList.appendChild(card);
      });
    })
    .catch(function (error) {
      console.error('Error loading complaints:', error);
    });
});
