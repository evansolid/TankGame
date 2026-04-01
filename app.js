let playerName = '';
let state = {};
const joinScreen = document.getElementById('joinScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const gameScreen = document.getElementById('gameScreen');
const playerList = document.getElementById('playerList');
const voteSelect = document.getElementById('voteSelect');
const passSelect = document.getElementById('passSelect');
const bombPassDiv = document.getElementById('bombPassDiv');
const turnNum = document.getElementById('turnNum');
const statusDiv = document.getElementById('status');
const logDiv = document.getElementById('log');
const startBtn = document.getElementById('startBtn');

const API = 'http://tank.evansolid.com';

document.getElementById('joinBtn').onclick = async () => {
    playerName = document.getElementById('nameInput').value.trim();
    if (!playerName) return alert('Enter a name');
    const res = await fetch(`${API}/join`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: playerName })
    });
    const data = await res.json();
    if (data.error) return alert(data.error);
    state = data.state;
    joinScreen.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');
    updateLobby();
};

startBtn.onclick = async () => {
    const res = await fetch(`${API}/start`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: playerName })
    });
    const data = await res.json();
    if (data.error) return alert(data.error);
    state = data.state;
    lobbyScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    updateGame();
};

document.getElementById('submitBtn').onclick = async () => {
    const vote = voteSelect.value;
    const bombPass = state.players.find(p => p.name === playerName).hasBomb ? passSelect.value : null;
    if (!vote || (state.players.find(p => p.name === playerName).hasBomb && !bombPass)) return alert('Select options');
    const res = await fetch(`${API}/submit`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: playerName, vote, bombPass })
    });
    const data = await res.json();
    state = data.state;
    updateGame();
};

async function pollState() {
    const res = await fetch(`${API}/state`);
    const data = await res.json();
    state = data.state;
    if (state.gameStarted) {
        joinScreen.classList.add('hidden');
        lobbyScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
    } else if (state.players.find(p => p.name === playerName)) {
        joinScreen.classList.add('hidden');
        lobbyScreen.classList.remove('hidden');
    }
    updateLobby();
    updateGame();
}

function updateLobby() {
    playerList.innerHTML = '';
    state.players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.name;
        playerList.appendChild(li);
    });
    startBtn.style.display = (state.firstPlayer === playerName && !state.gameStarted) ? 'inline' : 'none';
}

function updateGame() {
    const me = state.players.find(p => p.name === playerName);
    if (!me) return;
    turnNum.textContent = state.turn;
    statusDiv.textContent = me.alive ? (me.hasBomb ? 'You have the bomb!' : 'Alive') : 'Dead';
    voteSelect.innerHTML = '';
    passSelect.innerHTML = '';
    state.players.filter(p => p.alive && p.name !== playerName).forEach(p => {
        const option = document.createElement('option');
        option.value = p.name;
        option.textContent = p.name;
        voteSelect.appendChild(option);
        passSelect.appendChild(option.cloneNode(true));
    });
    bombPassDiv.style.display = me.hasBomb ? 'block' : 'none';

    logDiv.innerHTML = state.log.map(entry => `<div>${entry}</div>`).join('');
}

setInterval(pollState, 1000);
