const firebaseConfig = {
  apiKey: "AIzaSyAdrJsoLGFqDptGApiLPl2Y4QP5IRn1EV4",
  authDomain: "event-viha.firebaseapp.com",
  projectId: "event-viha"

};



firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const eventsRef = db.collection("shared_events");

/*********************************
 🔐 Delete Password
**********************************/
const DELETE_PASSWORD = "ViHa";

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
  const input = document.getElementById("eventTime");
  if (input) input.max = max;
}

setMaxDateTime();
setInterval(setMaxDateTime, 60000);

/*********************************
 🧭 Menu Navigation
**********************************/
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/*********************************
 ➕ Add Event
**********************************/
function addEvent() {
  if (!eventName.value || !eventTime.value) {
    alert("Please fill all fields");
    return;
  }

  const time = new Date(eventTime.value).getTime();
  if (time > Date.now()) {
    alert("Future date/time not allowed");
    return;
  }

  eventsRef.add({
    name: eventName.value,
    time,
    createdAt: Date.now()
  });

  eventName.value = "";
  eventTime.value = "";
  showToast("✅ Event successfully added");
}

/*********************************
 ✅ Toast Message
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

/*********************************
 ❌ Delete Event
**********************************/
function deleteEvent(id) {
  const pwd = prompt("Enter delete password:");
  if (pwd === DELETE_PASSWORD) {
    eventsRef.doc(id).delete();
  } else if (pwd !== null) {
    alert("Wrong password ❌");
  }
}

/*********************************
 ⏱ Time Calculation
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
 🚀 EVENTS CACHE (IMPORTANT)
**********************************/
let eventsCache = [];

/*********************************
 📡 Load Events ONCE (Realtime)
**********************************/
eventsRef.orderBy("createdAt", "desc").onSnapshot(snapshot => {
  eventsCache = [];

  countList.innerHTML = "";
  detailsList.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    const event = { id: doc.id, ...data };
    eventsCache.push(event);

    // Counting UI
    countList.innerHTML += `
      <div class="event">
        <b>${event.name}</b>
        <div class="elapsed" id="c-${event.id}">
          ${getElapsed(event.time)}
        </div>
      </div>
    `;

    // Details UI
    detailsList.innerHTML += `
      <div class="event">
        <b>${event.name}</b>
        <div class="date">
          ${new Date(event.time).toLocaleString()}
        </div>
        <button class="delete-btn" onclick="deleteEvent('${event.id}')">
          Delete
        </button>
      </div>
    `;
  });
});

/*********************************
 🔄 SUPER FAST TIMER (NO FIREBASE)
**********************************/
setInterval(() => {
  eventsCache.forEach(e => {
    const el = document.getElementById(`c-${e.id}`);
    if (el) el.innerText = getElapsed(e.time);
  });
}, 1000);
