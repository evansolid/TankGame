const API = 'https://tank.evansolid.com';

let playerId = null;
let selectedVote = null;
let selectedPass = null;

async function join() {
  const name = document.getElementById('name').value;
  const res = await fetch(API + '/join', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  if (!data.success) return alert(data.error);
  playerId = data.id;

  document.getElementById('playerName').innerText = `Player: ${name}`;
  document.getElementById('joinScreen').style.display = 'none';
  document.getElementById('lobbyScreen').style.display = 'block';

  poll();
}

async function start() {
  const res = await fetch(API + '/start', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: document.getElementById('name').value }) });
  const data = await res.json();
  if (!data.success) alert(data.error);
}

async function submitTurn() {
  if (!selectedVote) return alert('Select a player to vote.');
  const body = { id: playerId, vote: selectedVote };
  if (selectedPass) body.bombPass = selectedPass;

  await fetch(API + '/submit', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });

  selectedVote = null;
  selectedPass = null;
}

async function reset() {
  await fetch(API + '/reset', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ code: '1234' }) });
}

function updateUI(state) {
  const playersList = document.getElementById('playerList');
  const voteList = document.getElementById('voteList');
  const passList = document.getElementById('passList');

  playersList.innerHTML = '';
  voteList.innerHTML = '';
  passList.innerHTML = '';

  state.players.forEach(p => {
    const li = document.createElement('li');
    li.innerText = p.name + (p.alive ? '' : ' (dead)');
    playersList.appendChild(li);
  });

  if (state.phase === 'lobby') {
    document.getElementById('lobbyScreen').style.display = 'block';
    document.getElementById('gameScreen').style.display = 'none';
    return;
  }

  document.getElementById('lobbyScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';
  document.getElementById('info').innerText = `Turn ${state.turn} | Alive: ${state.alive} | You have bomb: ${state.bomb}`;

  // voting buttons
  state.players.filter(p => p.alive).forEach(p => {
    const btn = document.createElement('button');
    btn.innerText = p.name;
    btn.onclick = () => selectedVote = p.id;
    voteList.appendChild(btn);
  });

  // bomb pass buttons
  if (state.bomb) {
    document.getElementById('passTitle').style.display = 'block';
    state.players.filter(p => p.alive).forEach(p => {
      const btn = document.createElement('button');
      btn.innerText = p.name;
      btn.onclick = () => selectedPass = p.id;
      passList.appendChild(btn);
    });
  } else {
    document.getElementById('passTitle').style.display = 'none';
  }

  document.getElementById('log').innerHTML = state.log.join('<br>');
}

function poll() {
  setInterval(async () => {
    const res = await fetch(API + `/state?id=${playerId}`);
    const state = await res.json();
    updateUI(state);
  }, 1000);
}
