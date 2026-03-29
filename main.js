const socket = io("http://192.168.0.8:3000");

let myId;
let players = {};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

socket.on("init", (data) => {
    myId = data.id;
    players = data.players;
    draw();
});

socket.on("playerJoined", (data) => {
    players[data.id] = data.player;
});

socket.on("playerLeft", (id) => {
    delete players[id];
});

socket.on("turnResult", (updatedPlayers) => {
    players = updatedPlayers;
    draw();
});

function sendAction() {
    const angle = parseFloat(document.getElementById("angle").value);
    const power = parseFloat(document.getElementById("power").value);

    socket.emit("submitAction", { angle, power });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in players) {
        let p = players[id];

        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = (id === myId) ? "blue" : "red";
        ctx.fill();
    }
}
