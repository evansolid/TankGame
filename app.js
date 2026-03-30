const API = "https://tank.yourdomain.com"; // point to your Pi backend

let playerId = null;
let canvas, ctx;

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

  document.getElementById("lobby").style.display = "none";
  document.getElementById("game").style.display = "block";

  pollState();
}

async function sendMove() {
  const angle = Number(document.getElementById("angle").value);
  const power = Number(document.getElementById("power").value);

  await fetch(API + "/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: playerId, angle, power })
  });
}

function pollState() {
  setInterval(async () => {
    const res = await fetch(API + "/state");
    const data = await res.json();
    document.getElementById("status").innerText =
      `Turn: ${data.turn}, Phase: ${data.phase}, Moves: ${data.movesSubmitted}/${data.players.length}`;
    drawGame(data);
  }, 1000);
}

function drawGame(state) {
  ctx.clearRect(0, 0, state.mapWidth, state.mapHeight);

  // draw tanks
  state.players.forEach(p => {
    ctx.fillStyle = "green";
    ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
    ctx.fillStyle = "black";
    ctx.fillText(`${p.name} (${Math.max(0, Math.floor(p.health))})`, p.x - 15, p.y - 15);
  });
}
