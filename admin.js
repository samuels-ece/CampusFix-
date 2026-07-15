// admin.js - CampusFix Admin Dashboard Logic

const complaintList = document.getElementById('complaintList');
const filterBtns = document.querySelectorAll('.filter-btn');
const statTotal = document.getElementById('statTotal');
const statPending = document.getElementById('statPending');
const statProgress = document.getElementById('statProgress');
const statResolved = document.getElementById('statResolved');

let allComplaints = [];
let currentFilter = 'All';

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
    if (!doc.exists || doc.data().role !== 'admin') {
      window.location.href = 'home.html';
      return;
    }
    loadComplaints();
  });
});

function loadComplaints() {
  db.collection('complaints')
    .orderBy('createdAt', 'desc')
    .onSnapshot(function (snapshot) {
      allComplaints = [];
      snapshot.forEach(function (doc) {
        allComplaints.push({ id: doc.id, ...doc.data() });
      });
      updateStats();
      renderComplaints();
    }, function (error) {
      complaintList.innerHTML = `<p class="empty-msg">Error: ${error.message}</p>`;
    });
}

function updateStats() {
  statTotal.textContent = allComplaints.length;
  statPending.textContent = allComplaints.filter(c => c.status === 'Pending').length;
  statProgress.textContent = allComplaints.filter(c => c.status === 'In Progress').length;
  statResolved.textContent = allComplaints.filter(c => c.status === 'Resolved').length;
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
      <div class="admin-controls">
        <select data-id="${c.id}" class="statusSelect">
          <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
        <input type="text" data-id="${c.id}" class="assignInput" placeholder="Assign staff name" value="${c.assignedTo || ''}" />
      </div>
    `;
    complaintList.appendChild(card);
  });

  document.querySelectorAll('.statusSelect').forEach(function (select) {
    select.addEventListener('change', function () {
      const id = select.dataset.id;
      const newStatus = select.value;
      db.collection('complaints').doc(id).update({ status: newStatus })
        .then(function () {
          const complaint = allComplaints.find(c => c.id === id);
          if (complaint) complaint.status = newStatus;
          updateStats();
          renderComplaints();
        });
    });
  });

  document.querySelectorAll('.assignInput').forEach(function (input) {
    input.addEventListener('blur', function () {
      const id = input.dataset.id;
      const staffName = input.value.trim();
      db.collection('complaints').doc(id).update({ assignedTo: staffName || null })
        .then(function () {
          const complaint = allComplaints.find(c => c.id === id);
          if (complaint) complaint.assignedTo = staffName || null;
        });
    });
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
