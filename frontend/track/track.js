/* ======================
<<<<<<< HEAD
=======
   SOCKET CONNECT
====================== */
if (!window.socket) {
  window.socket = io("http://localhost:5000");
}
const socket = window.socket;
/* ======================
>>>>>>> 683ad22 (what you changed)
   MAP INIT
====================== */
const map = L.map("map").setView([22.3656, 91.8086], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© SIMON",
}).addTo(map);

/* ======================
   ICONS
====================== */
const busIcon = L.divIcon({
  html: `<div style="width:40px;height:40px;background:#ff9800;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:2px solid white;">🚌</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const userIcon = L.divIcon({
  html: `<div style="width:34px;height:34px;background:#00c853;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;">🧍</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

/* ======================
   STATE
====================== */
const busMarkers = {};
let selectedBus = null;
let busMarker = null;
let userMarker = null;
let routeLine = null;
let lastUserLatLng = null;

/* ======================
   DEMO BUS ROUTES
====================== */
const demoRoutes = {
  bus01: [
    [22.3656, 91.8086],
    [22.3672, 91.8120],
    [22.3690, 91.8160],
    [22.3710, 91.8200]
  ],
  bus02: [
    [22.3600, 91.8050],
    [22.3620, 91.8090],
    [22.3645, 91.8140]
  ]
};

const routeIndex = {};

/* ======================
   BUS SELECT
====================== */
<<<<<<< HEAD
document.getElementById("busSelect").addEventListener("change", e => {
  selectedBus = e.target.value;
=======
document.getElementById("busSelect").addEventListener("change", (e) => {
  selectedBus = e.target.value.trim().toLowerCase();
>>>>>>> 683ad22 (what you changed)
  document.getElementById("busNo").innerText = selectedBus.toUpperCase();

  if (busMarkers[selectedBus]) {
    busMarker = busMarkers[selectedBus];
    updateStatus("Live", "limegreen");
    updateRoute();
  } else {
    updateStatus("Offline", "red");
  }
});

/* ======================
   START DEMO BUSES
====================== */
<<<<<<< HEAD
Object.keys(demoRoutes).forEach(busNo => {
  routeIndex[busNo] = 0;

  const [lat, lng] = demoRoutes[busNo][0];
=======
socket.on("busLocationUpdate", (data) => {
  if (!data || !data.busNo) return;

  const busNo = data.busNo.trim().toLowerCase();
  const { lat, lng } = data;
>>>>>>> 683ad22 (what you changed)

  busMarkers[busNo] = L.marker([lat, lng], { icon: busIcon })
    .addTo(map)
    .bindPopup(`🚌 ${busNo.toUpperCase()}`);

  setInterval(() => moveBus(busNo), 2000);
});

/* ======================
   MOVE BUS
====================== */
function moveBus(busNo) {
  const route = demoRoutes[busNo];
  routeIndex[busNo] = (routeIndex[busNo] + 1) % route.length;

  const [lat, lng] = route[routeIndex[busNo]];
  slideMarker(busMarkers[busNo], L.latLng(lat, lng));

  if (busNo === selectedBus) {
    busMarker = busMarkers[busNo];
    updateRoute();
  }
<<<<<<< HEAD
}
=======
});

/* ======================
   BUS OFFLINE (FADE ADDED)
====================== */
socket.on("busOfflineUpdate", (data) => {
  if (!data || !data.busNo) return;

  const busNo = data.busNo.trim().toLowerCase();

  if (busMarkers[busNo]) {
    fadeOutMarker(busMarkers[busNo]);
    delete busMarkers[busNo];
  }

  if (busNo === selectedBus) {
    busMarker = null;
    if (routeLine) map.removeLayer(routeLine);
    document.getElementById("distance").innerText = "--";
    updateStatus("Offline", "red");
  }
});
>>>>>>> 683ad22 (what you changed)

/* ======================
   USER LOCATION
====================== */
if ("geolocation" in navigator) {
<<<<<<< HEAD
  navigator.geolocation.watchPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    lastUserLatLng = [lat, lng];
=======
  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      lastUserLatLng = [lat, lng];
>>>>>>> 683ad22 (what you changed)

    if (!userMarker) {
      userMarker = L.marker([lat, lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("📍 You");
    } else {
      slideUserMarker(userMarker, L.latLng(lat, lng));
    }

<<<<<<< HEAD
    updateRoute();
  });
=======
      updateRoute();
    },
    () => alert("Location permission denied"),
    { enableHighAccuracy: true },
  );
>>>>>>> 683ad22 (what you changed)
}

/* ======================
   MY LOCATION BUTTON
====================== */
document.getElementById("myLocationBtn").addEventListener("click", () => {
  if (lastUserLatLng) map.setView(lastUserLatLng, 16);
});

/* ======================
   ROUTE + ETA
====================== */
async function getRoadRoute(start, end) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes?.length) return null;

  return {
    coords: data.routes[0].geometry.coordinates,
<<<<<<< HEAD
    distance: data.routes[0].distance
=======
    distance: data.routes[0].distance, // meters
>>>>>>> 683ad22 (what you changed)
  };
}

async function updateRoute() {
  if (!userMarker || !busMarker) return;

  if (routeLine) map.removeLayer(routeLine);

  const route = await getRoadRoute(
    userMarker.getLatLng(),
    busMarker.getLatLng(),
  );

  if (!route) return;

<<<<<<< HEAD
  const latlngs = route.coords.map(c => [c[1], c[0]]);
  routeLine = L.polyline(latlngs, {
    color: "#00e676",
    weight: 5
=======
  const latlngs = route.coords.map((c) => [c[1], c[0]]);

  // 🛣️ draw route
  routeLine = L.polyline(latlngs, {
    color: "#00e676",
    weight: 5,
    smoothFactor: 1,
>>>>>>> 683ad22 (what you changed)
  }).addTo(map);

  const km = route.distance / 1000;
  const eta = Math.round(route.distance / (30 * 1000 / 3600) / 60);

  document.getElementById("distance").innerText =
    `${km.toFixed(2)} km | ⏱ ${eta} min`;
}

/* ======================
   ANIMATIONS
====================== */
function slideMarker(marker, newLatLng, duration = 1000) {
  const start = marker.getLatLng();
  const startTime = performance.now();

  function animate(t) {
    const p = Math.min((t - startTime) / duration, 1);
    marker.setLatLng([
      start.lat + (newLatLng.lat - start.lat) * p,
      start.lng + (newLatLng.lng - start.lng) * p,
    ]);
    if (p < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function slideUserMarker(marker, newLatLng, duration = 800) {
<<<<<<< HEAD
  slideMarker(marker, newLatLng, duration);
}

/* ======================
   STATUS
=======
  const start = marker.getLatLng();
  const startTime = performance.now();

  function animate(time) {
    const p = Math.min((time - startTime) / duration, 1);
    marker.setLatLng([
      start.lat + (newLatLng.lat - start.lat) * p,
      start.lng + (newLatLng.lng - start.lng) * p,
    ]);
    if (p < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/* ======================
   OFFLINE FADE ANIMATION (ADDED)
====================== */
function fadeOutMarker(marker, duration = 800) {
  let opacity = 1;
  const step = 50;
  const delta = step / duration;

  const interval = setInterval(() => {
    opacity -= delta;
    if (opacity <= 0) {
      clearInterval(interval);
      map.removeLayer(marker);
    } else {
      marker.setOpacity(opacity);
    }
  }, step);
}

/* ======================
   AUTO ZOOM
====================== */
function autoZoomToBusAndUser() {
  if (!busMarker || !userMarker) return;

  const group = L.featureGroup([busMarker, userMarker]);
  map.fitBounds(group.getBounds(), {
    padding: [60, 60],
    animate: true,
  });
}

/* ======================
   STATUS UPDATE
>>>>>>> 683ad22 (what you changed)
====================== */
function updateStatus(text, color) {
  const el = document.getElementById("status");
  el.innerText = text;
  el.style.color = color;
}

async function loadInitialBuses() {
  try {
    const res = await fetch("http://localhost:5000/api/admin/buses");
    const buses = await res.json();

    buses.forEach((b) => {
      if (b.status !== "online") return;

      const busNo = b.busNo.trim().toLowerCase();

      const marker = L.marker([b.lat, b.lng], { icon: busIcon })
        .addTo(map)
        .bindPopup(`🚌 ${busNo.toUpperCase()}`);

      busMarkers[busNo] = marker;

      // 🔥 ADD THIS PART (IMPORTANT)
      if (busNo === selectedBus) {
        busMarker = marker;
        updateStatus("Live", "limegreen");
        updateRoute();
      }
    });

    console.log("✅ Initial buses loaded");
  } catch (err) {
    console.log("❌ Failed to load initial buses");
  }
}

loadInitialBuses();
