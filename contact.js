/*
 * Filename: contact.js
 * Description: Handles contact form submissions for Krishna Kunj.
 *              Saves user messages (name, email, phone, message) to Firebase Realtime Database.
 *              Uses Firebase v12 modular SDK.
 */

/* ================================
   Section: Firebase Initialization
   ================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/**
 * Firebase configuration for Krishna Kunj project.
 * Do not change these values — they are required to connect to the existing database.
 */
const firebaseConfig = {
  apiKey: "AIzaSyD52JKME1Y8NUW1e_7as0uAjopkfYgsAO8",
  authDomain: "krishna-kunj-edffe.firebaseapp.com",
  databaseURL: "https://krishna-kunj-edffe-default-rtdb.firebaseio.com",
  projectId: "krishna-kunj-edffe",
  storageBucket: "krishna-kunj-edffe.appspot.com",
  messagingSenderId: "239493598475",
  appId: "1:239493598475:web:da8e611e7e1b91867ba60e"
};

/**
 * Initialize Firebase app instance.
 */
const app = initializeApp(firebaseConfig);

/**
 * Get database instance.
 */
const db = getDatabase(app);

/**
 * Create a reference to the `contact_submissions` node in the database.
 */
const contactRef = ref(db, "contact_submissions/");

/* ================================
   Section: Form Handling
   ================================ */

/**
 * Selects the contact form using its CSS class `.form-modern`.
 * This allows flexibility in HTML structure without relying on an ID.
 */
const contactForm = document.querySelector(".form-modern");

/**
 * Form submission event listener.
 * 
 * - Prevents default form submission behavior.
 * - Validates that all fields are filled.
 * - Pushes the message data to Firebase with a timestamp.
 * - Alerts the user on success and resets the form.
 */
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop form from refreshing the page

  // Collect input values and trim extra spaces
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();

  // Basic validation: Ensure all fields are filled
  if (!name || !email || !phone || !message) {
    alert("All fields are required.");
    return;
  }

  try {
    // Push the collected form data to the database
    await push(contactRef, {
      name,
      email,
      phone,
      message,
      timestamp: Date.now() // Save time of submission
    });

    // Notify user of success
    alert("✅ Message sent successfully!");

    // Reset the form fields
    contactForm.reset();
  } catch (error) {
    // Handle and display any errors
    alert("❌ Failed to send message. Please try again.");
    console.error("Firebase push error:", error);
  }
});
