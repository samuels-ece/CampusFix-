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
    window.location.href = 'index.html';
    return;
  }

  db.collection('users').doc(user.uid).get().then(function (doc) {
    if (doc.exists && doc.data().name) {
      userNameEl.textContent = 'Hi, ' + doc.data().name;
    } else {
      userNameEl.textContent = 'Hi, Student';
    }
  });

  db.collection('complaints')
    .where('userId', '==', user.uid)
    .orderBy('createdAt', 'desc')
    .limit(5)
    .onSnapshot(function (snapshot) {
      if (snapshot.empty) {
        recentList.innerHTML = '<p class="empty-msg">No complaints reported yet.</p>';
        return;
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
    }, function (error) {
      console.error('Error loading complaints:', error);
    });
});
