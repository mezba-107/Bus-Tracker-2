/* ================= POPUP TOAST ================= */
function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup ${type}`;
  popup.innerText = message;

  document.body.appendChild(popup);

  // Show animation
  setTimeout(() => popup.classList.add("show"), 100);

  // Auto remove after 2.5s
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 400);
  }, 2500);
}

/* ================= DRIVER LOGIN ================= */
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Empty check
  if (!username || !password) {
    showPopup("⚠ Please enter Driver ID and Password", "error");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/driver/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    // Login failed
    if (!res.ok) {
      showPopup("❌ " + data.message, "error");
      return;
    }

    // ✅ Save driver session
    localStorage.setItem("driverAuth", "true");
    localStorage.setItem("driverId", data.driver.id);
    localStorage.setItem("driverUsername", data.driver.username);
    localStorage.setItem("driverName", data.driver.name);

    // Success popup
    showPopup("✅ Login Successful!", "success");

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = "driver.html";
    }, 1200);
  } catch (err) {
    showPopup("❌ Server error! Please try again.", "error");
  }
}

/* ================= AUTH CHECK ================= */
if (localStorage.getItem("driverAuth") === "true") {
  window.location.href = "driver.html";
}

// ================= ENTER KEY LOGIN =================
window.addEventListener("DOMContentLoaded", () => {
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  function handleEnter(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // page reload prevent
      login(); // তোমার existing login function call
    }
  }

  username.addEventListener("keydown", handleEnter);
  password.addEventListener("keydown", handleEnter);
});
