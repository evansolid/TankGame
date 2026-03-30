const API = "https://tank.evansolid.com";

let playerId = null;
let canvas, ctx;
let terrain = [];

let dragging = false;
let dragStart = { x: 0, y: 0 };
let angleInput = document.getElementById("angle");
let powerInput = document.getElementById("power");

// Mouse / touch events for dragging
canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  dragStart = { x: e.offsetX, y: e.offsetY };
});
canvas.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const dx = e.offsetX - dragStart.x;
  const dy = dragStart.y - e.offsetY; // inverted Y for screen
  const angle = Math.min(Math.max(Math.atan2(dy, dx) * 180/Math.PI, 0), 180);
  const power = Math.min(Math.sqrt(dx*dx + dy*dy)/10, 10);
  angleInput.value = angle.toFixed(0);
  powerInput.value = power.toFixed(1);
});
canvas.addEventListener("mouseup", () => { dragging = false; });

// Touch events for mobile
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dragging = true;
  const t = e.touches[0];
  dragStart = { x: t.clientX - canvas.offsetLeft, y: t.clientY - canvas.offsetTop };
});
canvas.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  const t = e.touches[0];
  const dx = t.clientX - canvas.offsetLeft - dragStart.x;
  const dy = dragStart.y - (t.clientY - canvas.offsetTop);
  const angle = Math.min(Math.max(Math.atan2(dy, dx) * 180/Math.PI, 0), 180);
  const power = Math.min(Math.sqrt(dx*dx + dy*dy)/10, 10);
  angleInput.value = angle.toFixed(0);
  powerInput.value = power.toFixed(1);
});
canvas.addEventListener("touchend", () => { dragging = false; });

// Keyboard control
window.addEventListener("keydown", (e) => {
  let angle = Number(angleInput.value);
  let power = Number(powerInput.value);
  switch(e.key) {
    case "ArrowUp": power = Math.min(power+0.2, 10); break;
    case "ArrowDown": power = Math.max(power-0.2, 1); break;
    case "ArrowLeft": angle = Math.max(angle-2, 0); break;
    case "ArrowRight": angle = Math.min(angle+2, 180); break;
  }
  angleInput.value = angle.toFixed(0);
  powerInput.value = power.toFixed(1);
});

window.onload = () => {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
};

async function join() {
  const name = document.getElementById("name").value;
  const res = await fetch(API + "/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  playerId = data.id;
  terrain = data.terrain;

  document.getElementById("lobby").style.display = "none";
  document.getElementById("game").style.display = "block";

  pollState();
}

async function sendMove() {
  const type = document.getElementById("type").value;
  const angle = Number(document.getElementById("angle").value);
  const power = Number(document.getElementById("power").value);

  await fetch(API + "/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: playerId, type, angle, power })
  });
}

async function resetServer() {
  await fetch(API + "/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "mysecret" })
  });
}

async function kickPlayer(id) {
  await fetch(API + "/kick", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "mysecret", id })
  });
}

function pollState() {
  setInterval(async () => {
    const res = await fetch(API + "/state");
    const state = await res.json();
    document.getElementById("status").innerText =
      `Turn: ${state.turn}, Phase: ${state.phase}, Moves: ${state.movesSubmitted}/${state.players.length}`;

    drawGame(state);
  }, 50);
}

function drawGame(state) {
  ctx.clearRect(0, 0, state.mapWidth, state.mapHeight);

  // Draw terrain
  ctx.fillStyle = "#964B00";
  ctx.beginPath();
  ctx.moveTo(0, state.mapHeight);
  for (let x = 0; x < state.mapWidth; x++) {
    ctx.lineTo(x, state.terrain[x]);
  }
  ctx.lineTo(state.mapWidth, state.mapHeight);
  ctx.fill();

  // Draw tanks
  state.players.forEach(p => {
    ctx.fillStyle = "green";
    ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
    ctx.fillStyle = "black";
    ctx.fillText(`${p.name} (${Math.max(0, Math.floor(p.health))})`, p.x - 15, p.y - 15);
  });

  // Draw projectiles
  state.projectiles.forEach(p => {
    ctx.fillStyle = (p.type === "big") ? "red" : "blue";
    ctx.beginPath();
    ctx.arc(p.x, p.y, (p.type === "big") ? 8 : 5, 0, 2*Math.PI);
    ctx.fill();
  });
}
