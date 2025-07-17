import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from './firebase-config.js';  // Make sure firebase-config.js exports 'app'

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
const auth = getAuth(app);

// 🌙 Appearance Settings
const toggle = document.getElementById('theme-toggle');
const label = document.getElementById('theme-label');

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

window.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-btn');
  const sidebar = document.getElementById('sidebar');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
  });
});



// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const pageCon = document.getElementsByClassName('page-con')[0];

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (toggle) toggle.checked = true;
    if (label) label.textContent = 'Dark Mode';
    if (pageCon) pageCon.classList.add('dark');
  }
});

// Handle theme toggle change
if (toggle) {
  toggle.addEventListener('change', () => {
    const pageCon = document.getElementsByClassName('page-con')[0];
    if (toggle.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      if (label) label.textContent = 'Dark Mode';
      if (pageCon) pageCon.classList.add('dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      if (label) label.textContent = 'Light Mode';
      if (pageCon) pageCon.classList.remove('dark');
    }
  });
}

// 🔑 Password Change Handler
const form = document.getElementById("change-password-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    const currentPass = document.getElementById("current-password").value;
    const newPass = document.getElementById("new-password").value;
    const msg = document.getElementById("password-msg");

    if (!user) {
      msg.textContent = "⚠️ No user logged in.";
      msg.style.color = "red";
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      msg.textContent = "✅ Password updated successfully.";
      msg.style.color = "green";
    } catch (error) {
      msg.textContent = `⚠️ ${error.message}`;
      msg.style.color = "red";
    }
  });
}
