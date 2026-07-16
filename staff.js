const complaintList = document.getElementById("complaintList");

document.getElementById("logoutBtn").addEventListener("click", function (e) {
  e.preventDefault();
  auth.signOut().then(function () {
    window.location.href = "index.html";
  });
});

auth.onAuthStateChanged(function (user) {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  db.collection("users").doc(user.uid).get().then(function(doc){

    if(!doc.exists){
      window.location.href="index.html";
      return;
    }

    const staffName = doc.data().name;
alert("Staff Name = " + staffName);
    loadComplaints(staffName);

  });

});

function loadComplaints(staffName){

  db.collection("complaints")
    .where("assignedTo","==",staffName)
    .onSnapshot(

      function(snapshot){

        alert("Complaints found: " + snapshot.size);

        complaintList.innerHTML = "";

        if(snapshot.empty){
          complaintList.innerHTML = "<p class='loading-msg'>No complaints assigned.</p>";
          return;
        }

        snapshot.forEach(function(doc){

          const c = doc.data();

          const card = document.createElement("div");

          card.className = "complaint-card";

          card.innerHTML = `
            <h3>${c.issueType}</h3>

            <p><b>Building:</b> ${c.building}</p>
             <p><b>Complaint ID:</b> ${c.complaintId}</p>
            <p><b>Room:</b> ${c.room}</p>

            <p><b>Priority:</b> ${c.priority}</p>

            <p><b>Status:</b> ${c.status}</p>

            <p>${c.description}</p>

            <textarea class="workNote" data-id="${doc.id}" placeholder="Enter work completed...">${c.workNote || ""}</textarea>

            <button class="saveNoteBtn" data-id="${doc.id}">
              Save Note
            </button>
            <button class="completeBtn" data-id="${doc.id}">
  Mark Completed
</button>
          `;

          complaintList.appendChild(card);

        });

      },

      function(error){

        alert("Firestore Error: " + error.message);

      }

    );

}
document.addEventListener("click", function (e) {

  if (e.target.classList.contains("saveNoteBtn")) {

    const id = e.target.dataset.id;

    const note = e.target.parentElement
      .querySelector(".workNote")
      .value
      .trim();

    db.collection("complaints").doc(id).update({

      workNote: note

    }).then(function () {

      alert("Work note saved successfully!");

    }).catch(function (error) {

      alert(error.message);

    });

  }

});
document.addEventListener("click", function (e) {

  if (e.target.classList.contains("completeBtn")) {

    const id = e.target.dataset.id;

    db.collection("complaints").doc(id).update({

      status: "Waiting for Approval"

    }).then(function () {

      alert("Sent to Admin for approval.");

    }).catch(function (error) {

      alert(error.message);

    });

  }

});
