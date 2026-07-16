const notificationList = document.getElementById("notificationList");

auth.onAuthStateChanged(function(user){

  if(!user){
    window.location.href="index.html";
    return;
  }

  db.collection("complaints")
    .where("userId","==",user.uid)
    .orderBy("createdAt","desc")
    .onSnapshot(function(snapshot){

      notificationList.innerHTML="";

      if(snapshot.empty){
        notificationList.innerHTML="<p class='empty-msg'>No notifications yet.</p>";
        return;
      }

      snapshot.forEach(function(doc){

        const c = doc.data();

        let message = "";

        if(c.status==="Pending"){
          message="🟡 Your complaint is waiting for review.";
        }
        else if(c.status==="In Progress"){
          message="🔵 Your complaint is being worked on.";
        }
        else if(c.status==="Resolved"){
          message="✅ Your complaint has been resolved.";
        }

        if(c.workNote){
          message += "<br><br><b>Staff Note:</b> " + c.workNote;
        }

        const card=document.createElement("div");
        card.className="notification-card";

        card.innerHTML=`
          <h4>${c.issueType}</h4>
          <p>${message}</p>
        `;

        notificationList.appendChild(card);

      });

    });

});
