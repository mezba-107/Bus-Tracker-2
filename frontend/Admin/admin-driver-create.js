/* ================= AUTH CHECK ================= */
const token = localStorage.getItem("adminToken");

if (!token) {
  window.location.href = "/frontend/Admin/admin-login.html";
}

/* ================= DOM ELEMENTS ================= */
const panel = document.getElementById("panel");
const driverList = document.getElementById("driverList");

/* ================= API BASE ================= */
const API_BASE = "http://localhost:5000/api/admin";

let drivers = [];
let currentDriver = null;

/* ================= POPUP TOAST ================= */
function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `popup ${type}`;
  popup.innerText = message;

  document.body.appendChild(popup);

  setTimeout(() => popup.classList.add("show"), 100);

  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 400);
  }, 2500);
}

/* ================= CONFIRM BOX ================= */
function showConfirm(message, callback) {
  const confirmBox = document.createElement("div");
  confirmBox.className = "confirm-box";

  confirmBox.innerHTML = `
    <div class="confirm-content">
      <h2>⚠ Confirmation</h2>
      <p>${message}</p>

      <div class="confirm-actions">
        <button class="btn-cancel">Cancel</button>
        <button class="btn-ok">Yes Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(confirmBox);

  confirmBox.querySelector(".btn-cancel").onclick = () => {
    confirmBox.remove();
  };

  confirmBox.querySelector(".btn-ok").onclick = () => {
    confirmBox.remove();
    callback();
  };
}

/* ======================================================
   LOAD DRIVERS
====================================================== */
async function loadDrivers() {
  try {
    const res = await fetch(`${API_BASE}/drivers`);
    drivers = await res.json();
    renderDrivers();
  } catch (err) {
    showPopup("Failed to load drivers!", "error");
  }
}

/* ======================================================
   RENDER DRIVER LIST
====================================================== */
function renderDrivers() {
  driverList.innerHTML = "";

  if (drivers.length === 0) {
    driverList.innerHTML = "<p>No drivers found</p>";
    return;
  }

  drivers.forEach(driver => {
    const div = document.createElement("div");
    div.className = "driver";

    div.innerHTML = `
      <span>${driver.name}</span>
      <small>${driver.username}</small>
    `;

    div.onclick = () => openProfile(driver);

    driverList.appendChild(div);
  });
}

/* ======================================================
   CREATE DRIVER
====================================================== */
async function createDriver() {
  const name = document.getElementById("driverName").value.trim();
  const username = document.getElementById("driverId").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !username || !password) {
    showPopup("Fill all fields!", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/create-driver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showPopup(data.message || "Driver create failed!", "error");
      return;
    }

    showPopup("Driver Created Successfully!", "success");

    // Clear Inputs
    document.getElementById("driverName").value = "";
    document.getElementById("driverId").value = "";
    document.getElementById("password").value = "";

    // Open Profile
    openProfile(data.driver);

    // Reload list
    loadDrivers();
  } catch (err) {
    showPopup("Server error while creating!", "error");
  }
}

/* ======================================================
   OPEN PROFILE
====================================================== */
function openProfile(driver) {
  currentDriver = driver;

  panel.innerHTML = `
    <div class="panel-head">
      <h2>Driver Profile</h2>
      <p>${driver.username}</p>
    </div>

    <div class="form">
      <label>Name</label>
      <input id="editName" value="${driver.name || ""}">

      <label>Password</label>
      <input id="editPass" value="${driver.password || ""}">

      <label>Mobile</label>
      <input id="editMobile" value="${driver.mobile || ""}">

      <label>Address</label>
      <input id="editAddress" value="${driver.address || ""}">

      <label>Admin Note</label>
      <input id="editNote" value="${driver.adminNote || ""}">

      <button onclick="saveDriver()">Save Info</button>

      <button onclick="deleteDriver()"
        style="margin-top:12px;background:#ff3d3d;">
        Delete Driver
      </button>

      <button onclick="goBack()"
        style="margin-top:12px;background:#444;">
        Back
      </button>
    </div>
  `;
}

/* ======================================================
   SAVE DRIVER (FULL FIXED)
====================================================== */
async function saveDriver() {
  if (!currentDriver) return;

  const updatedData = {
    name: document.getElementById("editName").value.trim(),
    password: document.getElementById("editPass").value.trim(),
    mobile: document.getElementById("editMobile").value.trim(),
    address: document.getElementById("editAddress").value.trim(),

    // FIX: adminNote field
    adminNote: document.getElementById("editNote").value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/drivers/${currentDriver._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    const data = await res.json();

    if (!res.ok) {
      showPopup(data.message || "Update failed!", "error");
      return;
    }

    showPopup("Driver Updated Successfully!", "success");

    // Update currentDriver with new data
    currentDriver = data.driver;

    // Refresh Profile View
    openProfile(currentDriver);

    // Reload list
    loadDrivers();
  } catch {
    showPopup("Server error while updating!", "error");
  }
}

/* ======================================================
   DELETE DRIVER (FULL FIXED)
====================================================== */
function deleteDriver() {
  if (!currentDriver) return;

  showConfirm(`Delete driver ${currentDriver.username}?`, async () => {
    try {
      const res = await fetch(
        `${API_BASE}/drivers/${currentDriver._id}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        showPopup(data.message || "Delete failed!", "error");
        return;
      }

      showPopup("Driver Deleted Successfully!", "success");

      currentDriver = null;
      panel.innerHTML = "";

      loadDrivers();
    } catch {
      showPopup("Server error while deleting!", "error");
    }
  });
}

/* ======================================================
   BACK BUTTON (FIXED)
====================================================== */
function goBack() {
  currentDriver = null;
  panel.innerHTML = "";
}

/* ======================================================
   INIT
====================================================== */
loadDrivers();
