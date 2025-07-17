console.log("🔥 script.js is loaded");
//for saving the details
import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


import { app } from './firebase-config.js';  // ✅ Make sure the path is correct
const auth = getAuth(app);
import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// Event Flow State
let eventState = {
  step: 0,
  name: "",
  date: "",
  time: ""
};

const keywords = ["schedule", "appointment", "meeting", "event"];

function showBotMessage(message) {
  const chatContainer = document.getElementById("chat-container");
  const botMsg = document.createElement("div");
  botMsg.className = "message bot-message";
  botMsg.textContent = message;
  chatContainer.appendChild(botMsg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function startEventFlow() {
  eventState.step = 1;
  showBotMessage("Sure! What's the name of the event?");
}

function handleEventFlow(userInput) {
  if (eventState.step === 1) {
    eventState.name = userInput;
    eventState.step = 2;
    showBotMessage("Great! What date? (YYYY-MM-DD)");
  } else if (eventState.step === 2) {
    eventState.date = userInput;
    eventState.step = 3;
    showBotMessage("Awesome! What time? (HH:MM)");
  } else if (eventState.step === 3) {
    eventState.time = userInput;
    eventState.step = 0;
    openEventModalWithPrefill();
  }
}

function openEventModalWithPrefill() {
  document.getElementById('event-name').value = eventState.name;
  document.getElementById('event-date').value = eventState.date;
  document.getElementById('event-time').value = eventState.time;

  const modal = document.getElementById("event-modal");
  modal.style.display = "flex";

  showBotMessage("✅ Your event details are ready. Please confirm in the form.");
}




// Set persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Persistence error:", err.message);
});


// Logout function
function logout() {
  if (!confirm("Are you sure you want to logout?")) return;

  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert("Logout failed: " + error.message);
    });
}
window.logout = logout;



// Send message to chatbot
async function sendMessage() {
  const inputBox = document.getElementById("user-input");
  const chatContainer = document.getElementById("chat-container");
  const sendBtn = document.getElementById("send-btn");
  const userText = inputBox.value.trim();

  if (!userText) return;
  
  const placeholder = document.getElementById("chat-placeholder");
  if (placeholder) placeholder.style.display = "none";

  // Show user message
  const userMsg = document.createElement("div");
  userMsg.className = "message user-message";
  userMsg.textContent = userText;
  chatContainer.appendChild(userMsg);
  inputBox.value = "";

    // Scroll
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Check for keywords to start event flow
    // ✅ Event Flow Handling First
  if (eventState.step > 0) {
    handleEventFlow(userText);
    inputBox.value = "";
    return;
  }

  // ✅ Check for event keywords
  if (keywords.some(kw => userText.toLowerCase().includes(kw))) {
    startEventFlow();
    inputBox.value = "";
    return;
  }

  // 🔒 Disable button
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";

  



  // Loader
  const loader = document.createElement("div");
  loader.className = "message bot-message loading";
  loader.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  chatContainer.appendChild(loader);

  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await response.json();
    const botReply = data.reply || "Sorry, I couldn't respond.";

    // Remove loader
    chatContainer.removeChild(loader);

    const botMsg = document.createElement("div");
    botMsg.className = "message bot-message";
    botMsg.innerHTML = marked.parse(botReply); // Use marked to parse Markdown
    chatContainer.appendChild(botMsg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } catch (error) {
    chatContainer.removeChild(loader);
    const errMsg = document.createElement("div");
    errMsg.className = "message bot-message";
    errMsg.textContent = "⚠️ Error connecting to server.";
    chatContainer.appendChild(errMsg);
  }

  // ✅ Re-enable button
  sendBtn.disabled = false;
  sendBtn.textContent = "Send";
}

window.sendMessage = sendMessage;

// Handle Enter key for sending messages
document.getElementById("user-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const sendBtn = document.getElementById("send-btn");
    if (!sendBtn.disabled) sendMessage();
  }
});

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

// Sidebar Toggle Functionality
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-btn");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("expanded");
  });
});

      window.addEventListener('DOMContentLoaded', () => {
      const links = document.querySelectorAll('.nav-link');
      links.forEach(link => {
        if (link.href === window.location.href) {
          link.classList.add('active');
        }
      });
    });

// Event Modal Functionality
const modal = document.getElementById("event-modal");
const openBtn = document.getElementById("open-event-btn");
const closeBtn = document.querySelector(".close-btn");
const eventForm = document.getElementById("event-form");

openBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
});

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("event-name").value;
  const date = document.getElementById("event-date").value;
  const time = document.getElementById("event-time").value;

  const user = auth.currentUser;

  if (!user) {
    alert("❗ Please log in to save events.");
    return;
  }

  try {
    await addDoc(collection(db, "events"), {
      uid: user.uid,               // 🔐 Link event to user
      name: name,
      date: date,
      time: time,
      createdAt: serverTimestamp()
    });

    modal.style.display = "none";
    eventForm.reset();
    alert("✅ Event saved successfully!");

  } catch (error) {
    console.error("❌ Error saving event:", error);
    alert("Failed to save event.");
  }
});

// Apply theme on load
function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';  // default to light
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}
document.addEventListener('DOMContentLoaded', applyTheme);
