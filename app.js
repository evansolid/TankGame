const API = "https://tank.evansolid.com";

let playerId = null;
let canvas, ctx;
let terrain = [];

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
