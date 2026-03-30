// Point this to your Pi backend
const API = "https://tank.yourdomain.com";

let playerId = null;

// Join game
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

// Send move
async function sendMove() {
  await fetch(API + "/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: playerId,
      angle: Math.random() * 90,
      power: Math.random()
    })
  });
}

// Poll server for game state
function pollState() {
  setInterval(async () => {
    const res = await fetch(API + "/state");
    const data = await res.json();

    document.getElementById("status").innerText =
      `Turn: ${data.turn}, Phase: ${data.phase}, Moves submitted: ${data.movesSubmitted}/${data.players.length}`;
  }, 1000);
}
