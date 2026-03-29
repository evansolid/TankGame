const socket = io("https://nose-charitable-charts-graphs.trycloudflare.com");

socket.on("connect", () => console.log("Connected:", socket.id));

document.getElementById("fire").onclick = () => {
    const angle = document.getElementById("angle").value;
    const power = document.getElementById("power").value;
    socket.emit("fire", { angle, power });
};
