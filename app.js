const API = "https://tank.evansolid.com"; // replace with your server domain
let myName = null;

function join() {
  myName = document.getElementById("name").value;
  if (!myName) return alert("Enter a name");

  fetch(`${API}/join`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: myName }) })
    .then(res => res.json())
    .then(() => {
      document.getElementById("joinScreen").style.display = "none";
      document.getElementById("lobbyScreen").style.display = "block";
      document.getElementById("myName").innerText = myName;
      document.getElementById("myNameGame").innerText = myName;
      poll();
    });
}

function startGame() {
  fetch(`${API}/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: myName }) });
}

function submitTurn() {
  const vote = document.querySelector('input[name="vote"]:checked')?.value;
  const pass = document.querySelector('input[name="pass"]:checked')?.value;
  fetch(`${API}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: myName, vote, bombPass: pass }) });
}

function resetGame() {
  fetch(`${API}/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: "1234" }) });
}

function poll() {
  setInterval(async () => {
    const res = await fetch(`${API}/state?name=${myName}`);
    const state = await res.json();
    const me = state.players.find(p => p.name === myName);

    document.getElementById("playerCount").innerText = state.players.length;

    if (state.phase === "lobby") {
      document.getElementById("lobbyScreen").style.display = "block";
      document.getElementById("gameScreen").style.display = "none";
    } else {
      document.getElementById("lobbyScreen").style.display = "none";
      document.getElementById("gameScreen").style.display = "block";

      document.getElementById("turnInfo").innerText = `Turn ${state.turn}`;
      document.getElementById("votedCount").innerText = state.votedCount;

      // Save current selection
      const currentVote = document.querySelector('input[name="vote"]:checked')?.value;
      const currentPass = document.querySelector('input[name="pass"]:checked')?.value;

      const voteDiv = document.getElementById("voteButtons");
      voteDiv.innerHTML = "";
      const passDiv = document.getElementById("passButtons");
      passDiv.innerHTML = "";

      state.players.forEach(p => {
        if (!p.alive) return;
        if (me.hasBomb) {
          const passBtn = document.createElement("label");
          passBtn.innerHTML = `<input type="radio" name="pass" value="${p.name}" ${currentPass === p.name ? "checked" : ""}> ${p.name}`;
          passDiv.appendChild(passBtn);
        } else {
          const voteBtn = document.createElement("label");
          voteBtn.innerHTML = `<input type="radio" name="vote" value="${p.name}" ${currentVote === p.name ? "checked" : ""}> ${p.name}`;
          voteDiv.appendChild(voteBtn);
        }
      });

      document.getElementById("voteSection").style.display = me.hasBomb ? "none" : "block";
      document.getElementById("passSection").style.display = me.hasBomb ? "block" : "none";

      document.getElementById("playerList").innerHTML = "";
      state.players.forEach(p => {
        const li = document.createElement("li");
        li.innerText = `${p.name} ${p.alive ? "" : "(dead)"}${p.hasBomb ? " 💣" : ""}`;
        document.getElementById("playerList").appendChild(li);
      });

      document.getElementById("gameLog").innerHTML = state.log.join("<br>");
    }
  }, 1000);
}
