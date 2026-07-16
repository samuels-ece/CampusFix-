// admin.js - CampusFix Admin Dashboard Logic

const complaintList = document.getElementById('complaintList');
const filterBtns = document.querySelectorAll('.filter-btn');
const statTotal = document.getElementById('statTotal');
const statPending = document.getElementById('statPending');
const statProgress = document.getElementById('statProgress');
const statResolved = document.getElementById('statResolved');
const chartCanvas = document.getElementById('statusChart');
let statusChart = null;
const searchInput = document.getElementById('searchInput');
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
      updateChart();
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
function updateChart() {

  const pending = allComplaints.filter(c => c.status === 'Pending').length;
  const progress = allComplaints.filter(c => c.status === 'In Progress').length;
  const resolved = allComplaints.filter(c => c.status === 'Resolved').length;

  if (statusChart) {
    statusChart.destroy();
  }

  statusChart = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: ['Pending', 'In Progress', 'Resolved'],
      datasets: [{
        label: 'Complaints',
        data: [pending, progress, resolved]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

}
function renderComplaints() {
  let filtered;

if (currentFilter === 'All') {
  filtered = allComplaints;
} else if (['Low', 'Medium', 'High', 'Critical'].includes(currentFilter)) {
  filtered = allComplaints.filter(c => c.priority === currentFilter);
} else {
  filtered = allComplaints.filter(c => c.status === currentFilter);
}

const search = searchInput.value.toLowerCase().trim();

if (search) {
  filtered = filtered.filter(c =>
    (c.complaintId || '').toLowerCase().includes(search) ||
    (c.issueType || '').toLowerCase().includes(search) ||
    (c.building || '').toLowerCase().includes(search) ||
    (c.room || '').toLowerCase().includes(search) ||
    (c.description || '').toLowerCase().includes(search)
  );
}

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
     <div class="complaint-id">
  <b>Complaint ID:</b> ${c.complaintId}
</div>
      <div class="priority">
  Priority:
  <span class="priority-${(c.priority || 'Low').toLowerCase()}">
    ${c.priority || 'Low'}
  </span>
</div>
      <div class="description">${c.description}</div>
${c.workNote ? `
<div class="work-note">
  <b>Staff Work Note:</b><br>
  ${c.workNote}
</div>
` : ""}
${c.rating ? `
<div class="feedback-box">
  <strong>Student Feedback</strong><br>
  ⭐ ${c.rating}/5<br>
  <em>${c.feedback || 'No comment'}</em>
</div>
` : ''}
      ${c.photoURL ? `<img src="${c.photoURL}" alt="Issue photo" />` : ''}
     ${c.status === "Waiting for Approval" ? `
<button class="approveBtn" data-id="${c.id}">
  ✅ Approve & Resolve
</button>
` : ""}
      <div class="admin-controls">
        <select data-id="${c.id}" class="statusSelect">
          <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
<option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
<option value="Waiting for Approval" ${c.status === 'Waiting for Approval' ? 'selected' : ''}>Waiting for Approval</option>
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
searchInput.addEventListener('input', function () {
  renderComplaints();
});
document.addEventListener("click", function (e) {

  if (e.target.classList.contains("approveBtn")) {

    const id = e.target.dataset.id;

    db.collection("complaints").doc(id).update({
      status: "Resolved"
    })
    .then(function () {
      alert("Complaint approved and resolved.");
    })
    .catch(function (error) {
      alert(error.message);
    });

  }

});
document.addEventListener("click", function(e){

  if(e.target.classList.contains("approveBtn")){

    const id = e.target.dataset.id;

    db.collection("complaints").doc(id).update({

      status: "Resolved"

    }).then(function(){

      alert("Complaint approved and resolved.");

    }).catch(function(error){

      alert(error.message);

    });

  }

});
document.getElementById("exportPdfBtn").addEventListener("click", function () {

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("CampusFix Complaint Report", 20, 20);

  let y = 35;

  allComplaints.forEach(function(c, index){

    pdf.setFontSize(11);

    pdf.text(
      `${index + 1}. ${c.complaintId || "N/A"}`,
      20,
      y
    );

    pdf.text(`Issue: ${c.issueType}`,20,y+8);
    pdf.text(`Building: ${c.building}`,20,y+16);
    pdf.text(`Room: ${c.room}`,20,y+24);
    pdf.text(`Priority: ${c.priority}`,20,y+32);
    pdf.text(`Status: ${c.status}`,20,y+40);

    y += 55;

    if(y > 260){
      pdf.addPage();
      y = 20;
    }

  });

  pdf.save("CampusFix_Report.pdf");

});
