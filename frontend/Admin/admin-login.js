
function showPopup(message) {
  document.getElementById("popupMsg").innerText = message;
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}


async function adminLogin() {

  const identifier = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!identifier || !password) {
    showPopup("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ identifier, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showPopup(data.message || "Login failed");
      return;
    }

    localStorage.setItem("adminToken", data.token);

    // ✅ সুন্দর success popup
    showPopup("Welcome Admin 🎉");

    // ✅ popup দেখিয়ে redirect
    setTimeout(() => {
      window.location.href = "/frontend/Admin/admin-profile.html";
    }, 1200);

  } catch (err) {
    showPopup("Server error ❌");
    console.error(err);
  }
}
