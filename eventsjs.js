import { db, auth, app } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

//theme selector
function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';  // default to light
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// Load email when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const emailSpan = document.getElementById("user-email");
      if (emailSpan) {
        let name = user.email.split("@")[0];
        emailSpan.textContent = name;
        console.log("Logged in user:", user.email);
      }
    } else {
      console.log("No user found. Redirecting...");
      window.location.href = "login.html";
    }
  });
});

const eventList = document.getElementById("events-list");
const countdownEl = document.getElementById("countdown");

let events = [];

// Fetch events for current user
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const q = query(collection(db, "events"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    events = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    renderEvents(events);
    startCountdown(events);
  } else {
    eventList.innerHTML = "<li>Please log in to view events.</li>";
  }
});

function renderEvents(events) {
  eventList.innerHTML = "";
  if (events.length === 0) {
    eventList.innerHTML = "<li>No upcoming events.</li>";
    return;
  }

  events.sort((a, b) => new Date(a.date + "T" + a.time) - new Date(b.date + "T" + b.time));

  events.forEach(event => {
    const li = document.createElement("li");
    li.innerHTML = `
  <p style="font-weight: bold; font-size: 16px; margin-bottom: 5px; text-align:center">${event.name}</p>
  <p style="color: #555; margin-bottom: 3px;">📅 ${event.date}</p>
  <p style="color: #555;">⌚ ${event.time}</p>
`;

    eventList.appendChild(li);
  });
}

function startCountdown(events) {
  if (events.length === 0) {
    countdownEl.textContent = "No upcoming events.";
    return;
  }

  const nextEvent = events[0];
  const eventTime = new Date(`${nextEvent.date}T${nextEvent.time}`).getTime();

  const interval = setInterval(() => {
    const now = Date.now();
    const diff = eventTime - now;

    if (diff <= 0) {
      countdownEl.textContent = "🎉 Event started!";
      clearInterval(interval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);  
    const seconds = Math.floor((diff / 1000) % 60);

    countdownEl.textContent = `Next: ${nextEvent.name} in ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-btn");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("expanded");
  });
});

window.addEventListener('DOMContentLoaded', () => {
  renderEvents(events);
  applyTheme();
});

