const token = localStorage.getItem("adminToken");

if (!token) {
  alert("Unauthorized! Please login");
  window.location.href = "/frontend/Admin/admin-login.html";
}

// =====================
// ELEMENTS
// =====================
const busTable = document.getElementById("busTable");
const modal = document.getElementById("historyModal");
const historyList = document.getElementById("historyList");
const modalTitle = document.getElementById("modalTitle");

// =====================
// LOAD BUS TABLE (REAL DATA)
// =====================
async function loadTable() {
  busTable.innerHTML = "";

  try {
    const res = await fetch("http://localhost:5000/api/admin/buses", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const buses = await res.json();

    buses.forEach(b => {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";

      tr.onclick = () => openHistory(b.busNo);

tr.innerHTML = `
  <td>${b.busNo}</td>
  <td>${b.driverName || "Not Assigned"}</td>
  <td>${b.driverUsername || "---"}</td>
  <td>
    <span class="status ${b.status === "online" ? "live" : "offline"}">
      ${b.status}
    </span>
  </td>
  <td>
    ${b.lastUpdate ? new Date(b.lastUpdate).toLocaleString() : "-"}
  </td>
`;


      busTable.appendChild(tr);
    });

  } catch (err) {
    console.error("Failed to load buses", err);
    busTable.innerHTML = "<tr><td colspan='5'>Failed to load data</td></tr>";
  }
}

// =====================
// OPEN HISTORY MODAL (REAL DATA)
// =====================
async function openHistory(busNo) {
  modal.style.display = "flex";
  modalTitle.innerText = `${busNo} - Today History`;
  historyList.innerHTML = "<p>Loading history...</p>";

  try {
    const res = await fetch(
      `http://localhost:5000/api/admin/bus/${busNo}/history`,
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    const logs = await res.json();
    historyList.innerHTML = "";

    if (!logs.length) {
      historyList.innerHTML = "<p>No activity found</p>";
      return;
    }

    logs.forEach(log => {
      const div = document.createElement("div");
      div.className = "history-item";

      div.innerHTML = `
        <div class="time">
          ${new Date(log.time).toLocaleTimeString()}
        </div>
        <div class="info ${log.status === "online" ? "online" : "offline"}">
          ${log.status.toUpperCase()}
        </div>
      `;

      historyList.appendChild(div);
    });

  } catch (err) {
    console.error("Failed to load history", err);
    historyList.innerHTML = "<p>Error loading history</p>";
  }
}

// =====================
// CLOSE MODAL
// =====================
function closeModal() {
  modal.style.display = "none";
}

// =====================
// INIT
// =====================
loadTable();
