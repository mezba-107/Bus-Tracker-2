// =====================
// CUSTOM POPUP
// =====================

function showPopup(message) {
  document.getElementById("popupMsg").innerText = message;
  document.getElementById("popup").style.display = "flex";

  // 🔥 reset modal blur
  document.querySelector(".modal-card")?.classList.add("blur");
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
  document.querySelector(".modal-card")?.classList.remove("blur");
}

// =====================
// AUTH CHECK
// =====================
const token = localStorage.getItem("adminToken");

if (!token) {
  alert("Unauthorized! Please login");
  window.location.href = "/frontend/Admin/admin-login.html";
}

// =====================
// LOAD ADMIN PROFILE
// =====================

async function loadAdminProfile() {
  try {
    const res = await fetch("http://localhost:5000/api/admin/profile", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();

    document.getElementById("adminName").value = data.name || "";
    document.getElementById("adminUsername").value = data.username || "";
    document.getElementById("adminMobile").value = data.mobile || "";
    document.getElementById("adminEmail").value = data.email || "";
    document.getElementById("adminRole").value = data.role || "";

    // 🔥 FLOAT LABEL FIX AFTER LOAD
    setTimeout(() => {
      document.querySelectorAll(".info-item input").forEach((input) => {
        if (input.value.trim() !== "") {
          input.classList.add("filled");
        } else {
          input.classList.remove("filled");
        }
      });
    }, 200);
  } catch (err) {
    showPopup("Failed to load profile");
  }
}

// =====================
// MODAL CONTROL
// =====================
function openResetModal() {
  document.getElementById("resetModal").style.display = "flex";
}

function closeResetModal() {
  document.getElementById("resetModal").style.display = "none";
}

// =====================
// RESET PASSWORD
// =====================
async function resetPassword() {
  const oldPassword = document.getElementById("oldPass").value;
  const newPassword = document.getElementById("newPass").value;
  const confirmPassword = document.getElementById("confirmPass").value;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return showPopup("Please fill all fields");
  }

  if (newPassword !== confirmPassword) {
    return showPopup("Passwords do not match");
  }

  try {
    const res = await fetch("http://localhost:5000/api/admin/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      return showPopup(data.message);
    }

    // SUCCESS
    showPopup("Password updated successfully");

    // clear inputs
    document.getElementById("oldPass").value = "";
    document.getElementById("newPass").value = "";
    document.getElementById("confirmPass").value = "";

    setTimeout(() => {
      closeResetModal();
    }, 1000);
  } catch (err) {
    showPopup("Server error");
    console.error(err);
  }
}

// =====================
// UPDATE PROFILE
// =====================

async function updateProfile() {
  const name = document.getElementById("adminName").value.trim();
  const username = document.getElementById("adminUsername").value.trim();
  const mobile = document.getElementById("adminMobile").value.trim();

  if (!name || !username) {
    return showPopup("Name and Username required");
  }

  try {
    const res = await fetch("http://localhost:5000/api/admin/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ name, username, mobile }),
    });

    const data = await res.json();

    if (!res.ok) return showPopup(data.message);

    showPopup("Profile updated successfully");
  } catch (err) {
    showPopup("Server error");
  }
}

// =====================
// LOGOUT
// =====================
function logoutAdmin() {
  localStorage.removeItem("adminToken");
  window.location.href = "/frontend/Admin/admin-login.html";
}

// =====================
// RIPPLE EFFECT (NEW)
// =====================
document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const circle = document.createElement("span");
    circle.classList.add("ripple");

    const rect = this.getBoundingClientRect();
    circle.style.left = e.clientX - rect.left + "px";
    circle.style.top = e.clientY - rect.top + "px";

    this.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
  });
});

// =====================
// FLOAT LABEL LIVE FIX (🔥 MAIN FIX)
// =====================
document.querySelectorAll(".info-item input").forEach((input) => {
  input.addEventListener("input", function () {
    if (this.value.trim() !== "") {
      this.classList.add("filled");
    } else {
      this.classList.remove("filled");
    }
  });
});

// =====================
// INIT
// =====================
loadAdminProfile();
