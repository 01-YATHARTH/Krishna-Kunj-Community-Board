/* 
 * Filename: script.js
 * Description: Shared logic for Krishna Kunj site. 
 *              Handles:
 *                1. Navbar toggle behavior for mobile/responsive navigation.
 *                2. Firebase v12 modular initialization for announcements.
 *                3. Announcement operations: posting, deleting, and loading/displaying.
 *
 * Note: This is an ES module and must be loaded with <script type="module">.
 *       Nothing in this file changes existing functionality; formatting and comments 
 *       have been improved for clarity. No Firebase version is altered here — it uses 
 *       the v12 modular SDK as originally written.
 */

/* ================================
   Section: Navbar Toggle Logic
   ================================ */

/**
 * Initializes the navigation toggle and link behavior after DOM is ready.
 * - Toggles `.active` class on `.nav-links` when the menu button is clicked.
 * - Closes the menu (removes `.active`) when any individual nav link is clicked.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Select the menu toggle button element (could be null if not present).
  const toggleBtn = document.querySelector(".menu-toggle");

  // Select the navigation links container that will be shown/hidden.
  const navLinks = document.querySelector(".nav-links");

  // Select all anchor elements inside the navigation for collapsing after click.
  const navItems = document.querySelectorAll(".nav-links a");

  // Guard presence and attach click listener to toggle menu visibility.
  toggleBtn?.addEventListener("click", () => {
    // Toggle the 'active' class which should control visibility in CSS.
    navLinks?.classList.toggle("active");
  });

  // For each navigation link, ensure clicking it hides the mobile menu.
  navItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks?.classList.remove("active");
    });
  });
});

/* ================================
   Section: Firebase Initialization & Announcement Operations
   ================================ */

/* 
 * Import Firebase v12 modular SDK pieces. 
 * These are dynamic ES module imports from Google's CDN and must remain as-is.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/* --------------------
   Firebase Configuration
   -------------------- */
/**
 * Firebase project configuration.
 * These values are specific to your Firebase project and must not be altered unless intentionally updating the project.
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

/* --------------------
   Firebase Initialization
   -------------------- */
/**
 * Initialize Firebase app instance and get a reference to the Realtime Database.
 * The announcements are stored under the "announcements/" path.
 */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const announcementsRef = ref(db, "announcements/");

/* ================================
   Section: Announcement Helper Functions
   ================================ */

/**
 * Posts a new announcement to the Firebase Realtime Database.
 * Guards against empty title or message.
 *
 * @param {string} title - The title of the announcement.
 * @param {string} message - The body/content of the announcement.
 * @returns {Promise<void>} Resolves after the announcement is pushed.
 */
export async function postAnnouncement(title, message) {
  // Validate inputs: both title and message must be truthy.
  if (!title || !message) return;

  // Push a new announcement object containing title, message, and timestamp.
  await push(announcementsRef, {
    title,
    message,
    timestamp: Date.now()
  });
}

/**
 * Deletes an existing announcement identified by its key.
 *
 * @param {string} key - The unique key of the announcement to remove.
 * @returns {Promise<void>} Resolves after deletion.
 */
export async function deleteAnnouncement(key) {
  if (!key) return;

  // Construct a reference to the specific announcement and remove it.
  await remove(ref(db, `announcements/${key}`));
}

/**
 * Loads announcements from Firebase and renders them inside a container element.
 * Optionally includes delete buttons per announcement.
 *
 * @param {string} containerId - The DOM element ID where announcements will be injected.
 * @param {boolean} [includeDelete=false] - Whether to render a delete button for each announcement.
 */
export function loadAnnouncements(containerId, includeDelete = false) {
  // Get the target container element by ID.
  const container = document.getElementById(containerId);
  if (!container) return; // Guard if container does not exist.

  // Initial placeholder while data is fetched.
  container.innerHTML = "Loading...";

  // Set up real-time listener for announcements data changes.
  onValue(announcementsRef, (snapshot) => {
    // Clear existing content before re-rendering.
    container.innerHTML = "";

    // Retrieve raw data object from snapshot.
    const data = snapshot.val();

    // If no announcements exist, show a friendly message.
    if (!data) {
      container.innerHTML = "<p>No announcements yet.</p>";
      return;
    }

    // Convert object into entries and sort descending by timestamp (newest first).
    const entries = Object.entries(data).sort(
      (a, b) => b[1].timestamp - a[1].timestamp
    );

    // Iterate over sorted announcements and render each as a card.
    for (const [key, item] of entries) {
      // Create container for this announcement.
      const card = document.createElement("div");
      card.className = "announcement-card";

      // Build inner HTML. Use conditional inclusion for delete button if requested.
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.message}</p>
        <small>${new Date(item.timestamp).toLocaleString()}</small>
        ${includeDelete ? `<button data-id="${key}">Delete</button>` : ""}
      `;

      // If delete controls are enabled, wire up the deletion handler.
      if (includeDelete) {
        const btn = card.querySelector("button");
        if (btn) {
          btn.onclick = () => deleteAnnouncement(key);
        }
      }

      // Append fully prepared card into container.
      container.appendChild(card);
    }
  });
}
