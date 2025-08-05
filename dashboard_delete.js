/* 
 * Filename: dashboard_delete.js
 * Description: Admin-side module for Krishna Kunj. 
 *              Loads and displays announcements and marketplace listings with delete capability.
 *              Uses Firebase v12 modular SDK. All functionality (loading, sorting, deleting) is preserved.
 * 
 * Note: This is intended to be used in admin pages that have the appropriate table bodies with the 
 *       IDs "dashboard-announcement-list" and/or "dashboard-marketplace-list".
 */

/* ================================
   Section: Firebase Initialization
   ================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/**
 * Firebase configuration for the Krishna Kunj project.
 * These values must remain as-is to connect to the existing realtime database.
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
 * Initialize Firebase app and get database reference.
 */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ================================
   Section: Database References
   ================================ */

/**
 * Reference to announcements node in the realtime database.
 */
const announcementsRef = ref(db, "announcements");

/**
 * Reference to marketplace node in the realtime database.
 */
const marketplaceRef = ref(db, "marketplace");

/* ================================
   Section: DOM Element Handles
   ================================ */

/**
 * Table body element where announcements are rendered in the dashboard.
 * May be null if not present on the current page.
 */
const dashboardList = document.getElementById("dashboard-announcement-list");

/**
 * Table body element where marketplace listings are rendered in the dashboard.
 * May be null if not present on the current page.
 */
const marketplaceList = document.getElementById("dashboard-marketplace-list");

/* ================================
   Section: Announcement Loading & Deletion
   ================================ */

/**
 * Loads announcements from Firebase into the admin dashboard table.
 * Sorts by timestamp descending (newest first) and attaches delete handlers with confirmation.
 */
function loadDashboardAnnouncements() {
  onValue(announcementsRef, (snapshot) => {
    // Guard: ensure target table body exists.
    if (!dashboardList) return;

    // Clear previous content before re-rendering.
    dashboardList.innerHTML = "";

    // If no announcements present, show placeholder row spanning all columns.
    if (!snapshot.exists()) {
      dashboardList.innerHTML = `<tr><td colspan="5">No announcements yet.</td></tr>`;
      return;
    }

    // Extract and sort entries so newest appear first.
    const data = snapshot.val();
    const entries = Object.entries(data).sort(
      (a, b) => b[1].timestamp - a[1].timestamp
    );

    let index = 0;

    // Iterate through sorted announcements and create table rows.
    for (const [key, item] of entries) {
      index++;

      const row = document.createElement("tr");

      // Title / description fallbacks are preserved to avoid empty cells.
      row.innerHTML = `
        <td>${index}</td>
        <td>${item.title || "(No Title)"}</td>
        <td>${item.message || item.description || "(No Description)"}</td>
        <td>${new Date(item.timestamp).toLocaleString()}</td>
        <td><button class="table-delete-btn" data-id="${key}">Delete</button></td>
      `;

      // Attach deletion logic to the button.
      const deleteButton = row.querySelector("button");
      if (deleteButton) {
        deleteButton.onclick = () => {
          if (confirm("Delete this announcement?")) {
            remove(ref(db, `announcements/${key}`))
              .then(() => {
                alert("Deleted");
                // Reload announcements to reflect removal.
                loadDashboardAnnouncements();
              })
              .catch((err) => alert("Error deleting: " + err.message));
          }
        };
      }

      // Append this row to the announcements table body.
      dashboardList.appendChild(row);
    }
  });
}

/* ================================
   Section: Marketplace Listings Loading & Deletion
   ================================ */

/**
 * Loads marketplace listings from Firebase into the admin dashboard table.
 * Entries are sorted by timestamp descending and include delete buttons with confirmation.
 */
function loadMarketplaceListings() {
  onValue(marketplaceRef, (snapshot) => {
    // Guard: ensure target table body exists.
    if (!marketplaceList) return;

    // Clear existing rows before re-rendering.
    marketplaceList.innerHTML = "";

    // If no listings are present, show placeholder spanning all expected columns.
    if (!snapshot.exists()) {
      marketplaceList.innerHTML = `<tr><td colspan="9">No marketplace listings yet.</td></tr>`;
      return;
    }

    // Extract entries and sort by newest first.
    const data = snapshot.val();
    const entries = Object.entries(data).sort(
      (a, b) => b[1].timestamp - a[1].timestamp
    );

    let index = 0;

    // Render each listing row.
    for (const [key, item] of entries) {
      index++;

      const row = document.createElement("tr");

      // Build row HTML; include safe fallbacks.
      row.innerHTML = `
        <td>${index}</td>
        <td>${item.sellerName || "(No Item Name)"}</td>
        <td><img src="${item.imageUrl || ""}" alt="Item Image" class="market-img" /></td>
        <td>${item.contact || "N/A"}</td>
        <td>${item.email || "N/A"}</td>
        <td style="white-space: pre-wrap;">${item.description || "(No Description)"}</td>
        <td>₹${item.price || "N/A"}</td>
        <td>${new Date(item.timestamp).toLocaleString()}</td>
        <td><button class="table-delete-btn" data-id="${key}">Delete</button></td>
      `;

      // Attach deletion logic to the button.
      const deleteButton = row.querySelector("button");
      if (deleteButton) {
        deleteButton.onclick = () => {
          if (confirm("Delete this listing?")) {
            remove(ref(db, `marketplace/${key}`))
              .then(() => {
                alert("Deleted");
                // Reload listing view to reflect removal.
                loadMarketplaceListings();
              })
              .catch((err) => alert("Error deleting: " + err.message));
          }
        };
      }

      // Append the constructed row to the marketplace table body.
      marketplaceList.appendChild(row);
    }
  });
}

/* ================================
   Section: Initialization on DOM Ready
   ================================ */

/**
 * On DOM content loaded, conditionally initiate loading of dashboards
 * depending on which elements are present on the page.
 */
window.addEventListener("DOMContentLoaded", () => {
  // Only load marketplace listings if that container exists.
  if (document.getElementById("dashboard-marketplace-list")) {
    loadMarketplaceListings();
  }

  // Only load announcements if that container exists.
  if (document.getElementById("dashboard-announcement-list")) {
    loadDashboardAnnouncements();
  }
});
