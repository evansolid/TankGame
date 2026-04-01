const API = "https://tank.evansolid.com";

let playerId = null;
let selectedVote = null;
let selectedPass = null;

async function join() {
  const name = document.getElementById("name").value;

  const res = await fetch(API + "/join", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name })
  });

  const data = await res.json();
  playerId = data.id;

  poll();
}

async function start() {
  await fetch(API + "/start", { method: "POST" });
}

async function submitTurn() {
  await fetch(API + "/submit", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      id: playerId,
      vote: selectedVote,
      pass: selectedPass
    })
  });

  selectedVote = null;
  selectedPass = null;
}

async function reset() {
  const key = prompt("Admin key:");
  await fetch(API + "/reset", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ key })
  });
}

// -------- UI UPDATE --------

function updateUI(state) {
  const lobby = document.getElementById("lobby");
  const game = document.getElementById("game");

  // player list
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  state.players.forEach(p => {
    const li = document.createElement("li");
    li.innerText = p.name + (p.alive ? "" : " (dead)");
    list.appendChild(li);
  });

  if (state.phase === "lobby") {
    lobby.style.display = "block";
    game.style.display = "none";
    return;
  }

  lobby.style.display = "none";
  game.style.display = "block";

  document.getElementById("info").innerText =
    `Turn ${state.turn} | Bomb: ${state.bomb ? "YES" : "NO"} | Submitted: ${state.submitted}/${state.total}`;

  const actions = document.getElementById("actions");
  actions.innerHTML = "";

  state.players.filter(p => p.alive).forEach(p => {
    const div = document.createElement("div");

    const voteBtn = document.createElement("button");
    voteBtn.innerText = "Vote";
    voteBtn.onclick = () => selectedVote = p.id;

    div.innerText = p.name + " ";
    div.appendChild(voteBtn);

    if (state.bomb) {
      const passBtn = document.createElement("button");
      passBtn.innerText = "Pass Bomb";
      passBtn.onclick = () => selectedPass = p.id;
      div.appendChild(passBtn);
    }

    actions.appendChild(div);
  });

  const logDiv = document.getElementById("log");
  logDiv.innerHTML = state.log.join("<br>");
}

// -------- POLLING --------

function poll() {
  setInterval(async () => {
    const res = await fetch(API + "/state?playerId=" + playerId);
    const state = await res.json();
    updateUI(state);
  }, 1000);
}
