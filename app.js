const API = "https://tank.yourdomain.com";

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

  document.getElementById("joinScreen").style.display = "none";
  document.getElementById("lobbyScreen").style.display = "block";

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
  await fetch(API + "/reset", { method: "POST" });
}

function updateUI(state) {
  // update player list
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  state.players.forEach(p => {
    const li = document.createElement("li");
    li.innerText = p.name + (p.alive ? "" : " (dead)");
    list.appendChild(li);
  });

  // lobby vs game
  if (state.phase === "lobby") {
    document.getElementById("lobbyScreen").style.display = "block";
    document.getElementById("gameScreen").style.display = "none";
    return;
  }

  document.getElementById("lobbyScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";

  document.getElementById("info").innerText =
    `Turn ${state.turn} | You have bomb: ${state.bomb}`;

  // voting
  const voteList = document.getElementById("voteList");
  voteList.innerHTML = "";

  state.players.filter(p => p.alive).forEach(p => {
    const btn = document.createElement("button");
    btn.innerText = p.name;
    btn.onclick = () => selectedVote = p.id;
    voteList.appendChild(btn);
  });

  // pass
  const passList = document.getElementById("passList");
  passList.innerHTML = "";

  if (state.bomb) {
    document.getElementById("passTitle").style.display = "block";
    state.players.filter(p => p.alive).forEach(p => {
      const btn = document.createElement("button");
      btn.innerText = p.name;
      btn.onclick = () => selectedPass = p.id;
      passList.appendChild(btn);
    });
  } else {
    document.getElementById("passTitle").style.display = "none";
  }

  // log
  document.getElementById("log").innerHTML =
    state.log.join("<br>");
}

function poll() {
  setInterval(async () => {
    const res = await fetch(API + "/state?playerId=" + playerId);
    const state = await res.json();
    updateUI(state);
  }, 1000);
}
