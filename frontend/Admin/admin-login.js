// =====================
// POPUP CONTROL (UPDATED)
// =====================
function showPopup(message) {
  const popup = document.getElementById("popup");
  const msg = document.getElementById("popupMsg");

  msg.innerText = message;

  popup.style.display = "flex";

  // animation trigger
  setTimeout(() => {
    popup.classList.add("active");
  }, 10);
}

function closePopup() {
  const popup = document.getElementById("popup");

  popup.classList.remove("active");

  setTimeout(() => {
    popup.style.display = "none";
  }, 200);
}

// =====================
// FORM SUBMIT
// =====================
function handleLogin(e) {
  e.preventDefault();

  const identifier = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!identifier || !password) {
    showPopup("Please fill all fields");
    return;
  }

  adminLogin();
}

// =====================
// ADMIN LOGIN API
// =====================
async function adminLogin() {
  const identifier = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!identifier || !password) {
    showPopup("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    // ❌ LOGIN FAIL
    if (!res.ok) {
      showPopup(data.message || "Login failed ❌");
      return;
    }

    // ✅ SAVE TOKEN
    localStorage.setItem("adminToken", data.token);

    showPopup("Welcome Admin 🎉");

    // redirect after popup animation
    setTimeout(() => {
      window.location.href = "/frontend/Admin/admin-profile.html";
    }, 1200);
  } catch (err) {
    console.error(err);
    showPopup("Server error ❌");
  }
}
