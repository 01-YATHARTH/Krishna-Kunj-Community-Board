/* 
 * Filename: admin_login.js
 * Description: Handles admin login form submission. 
 *              Validates the password and redirects to dashboard on success.
 *              Keeps the existing hardcoded password logic intact.
 */

/**
 * Sets up the login form submission handler.
 * - Prevents default form submission.
 * - Compares entered password to the hardcoded value.
 * - Redirects to dashboard if correct; otherwise, shows an alert.
 */
(function () {
  // Grab the login form element by its ID. If it doesn't exist, bail out quietly.
  const loginForm = document.getElementById("admin-login-form");
  if (!loginForm) return; // <FLAG> Form not present in DOM; nothing to wire up.

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the form from performing a full-page submit/reload.

    // Retrieve the value of the password input.
    const passwordInput = document.getElementById("admin-password");
    const password = passwordInput ? passwordInput.value : "";

    // Check against the expected hardcoded password.
    if (password === "krishna123") {
      // Correct credentials: navigate to the admin dashboard.
      window.location.href = "dashboard.html";
    } else {
      // Incorrect password: notify the user.
      alert("❌ Wrong password!");
    }
  });
})();
