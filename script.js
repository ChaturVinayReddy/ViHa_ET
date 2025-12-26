const firebaseConfig = {
  apiKey: "AIzaSyAdrJsoLGFqDptGApiLPl2Y4QP5IRn1EV4",
  authDomain: "event-viha.firebaseapp.com",
  projectId: "event-viha"

};


/*********************************
 🔥 Firebase Configuration
**********************************/


firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const eventsRef = db.collection("shared_events");

/*********************************
 🔐 Admin Password
**********************************/
const DELETE_PASSWORD = "ViHa";

/*********************************
 🚀 Events Cache (Performance)
**********************************/
let eventsCache = [];
let editEventId = null;

/*********************************
 ⛔ Prevent Future Date & Time
**********************************/
function setMaxDateTime() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  const max = `${y}-${m}-${d}T${h}:${min}`;

  const addInput = document.getElementById("eventTime");
  const editInput = document.getElementById("editEventTime");

  if (addInput) addInput.max = max;
  if (editInput) editInput.max = max;
}

setMaxDateTime();
setInterval(setMaxDateTime, 60000);

/*********************************
 ➕ Add Event
**********************************/
function addEvent() {
  const name = eventName.value.trim();
  const timeValue = eventTime.value;

  if (!name || !timeValue) {
    showToast("⚠️ Please fill all fields");
    return;
  }

  const time = new Date(timeValue).getTime();
  if (time > Date.now()) {
    showToast("❌ Future date not allowed");
    return;
  }

  eventsRef.add({
    name,
    time,
    createdAt: Date.now()
  });

  eventName.value = "";
  eventTime.value = "";

  showToast("✅ Event successfully added");
}

/*********************************
 ❌ Delete Event (Password)
**********************************/
function deleteEvent(id) {
  const pwd = prompt("Enter password to delete:");
  if (pwd === null) return;

  if (pwd === DELETE_PASSWORD) {
    eventsRef.doc(id).delete();
    showToast("🗑 Event deleted");
  } else {
    showToast("❌ Incorrect password");
  }
}

/*********************************
 ✏️ Open Edit Modal (NO ALERTS)
**********************************/
/*********************************
 ✏️ Edit Event (Password Protected)
**********************************/
function editEvent(id) {
  const pwd = prompt("Enter password to edit this event:");
  if (pwd === null) return;

  if (pwd !== DELETE_PASSWORD) {
    alert("❌ Incorrect password");
    return;
  }

  // Find event from cache
  const event = eventsCache.find(e => e.id === id);
  if (!event) return;

  // Ask new values
  const newName = prompt("Edit event name:", event.name);
  if (!newName) return;

  const currentDateTime = new Date(event.time)
    .toISOString()
    .slice(0, 16);

  const newTimeInput = prompt(
    "Edit event date & time (YYYY-MM-DDTHH:MM):",
    currentDateTime
  );

  if (!newTimeInput) return;

  const newTime = new Date(newTimeInput).getTime();

  // Block future dates
  if (newTime > Date.now()) {
    alert("❌ Future date/time not allowed");
    return;
  }

  // Update Firestore
  eventsRef.doc(id).update({
    name: newName,
    time: newTime
  });

  showToast("✏️ Event updated successfully");
}


/*********************************
 ⏱ Elapsed Time Calculator
**********************************/
function getElapsed(time) {
  const diff = Date.now() - time;
  if (diff < 0) return "⏳ Not started";

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return `${d} days ${h} hours ${m} mins ${s} seconds`;
}

/*********************************
 📡 Load Events (Realtime)
**********************************/
eventsRef.orderBy("createdAt", "desc").onSnapshot(snapshot => {
  eventsCache = [];

  countList.innerHTML = "";
  detailsList.innerHTML = "";

  snapshot.forEach(doc => {
    const event = { id: doc.id, ...doc.data() };
    eventsCache.push(event);

    /* COUNTING TAB */
    countList.innerHTML += `
      <div class="event">
        <b>${event.name}</b>
        <div class="elapsed" id="c-${event.id}">
          ${getElapsed(event.time)}
        </div>
      </div>
    `;

    /* DETAILS TAB */
    detailsList.innerHTML += `
      <div class="event">
        <b>${event.name}</b>
        <div class="date">
          ${new Date(event.time).toLocaleString()}
        </div>

        <button class="edit-btn" onclick="editEvent('${event.id}')">
          Edit
        </button>

        <button class="delete-btn" onclick="deleteEvent('${event.id}')">
          Delete
        </button>
      </div>
    `;
  });
});

/*********************************
 🔄 Ultra-Fast Local Timer
**********************************/
setInterval(() => {
  eventsCache.forEach(e => {
    const el = document.getElementById(`c-${e.id}`);
    if (el) el.innerText = getElapsed(e.time);
  });
}, 1000);

/*********************************
 ✅ Toast Notification
**********************************/
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 2500);
}
