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
    .onSnapshot(function (snapshot) {
      allComplaints = [];
      snapshot.forEach(function (doc) {
        allComplaints.push({ id: doc.id, ...doc.data() });
      });
      renderComplaints();
    }, function (error) {
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

${c.status === 'Resolved' ? `
<div class="feedback-section">

  ${c.rating ? `
    <p><strong>Your Rating:</strong> ⭐ ${c.rating}/5</p>
    <p>${c.feedback || ''}</p>
  ` : `
    <label>Rate our service</label>

    <select class="ratingSelect" data-id="${c.id}">
      <option value="">Select Rating</option>
      <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
      <option value="4">⭐⭐⭐⭐ Very Good</option>
      <option value="3">⭐⭐⭐ Good</option>
      <option value="2">⭐⭐ Fair</option>
      <option value="1">⭐ Poor</option>
    </select>

    <textarea
      class="feedbackText"
      data-id="${c.id}"
      placeholder="Write your feedback..."
    ></textarea>

    <button class="feedbackBtn" data-id="${c.id}">
      Submit Feedback
    </button>
  `}

</div>
` : ''}

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
document.addEventListener('click', async function (e) {

  if (!e.target.classList.contains('feedbackBtn')) return;

  const id = e.target.dataset.id;

  const rating = document.querySelector(
    `.ratingSelect[data-id="${id}"]`
  ).value;

  const feedback = document.querySelector(
    `.feedbackText[data-id="${id}"]`
  ).value.trim();

  if (!rating) {
    alert("Please select a rating.");
    return;
  }

  try {

    await db.collection('complaints').doc(id).update({
      rating: Number(rating),
      feedback: feedback,
      feedbackDate: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Thank you for your feedback!");

  } catch (error) {
    alert(error.message);
  }

});
