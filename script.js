console.log("🔥 script.js is loaded");
// import { marked } from "https://cdn.jsdelivr.net/npm/marked/marked.esm.js";


import { auth } from './firebase-config.js';  // ✅ Make sure the path is correct

import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// Set persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Persistence error:", err.message);
});


// Toggle sidebar
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}
window.toggleSidebar = toggleSidebar;

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

  // 🔒 Disable button
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";

  // Show user message
  const userMsg = document.createElement("div");
  userMsg.className = "message user-message";
  userMsg.textContent = userText;
  chatContainer.appendChild(userMsg);
  inputBox.value = "";

  // Scroll
  chatContainer.scrollTop = chatContainer.scrollHeight;

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

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-btn");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("expanded");
  });
});


