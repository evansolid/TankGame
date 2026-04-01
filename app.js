const API = "https://tank.evansolid.com";

let playerId = null;

// Join
async function join() {
  const name = document.getElementById("name").value;
  const res = await fetch(API + "/join", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  playerId = data.id;

  document.getElementById("lobby").style.display = "none";
  document.getElementById("game").style.display = "block";

  poll();
}

// Start game
async function start() {
  await fetch(API + "/start", { method: "POST" });
}

// Vote
async function vote(target) {
  await fetch(API + "/vote", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ id: playerId, target })
  });
}

// Pass bomb
async function pass(target) {
  await fetch(API + "/pass", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ id: playerId, target })
  });
}

// Reset
async function reset() {
  const key = prompt("Admin key?");
  await fetch(API + "/reset", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ key })
  });
}

// Poll
function poll() {
  setInterval(async () => {
    const res = await fetch(API + "/state?playerId=" + playerId);
    const state = await res.json();

    document.getElementById("info").innerText =
      `Turn ${state.turn} | Phase: ${state.phase} | You have bomb: ${state.bomb}`;

    const div = document.getElementById("players");
    div.innerHTML = "";

    state.players.forEach(p => {
      if (!p.alive) return;

      const el = document.createElement("div");
      el.innerText = p.name;

      const voteBtn = document.createElement("button");
      voteBtn.innerText = "Vote";
      voteBtn.onclick = () => vote(p.id);

      const passBtn = document.createElement("button");
      passBtn.innerText = "Pass Bomb";
      passBtn.onclick = () => pass(p.id);

      el.appendChild(voteBtn);
      if (state.bomb) el.appendChild(passBtn);

      div.appendChild(el);
    });

  }, 1000);
}
