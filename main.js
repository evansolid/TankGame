const socket = io("https://nose-charitable-charts-graphs.trycloudflare.com");

socket.on("connect", () => console.log("Connected:", socket.id));

document.getElementById("fire").onclick = () => {
    const angle = document.getElementById("angle").value;
    const power = document.getElementById("power").value;
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    socket.emit("fire", { angle, power });
};
