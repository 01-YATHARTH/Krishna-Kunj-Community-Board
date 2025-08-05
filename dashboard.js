/* 
 * Filename: dashboard.js
 * Description: Shared admin/site logic for Krishna Kunj. 
 *              Handles:
 *                1. Firebase v9.23.0 initialization (modular SDK) for announcements and marketplace.
 *                2. Posting announcements (with date/time) from public form.
 *                3. Loading announcements with delete buttons in public view.
 *                4. Posting marketplace listings.
 *                5. Displaying announcements in admin panel with delete capability.
 * 
 * Note: This is an ES module; it must be loaded with <script type="module">.
 *       No core behavior has been altered—only formatting and comments added for clarity.
 */

/* ================================
   Section: Firebase Initialization
   ================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

/**
 * Firebase configuration object.
 * These values tie the script to your existing Firebase project.
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
 * Initialize Firebase app and obtain database reference.
 */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ================================
   Section: Posting Announcements (Public)
   ================================ */

/**
 * Handles submission of the public announcement form.
 * Validates required fields, pushes data to Firebase, shows feedback, and resets form.
 */
document.getElementById("announcementForm")?.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent full page reload on submit.

  const form = e.target;
  const title = form.title.value.trim(); // Announcement title
  const message = form.detail.value.trim(); // Announcement description
  const date = form.date.value; // Date string (YYYY-MM-DD)
  const time = form.time.value; // Time string (HH:MM)

  // Validation: ensure all required pieces are provided.
  if (!title || !message || !date || !time) {
    alert("Please fill all fields.");
    return;
  }

  // Push the new announcement into the "announcements/" path with timestamp.
  await push(ref(db, "announcements/"), {
    title,
    message,
    date,
    time,
    timestamp: Date.now()
  });

  // Notify user of success and reset the form.
  alert("✅ Announcement posted!");
  form.reset();
});

/* ================================
   Section: Load & Render Announcements (Public View, with Delete)
   ================================ */

/**
 * Loads announcements for public display, showing delete buttons.
 * Sorted newest first. Delete is immediate after confirmation.
 */
const announcementList = document.getElementById("announcementList");
if (announcementList) {
  const announcementsRef = ref(db, "announcements/");

  // Real-time listener to update announcements when backend data changes.
  onValue(announcementsRef, (snapshot) => {
    announcementList.innerHTML = ""; // Clear existing content in container.
    const data = snapshot.val();

    // If no announcements exist, show fallback message.
    if (!data) {
      announcementList.innerHTML = "<p>No announcements yet.</p>";
      return;
    }

    // Convert object to array and sort descending by timestamp (newest first).
    const entries = Object.entries(data).sort(
      (a, b) => b[1].timestamp - a[1].timestamp
    );

    // Iterate and render each announcement card.
    for (const [key, item] of entries) {
      const card = document.createElement("div");
      card.className = "announcement-card";

      // Structured inner HTML including delete control.
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.message}</p>
        <small>${item.date} at ${item.time}</small>
        <button data-id="${key}" class="delete-btn">Delete</button>
      `;
      announcementList.appendChild(card);
    }

    // Attach delete handlers after DOM nodes are inserted.
    announcementList.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const key = btn.getAttribute("data-id");

        // Confirm with admin before deletion.
        if (confirm("Are you sure you want to delete this announcement?")) {
          await remove(ref(db, `announcements/${key}`));
        }
      });
    });
  });
}

/* ================================
   Section: Posting Marketplace Listings
   ================================ */

/**
 * Handles marketplace listing submissions.
 * Validates all fields, pushes to Firebase, and resets the form.
 */
document.getElementById("marketplaceForm")?.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent default submission behavior.

  const form = e.target;
  const sellerName = form.sellerName.value.trim(); // Name of item or seller
  const imageUrl = form.imageUrl.value.trim(); // Image URL for listing
  const contact = form.contact.value.trim(); // Contact number / info
  const email = form.email.value.trim(); // Seller email
  const description = form.description.value.trim(); // Item description
  const price = form.price.value.trim(); // Price string

  // Ensure all fields are provided.
  if (!sellerName || !imageUrl || !contact || !email || !description || !price) {
    alert("Please fill all fields.");
    return;
  }

  // Push listing into "marketplace/" node with timestamp.
  await push(ref(db, "marketplace/"), {
    sellerName,
    imageUrl,
    contact,
    email,
    description,
    price,
    timestamp: Date.now()
  });

  // Feedback to user and reset.
  alert("✅ Listing posted!");
  form.reset();
});

/* ================================
   Section: Admin Announcement Display & Delete
   ================================ */

/**
 * Displays announcements in an admin-specific container with deletion capability.
 * Includes confirmation and success feedback.
 */
const adminAnnouncementContainer = document.getElementById("admin-announcements");
if (adminAnnouncementContainer) {
  const adminAnnouncementsRef = ref(db, "announcements/");

  // Real-time listener for admin view.
  onValue(adminAnnouncementsRef, (snapshot) => {
    adminAnnouncementContainer.innerHTML = ""; // Clear existing.
    const data = snapshot.val();

    // Fallback when no announcements exist.
    if (!data) {
      adminAnnouncementContainer.innerHTML = "<p>No announcements yet.</p>";
      return;
    }

    // Sort entries by newest first.
    const entries = Object.entries(data).sort(
      (a, b) => b[1].timestamp - a[1].timestamp
    );

    // Render each announcement with a delete button.
    for (const [key, item] of entries) {
      const div = document.createElement("div");
      div.className = "admin-announcement-item";

      div.innerHTML = `
        <strong>${item.title}</strong>
        <p>${item.message}</p>
        <small>${item.date} at ${item.time}</small><br/>
        <button class="delete-btn" data-id="${key}">Delete</button>
      `;

      adminAnnouncementContainer.appendChild(div);
    }

    // Wire up deletion logic for admin panel.
    adminAnnouncementContainer.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const key = btn.getAttribute("data-id");

        if (confirm("Are you sure you want to delete this announcement?")) {
          await remove(ref(db, `announcements/${key}`));
          alert("✅ Deleted successfully!");
        }
      });
    });
  });
}
