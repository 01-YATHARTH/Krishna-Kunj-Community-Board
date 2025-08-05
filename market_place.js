/* 
 * Filename: market_place.js
 * Description: Loads and renders marketplace listings from Firebase Realtime Database.
 *              Also handles responsive navbar toggle behavior.
 * 
 * Notes:
 *   - Uses Firebase v10 modular SDK (as originally written) for consistency.
 *   - Does NOT change any existing logic; only formatting, structure, and comments added.
 *   - Assumes this file is imported with <script type="module"> in the HTML.
 */

/* ================================
   Section: Navbar Toggle Logic
   ================================ */

/**
 * Sets up mobile/responsive navigation toggle:
 *  - Clicking the menu button toggles visibility of navigation links via "active" class.
 *  - Clicking any nav link closes the menu by removing the "active" class.
 */
(() => {
  // Grab DOM references for toggle button and link container
  const toggleBtn = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-links a");

  // Toggle the menu open/closed when the button is clicked.
  toggleBtn?.addEventListener("click", () => {
    navLinks?.classList.toggle("active");
  });

  // When any link is clicked, ensure menu is closed (helpful on mobile).
  navItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks?.classList.remove("active");
    });
  });
})();

/* ================================
   Section: Firebase Initialization
   ================================ */

/* Import Firebase v10 modules (the HTML or bundler must allow module usage) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/**
 * Firebase project configuration object.
 * These credentials point to your existing Firebase project; do not alter unless intentionally updating the project.
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

// Initialize Firebase app instance
const app = initializeApp(firebaseConfig);

// Get reference to the Realtime Database
const database = getDatabase(app);

/* ================================
   Section: Marketplace Data Loading
   ================================ */

/**
 * Reference to the "marketplace" node in the database.
 * This is where item listings are stored.
 */
const marketplaceRef = ref(database, "marketplace");

/**
 * Main container in the DOM that should hold the marketplace section.
 * Expected to exist in the HTML with id="marketplace".
 */
const mainContainer = document.getElementById("marketplace");

// Guard: if the expected container is missing, do not proceed further.
if (!mainContainer) {
  // <FLAG> Expected container with id="marketplace" not found. Listings cannot be rendered.
  console.warn(
    'market_place.js: Container with id "marketplace" not found. Marketplace listings will not render.'
  );
} else {
  // Create a wrapper for individual listing cards.
  const listingsContainer = document.createElement("div");
  listingsContainer.className = "notice-grid"; // CSS expected to style as grid.

  // Append the created listings container into the main marketplace section.
  mainContainer.appendChild(listingsContainer);

  /**
   * Real-time listener: fetch and render marketplace listings whenever data changes.
   */
  onValue(marketplaceRef, (snapshot) => {
    // Clear existing content before re-rendering fresh state.
    listingsContainer.innerHTML = "";

    const data = snapshot.val();

    if (data) {
      // Iterate over each marketplace item (assumes object values).
      Object.values(data).forEach((item) => {
        // Create card element for a single listing.
        const card = document.createElement("div");
        card.className = "notice-card";

        // Populate card with listing details. Inline styles for image are preserved for responsiveness.
        card.innerHTML = `
          <img src="${item.imageUrl}" alt="Item Image" style="max-width: 100%; height: auto;" />
          <h3>${item.sellerName}</h3>
          <p>${item.description}</p>
          <p><strong>Contact:</strong> ${item.contact}</p>
          <p><strong>Price:</strong> ₹${item.price}</p>
        `;

        // Append the card into the listings grid.
        listingsContainer.appendChild(card);
      });
    } else {
      // No listings available; show a fallback message.
      listingsContainer.innerHTML = "<p>No listings available.</p>";
    }
  });
}
