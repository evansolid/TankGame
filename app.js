const API = "http://tank.evansolid.com"; // replace with your domain
let myName = null;

function join() {
  myName = document.getElementById("name").value;
  if (!myName) return alert("Enter a name");

  fetch(API + "/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: myName }) })
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
  fetch(API + "/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: myName }) });
}

function submitTurn() {
  const vote = document.querySelector('input[name="vote"]:checked')?.value;
  const pass = document.querySelector('input[name="pass"]:checked')?.value;
  fetch(API + "/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: myName, vote, bombPass: pass }) });
}

function resetGame() {
  fetch(API + "/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: "1234" }) });
}

function poll() {
  setInterval(async () => {
    const res = await fetch(API + "/state?name=" + myName);
    const state = await res.json();

    if (state.phase === "lobby") {
      document.getElementById("lobbyScreen").style.display = "block";
      document.getElementById("gameScreen").style.display = "none";
    } else {
      document.getElementById("lobbyScreen").style.display = "none";
      document.getElementById("gameScreen").style.display = "block";

      document.getElementById("turnInfo").innerText = `Turn ${state.turn}`;
      const voteDiv = document.getElementById("voteButtons");
      voteDiv.innerHTML = "";
      const passDiv = document.getElementById("passButtons");
      passDiv.innerHTML = "";
      if (state.phase === "playing") {
        state.players.forEach(p => {
          if (p.alive) {
            const voteBtn = document.createElement("label");
            voteBtn.innerHTML = `<input type="radio" name="vote" value="${p.name}"> ${p.name}`;
            voteDiv.appendChild(voteBtn);

            if (state.players.find(me => me.name === myName).hasBomb) {
              const passBtn = document.createElement("label");
              passBtn.innerHTML = `<input type="radio" name="pass" value="${p.name}"> ${p.name}`;
              passDiv.appendChild(passBtn);
            }
          }
        });
        passDiv.style.display = state.players.find(me => me.name === myName).hasBomb ? "block" : "none";
        document.getElementById("passTitle").style.display = state.players.find(me => me.name === myName).hasBomb ? "block" : "none";
      }

      document.getElementById("playerList").innerHTML = "";
      state.players.forEach(p => {
        const li = document.createElement("li");
        li.innerText = `${p.name} ${p.alive ? "" : "(dead)"}`;
        document.getElementById("playerList").appendChild(li);
      });

      document.getElementById("gameLog").innerHTML = state.log.join("<br>");
    }
  }, 1000);
}
