/**
 * =====================================================================
 * File: admin_view_submissions.js
 * Description:
 *  - Fetches contact form submissions from Firebase Realtime Database.
 *  - Displays submissions in a table format with serial numbers.
 *  - Allows the admin to delete individual submissions from the database.
 *
 * Firebase SDK Version: 12.0.0 (Modular)
 * =====================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// ==============================
// Firebase Configuration
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSyD52JKME1Y8NUW1e_7as0uAjopkfYgsAO8",
  authDomain: "krishna-kunj-edffe.firebaseapp.com",
  databaseURL: "https://krishna-kunj-edffe-default-rtdb.firebaseio.com",
  projectId: "krishna-kunj-edffe",
  storageBucket: "krishna-kunj-edffe.appspot.com",
  messagingSenderId: "239493598475",
  appId: "1:239493598475:web:da8e611e7e1b91867ba60e"
};

// ==============================
// Initialize Firebase
// ==============================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Reference to "contact_submissions" node in Firebase
const contactRef = ref(db, "contact_submissions/");

// HTML element where the table will be rendered
const contactList = document.getElementById("contactList");

/**
 * Listen for changes in contact submissions data
 * and dynamically render them into a table.
 */
onValue(contactRef, (snapshot) => {
  const data = snapshot.val();
  contactList.innerHTML = ""; // Clear previous content

  // If no submissions exist
  if (!data) {
    contactList.innerHTML = "<p>No contact submissions yet.</p>";
    return;
  }

  // Sort submissions by timestamp (latest first)
  const entries = Object.entries(data).sort((a, b) => b[1].timestamp - a[1].timestamp);

  // Create table structure
  contactList.innerHTML = `
    <table class="contact-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Name</th>
          <th>Contact</th>
          <th>Email</th>
          <th>Message</th>
          <th>Timestamp</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const tbody = contactList.querySelector("tbody");

  // Populate table rows with submission data
  entries.forEach(([key, value], index) => {
    const date = new Date(value.timestamp || Date.now());
    const formattedTimestamp = date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${value.name || "-"}</td>
      <td>${value.phone || "-"}</td>
      <td>${value.email || "-"}</td>
      <td>${value.message || "-"}</td>
      <td>${formattedTimestamp}</td>
      <td>
        <button class="delete-btn" data-id="${key}">🗑 Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });

  /**
   * Attach event listeners for delete buttons
   * Allows admin to remove a submission from Firebase.
   */
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this submission?")) {
        const entryRef = ref(db, `contact_submissions/${id}`);
        remove(entryRef)
          .then(() => console.log("✅ Submission deleted successfully"))
          .catch((error) => alert("❌ Error deleting submission: " + error.message));
      }
    });
  });
});
