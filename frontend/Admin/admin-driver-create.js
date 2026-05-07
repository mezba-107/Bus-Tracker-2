/* ================= AUTH CHECK ================= */
const token = localStorage.getItem("adminToken");

if (!token) {
  window.location.href = "/frontend/Admin/admin-login.html";
}

/* ================= DOM ELEMENTS ================= */
const panel = document.getElementById("panel");
const driverList = document.getElementById("driverList");
const createViewHTML = document.getElementById("createView").outerHTML;

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
  confirmBox.className = "confirm-overlay";

  confirmBox.innerHTML = `
    <div class="confirm-modal">
      <h2>⚠ Confirm Delete</h2>
      <p>${message}</p>

      <div class="confirm-actions">
        <button class="cancel-btn">Cancel</button>
        <button class="delete-btn">Yes, Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(confirmBox);

  confirmBox.querySelector(".cancel-btn").onclick = () => {
    confirmBox.remove();
  };

  confirmBox.querySelector(".delete-btn").onclick = () => {
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
  const driverList = document.getElementById("driverList");

  if (!driverList) return;

  driverList.innerHTML = "";

  if (drivers.length === 0) {
    driverList.innerHTML = "<p>No drivers found</p>";
    return;
  }

  drivers.forEach((driver) => {
    const div = document.createElement("div");
    div.className = "driver";

    div.innerHTML = `
      <span>${driver.name}</span>
      <small>${driver.username}</small>
    `;

    div.addEventListener("click", () => openProfile(driver));

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
      body: JSON.stringify({ name, username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showPopup(data.message || "Driver create failed!", "error");
      return;
    }

    showPopup("Driver Created Successfully!", "success");

    document.getElementById("driverName").value = "";
    document.getElementById("driverId").value = "";
    document.getElementById("password").value = "";

    openProfile(data.driver);
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

      <div class="form-group">
        <input id="editName" value="${driver.name || ""}" required>
        <label>Name</label>
      </div>

      <div class="form-group">
        <input type="password" id="editPass">
        <label>Enter New Password</label>
      </div>

      <div class="form-group">
        <input id="editMobile" value="${driver.mobile || ""}">
        <label>Mobile</label>
      </div>

      <div class="form-group">
        <input id="editAddress" value="${driver.address || ""}">
        <label>Address</label>
      </div>

      <div class="form-group">
        <input id="editEmail" value="${driver.email || ""}">
        <label>Email</label>
      </div>

<div class="form-group">
  <textarea id="adminMsg" required></textarea>
  <label>✉️ Type your notice here...</label>
</div>

      <button class="send-btn" onclick="sendNotice()">
        <i class="fa-solid fa-paper-plane"></i> Send Notice
      </button>

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

  setTimeout(() => {
    document
      .querySelectorAll(".form-group input, .form-group textarea")
      .forEach((input) => {
        if (input.value !== "") {
          input.classList.add("filled");
        }

        // ✅ ADDED LIVE FLOAT FIX (ONLY ADD)
        input.addEventListener("input", () => {
          if (input.value !== "") {
            input.classList.add("filled");
          } else {
            input.classList.remove("filled");
          }
        });
      });
  }, 100);
}

/* ======================================================
   SAVE DRIVER
====================================================== */
async function saveDriver() {
  if (!currentDriver) return;

  const password = document.getElementById("editPass").value.trim();

  const updatedData = {
    name: document.getElementById("editName").value.trim(),
    mobile: document.getElementById("editMobile").value.trim(),
    address: document.getElementById("editAddress").value.trim(),
    email: document.getElementById("editEmail").value.trim(),
  };

  if (password) {
    updatedData.password = password;
  }

  try {
    const res = await fetch(`${API_BASE}/drivers/${currentDriver._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    const data = await res.json();

    if (!res.ok) {
      showPopup(data.message || "Update failed!", "error");
      return;
    }

    showPopup("Driver Updated Successfully!", "success");

    currentDriver = data.driver;
    openProfile(currentDriver);
    loadDrivers();
  } catch {
    showPopup("Server error while updating!", "error");
  }
}

/* ================= DELETE ================= */
function deleteDriver() {
  if (!currentDriver) return;

  showConfirm(`Delete driver ${currentDriver.username}?`, async () => {
    try {
      const res = await fetch(`${API_BASE}/drivers/${currentDriver._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showPopup(data.message || "Delete failed!", "error");
        return;
      }

      showPopup("Driver Deleted Successfully!", "success");

      currentDriver = null;
      panel.innerHTML = createViewHTML;
      loadDrivers();
    } catch {
      showPopup("Server error while deleting!", "error");
    }
  });
}

/* ================= BACK ================= */
function goBack() {
  currentDriver = null;
  panel.innerHTML = createViewHTML;
  loadDrivers();
}

/* ================= NOTICE ================= */
async function sendNotice() {
  const textarea = document.getElementById("adminMsg");
  const message = textarea.value.trim();

  if (!message) {
    showPopup("Write a notice first!", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/send-notice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        driverId: currentDriver._id,
        message,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showPopup(data.message || "Failed to send notice!", "error");
      return;
    }

    showPopup("Notice sent successfully!", "success");

    // ✅ FIX ADDED (ONLY THIS PART)
    textarea.value = "";
    textarea.classList.remove("filled");
  } catch {
    showPopup("Server error!", "error");
  }
}
/* ================= INIT ================= */
loadDrivers();

function handleSubmit(e) {
  e.preventDefault();
  createDriver();
}

function clearInputs() {
  document
    .querySelectorAll(".form-group input, .form-group textarea")
    .forEach((input) => {
      input.value = "";
      input.classList.remove("filled");
    });
}

clearInputs();
