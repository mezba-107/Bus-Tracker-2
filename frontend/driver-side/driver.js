/* ================= AUTH CHECK ================= */
if (localStorage.getItem("driverAuth") !== "true") {
  window.location.href = "/frontend/driver-side/driver-login.html";
}

/* ================= BASE URL ================= */
const BASE_URL = "http://localhost:5000";

/* ================= SOCKET CONNECT ================= */
const socket = io(BASE_URL, {
  transports: ["websocket"],
});

/* ================= VARIABLES ================= */
let watchId = null;

/* ================= DOM ELEMENTS ================= */
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusBadge = document.getElementById("status");
const busSelect = document.getElementById("busNo");

/* ================= PROFILE ELEMENTS ================= */
const driverNameText = document.getElementById("driverName");
const driverIdText = document.getElementById("driverId");

const modalName = document.getElementById("mName");
const modalId = document.getElementById("mId");
const modalMobile = document.getElementById("mMobile");
const modalAddress = document.getElementById("mAddress");

/* ================= STATUS HELPERS ================= */
function setStatusOnline() {
  statusBadge.innerText = "Live";
  statusBadge.classList.remove("offline");
  statusBadge.classList.add("online");
}

function setStatusOffline() {
  statusBadge.innerText = "Offline";
  statusBadge.classList.remove("online");
  statusBadge.classList.add("offline");
}

/* ======================================================
   LOAD DRIVER PROFILE INFO FROM BACKEND
====================================================== */
async function loadDriverProfile() {
  try {
    const driverId = localStorage.getItem("driverId");

    if (!driverId) {
      console.log("❌ driverId not found in localStorage");
      return;
    }

    const res = await fetch(`${BASE_URL}/api/drivers/${driverId}`);

    if (!res.ok) {
      console.log("❌ Driver not found");
      return;
    }

    const driver = await res.json();

    driverNameText.innerText = "Driver: " + (driver.name || "N/A");
    driverIdText.innerText = "ID: " + (driver.username || "N/A");

    modalName.innerText = driver.name || "Not Added";
    modalId.innerText = driver.username || "Not Added";
    modalMobile.innerText = driver.mobile || "Not Added";
    modalAddress.innerText = driver.address || "Not Added";

    console.log("✅ Profile Loaded Successfully");
  } catch (err) {
    console.log("❌ Error loading profile:", err);
  }
}

loadDriverProfile();

/* ======================================================
   START SHARING LOCATION
====================================================== */
startBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("❌ GPS not supported on this device");
    return;
  }

  if (watchId !== null) return;

  setStatusOnline();
  startBtn.disabled = true;
  stopBtn.disabled = false;

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const data = {
        busNo: busSelect.value,
        driverId: localStorage.getItem("driverId"),
        driverName: localStorage.getItem("driverName"),
        driverUsername: localStorage.getItem("driverUsername"),
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        time: Date.now(),
      };

      socket.emit("busLocation", data);
      console.log("📤 Location Sent:", data);
    },
    () => {
      alert("❌ Location access denied!");
      stopSharing();
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 8000,
    },
  );
});

/* ======================================================
   STOP SHARING LOCATION
====================================================== */
function stopSharing() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  socket.emit("busOffline", {
    busNo: busSelect.value,
  });

  setStatusOffline();
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

stopBtn.addEventListener("click", stopSharing);

/* ======================================================
   SOCKET STATUS
====================================================== */
socket.on("connect", () => {
  console.log("✅ Connected to server");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
  stopSharing();
});

/* ======================================================
   PROFILE MODAL
====================================================== */
function openProfile() {
  loadDriverProfile();
  document.getElementById("profileModal").style.display = "flex";
}

function closeProfile() {
  document.getElementById("profileModal").style.display = "none";
}

/* ======================================================
   LOGOUT
====================================================== */
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.onclick = function () {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  socket.emit("busOffline", {
    busNo: busSelect.value,
  });

  localStorage.removeItem("driverAuth");
  localStorage.removeItem("driverId");
  localStorage.removeItem("driverUsername");
  localStorage.removeItem("driverName");

  window.location.href = "/frontend/driver-side/driver-login.html";
};

/* ================= NOTICE SYSTEM ================= */

async function loadNotices(autoPopup = false) {
  try {
    const driverId = localStorage.getItem("driverId");

    const res = await fetch(`${BASE_URL}/api/admin/notices/${driverId}`);
    const notices = await res.json();

    const list = document.getElementById("noticeList");
    const badge = document.getElementById("noticeBadge");

    list.innerHTML = "";

    if (notices.length === 0) {
      list.innerHTML = "<p>No notices</p>";
      badge.style.display = "none";
      return;
    }

    const unseen = notices.filter((n) => !n.seen);

    badge.innerText = unseen.length;
    badge.style.display = unseen.length ? "block" : "none";

    if (autoPopup && unseen.length > 0) {
      document.getElementById("noticeModal").style.display = "flex";
    }

    // 🔥 SORT: Unseen আগে, তারপর date অনুযায়ী
    notices
      .sort((a, b) => {
        if (a.seen === b.seen) {
          return new Date(b.time) - new Date(a.time); // latest first
        }
        return a.seen ? 1 : -1; // unseen আগে
      })

      .forEach((n) => {
        const div = document.createElement("div");

        div.className = "notice-item " + (n.seen ? "seen" : "unseen");

        div.innerHTML = `
        <p>${n.message.replace(/^x\s*/i, "")}</p>
        <span>${new Date(n.time).toLocaleString()}</span>
        ${
          !n.seen
            ? `<button class="seen-btn" data-id="${n._id}">Seen</button>`
            : `<small style="opacity:0.6;">✔ Seen</small>`
        }
      `;

        list.appendChild(div);
      });
  } catch (err) {
    console.log("❌ Notice load error", err);
  }
}

/* ================= OPEN ================= */
async function openNotice() {
  document.getElementById("noticeModal").style.display = "flex";
  await loadNotices();

  // ❌ FIX: removed auto mark seen API

  document.getElementById("noticeBadge").style.display = "none";
}

/* ================= CLOSE ================= */
function closeNotice() {
  document.getElementById("noticeModal").style.display = "none";
  // 🔥 ADD THIS LINE
  loadNotices();
}

/* ================= FIRST LOAD ================= */
loadNotices(true);

/* ================= CLICK HANDLER ================= */
const noticeList = document.getElementById("noticeList");

noticeList.addEventListener("click", async (e) => {
  if (e.target.classList.contains("seen-btn")) {
    const noticeId = e.target.dataset.id;

    console.log("CLICKED:", noticeId);

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/notices/seen-single/${noticeId}`,
        {
          method: "PUT",
        },
      );

      if (!res.ok) {
        console.log("❌ Failed request");
        return;
      }

      e.target.innerText = "✔ Seen";
      e.target.disabled = true;

      // 🔥 UI update
      const item = e.target.closest(".notice-item");
      item.classList.remove("unseen");
      item.classList.add("seen");

      // 🔥🔥 COUNT FIX (ONLY ADD THIS PART)
      const badge = document.getElementById("noticeBadge");

      let current = parseInt(badge.innerText) || 0;
      current = current - 1;

      if (current <= 0) {
        badge.style.display = "none";
      } else {
        badge.innerText = current;
      }
    } catch (err) {
      console.log("Seen error:", err);
    }
  }
});
