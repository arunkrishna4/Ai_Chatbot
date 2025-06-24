// Load environment variables
require("dotenv").config();

// Import required packages
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const admin = require("firebase-admin");

// Firebase config
const serviceAccount = require("./chatbot-69e7d-firebase-adminsdk-fbsvc-a85a0a75d9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Create Express app (this MUST come before you use app)
const app = express();

// Middlewares (correctly placed after app is declared)
app.use(cors());
app.use(bodyParser.json());

// Chat endpoint
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  console.log("Received message:", userMessage);

  try {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        chat_history: [],
      }),
    });

    const data = await response.json();
    // console.log("Cohere response:", data);

    const botReply = data.text || "Sorry, I couldn’t respond.";

    // Log the conversation to Firestore
    await db.collection("chatMessages").add({
      user: userMessage,
      bot: botReply,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send the botreply back to the client
    res.json({ reply: botReply });
    
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ reply: "Server error." });
  }
});

// Start server
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
