Smart AI Chatbot

This is a smart AI-powered chatbot with Firebase authentication and Cohere integration. It supports real-time conversations with users and is built with a separate frontend and backend structure.

⚙️ Technologies Used

- **Frontend:**
  - HTML5, CSS3
  - JavaScript (Vanilla)
  - Firebase Authentication

- **Backend:**
  - Node.js + Express
  - Firebase Admin SDK
  - OpenAI API

---

🚀 Features

- 🔐 User Login / Signup with Firebase
- 💬 Chat with OpenAI-powered bot
- 🌐 Responsive layout
- 🧠 Loader animation during bot thinking
- 📦 Rate limiting using button lockout
- 🔐 Logout & session handling

---

🔧 Setup Instructions

# Prerequisites

- Node.js and npm installed
- Firebase project
- Cohere API Key

 # Set Up Backend
  -cd backend
  -npm install

Create a .env file inside /backend:
  -COHERE_API_KEY=your_cohere_api_key
  -FIREBASE_PRIVATE_KEY=your_firebase_private_key
  -FIREBASE_PROJECT_ID=your_project_id
  -FIREBASE_CLIENT_EMAIL=your_firebase_client_email

Run the server
  -node server.js

# Run Frontend
Simply open frontend/index.html in your browser or use a live server extension in VSCode.
