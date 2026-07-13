// history.js - CampusFix Complaint History Logic

const complaintList = document.getElementById('complaintList');
const filterBtns = document.querySelectorAll('.filter-btn');

let allComplaints = [];
let currentFilter = 'All';

auth.onAuthStateChanged(function (user) {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  loadComplaints(user.uid);
});

function loadComplaints(uid) {
  db.collection('complaints')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .get()
    .then(function (snapshot) {
      allComplaints = [];
      snapshot.forEach(function (doc) {
        allComplaints.push({ id: doc.id, ...doc.data() });
      });
      renderComplaints();
    })
    .catch(function (error) {
      complaintList.innerHTML = `<p class="empty-msg">Error loading complaints: ${error.message}</p>`;
    });
}

function renderComplaints() {
  const filtered = currentFilter === 'All'
    ? allComplaints
    : allComplaints.filter(c => c.status === currentFilter);

  if (filtered.length === 0) {
    complaintList.innerHTML = '<p class="empty-msg">No complaints found.</p>';
    return;
  }

  complaintList.innerHTML = '';
  filtered.forEach(function (c) {
    const statusClass = 'status-' + c.status.toLowerCase().replace(' ', '-');
    const card = document.createElement('div');
    card.className = 'complaint-card';
    card.innerHTML = `
      <div class="complaint-card-top">
        <h4>${c.issueType}</h4>
        <span class="status ${statusClass}">${c.status}</span>
      </div>
      <div class="location">${c.building}, Room ${c.room}</div>
      <div class="description">${c.description}</div>
      ${c.photoURL ? `<img src="${c.photoURL}" alt="Issue photo" />` : ''}
    `;
    complaintList.appendChild(card);
  });
}

filterBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderComplaints();
  });
});
