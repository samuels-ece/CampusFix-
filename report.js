// report.js - CampusFix Report Issue Logic
// Includes:
//  1. Simple keyword-based "AI" issue classification (no external API needed)
//  2. Duplicate detection (checks if a similar open complaint already exists)
//  3. Photo upload to Firebase Storage
//  4. Saving the complaint to Firestore

const reportForm = document.getElementById('reportForm');
const descriptionEl = document.getElementById('description');
const suggestedTypeEl = document.getElementById('suggestedType');
const buildingEl = document.getElementById('building');
const roomEl = document.getElementById('room');
const photoEl = document.getElementById('photo');
const photoPreview = document.getElementById('photoPreview');
const duplicateWarning = document.getElementById('duplicateWarning');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const submitBtn = document.getElementById('submitBtn');

let currentUser = null;
let detectedIssueType = 'Other';

auth.onAuthStateChanged(function (user) {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = user;
});

// --- 1. Simple keyword-based classifier ---
// This mimics an "AI classification" feature without needing a paid API.
// Later this could be swapped for a real ML model or an API call.
const CATEGORY_KEYWORDS = {
  Electrical: ['light', 'bulb', 'fan', 'switch', 'socket', 'wire', 'wiring', 'short circuit', 'power', 'electric'],
  Plumbing: ['water', 'leak', 'tap', 'pipe', 'toilet', 'bathroom', 'flush', 'drain', 'sink'],
  Furniture: ['chair', 'desk', 'table', 'bench', 'door', 'window', 'lock', 'broken', 'crack'],
  Cleanliness: ['dirty', 'garbage', 'trash', 'clean', 'smell', 'dust'],
  Internet: ['wifi', 'internet', 'network', 'router', 'connection']
};

function classifyIssue(text) {
  const lower = text.toLowerCase();
  for (const category in CATEGORY_KEYWORDS) {
    const keywords = CATEGORY_KEYWORDS[category];
    for (let i = 0; i < keywords.length; i++) {
      if (lower.includes(keywords[i])) {
        return category;
      }
    }
  }
  return 'Other';
}

descriptionEl.addEventListener('input', function () {
  const text = descriptionEl.value.trim();
  if (text.length < 5) {
    suggestedTypeEl.textContent = '';
    return;
  }
  detectedIssueType = classifyIssue(text);
  suggestedTypeEl.textContent = 'Detected category: ' + detectedIssueType;
});

// --- Photo preview ---
photoEl.addEventListener('change', function () {
  const file = photoEl.files[0];
  if (file) {
    photoPreview.src = URL.createObjectURL(file);
    photoPreview.style.display = 'block';
  }
});

// --- 2. Duplicate detection ---
// Checks Firestore for existing open complaints with the same building,
// room, and issue type. Warns the user but still lets them submit.
async function checkForDuplicates(building, room, issueType) {
  const snapshot = await db.collection('complaints')
    .where('building', '==', building)
    .where('room', '==', room)
    .where('issueType', '==', issueType)
    .where('status', 'in', ['Pending', 'In Progress'])
    .limit(1)
    .get();

  return !snapshot.empty;
}

// Re-check for duplicates whenever building/room changes and we have a category
async function maybeCheckDuplicate() {
  const building = buildingEl.value;
  const room = roomEl.value.trim();
  if (!building || !room || !detectedIssueType) {
    duplicateWarning.style.display = 'none';
    return;
  }
  const isDuplicate = await checkForDuplicates(building, room, detectedIssueType);
  if (isDuplicate) {
    duplicateWarning.textContent = `Heads up: a similar "${detectedIssueType}" issue in ${building}, ${room} is already reported and open.`;
    duplicateWarning.style.display = 'block';
  } else {
    duplicateWarning.style.display = 'none';
  }
}

buildingEl.addEventListener('change', maybeCheckDuplicate);
roomEl.addEventListener('blur', maybeCheckDuplicate);

// --- 3 & 4. Submit: upload photo (if any), then save complaint ---
reportForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  errorMsg.textContent = '';
  successMsg.textContent = '';

  const description = descriptionEl.value.trim();
  const building = buildingEl.value;
  const room = roomEl.value.trim();
  const photoFile = photoEl.files[0];

  if (!description || !building || !room) {
    errorMsg.textContent = 'Please fill in all required fields.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    // Photo upload disabled for now (Storage requires billing)

    await db.collection('complaints').add({
      userId: currentUser.uid,
      description: description,
      issueType: detectedIssueType,
      building: building,
      room: room,
      photoURL: photoURL,
      status: 'Pending',
      assignedTo: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    successMsg.textContent = 'Report submitted successfully!';
    reportForm.reset();
    photoPreview.style.display = 'none';
    suggestedTypeEl.textContent = '';
    duplicateWarning.style.display = 'none';

    setTimeout(function () {
      window.location.href = 'home.html';
    }, 1200);

  } catch (error) {
    errorMsg.textContent = error.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Report';
  }
});
