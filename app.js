const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

// Paddles
const paddleWidth = 10;
const paddleHeight = 80;

const leftPaddle = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  speed: 6,
  dy: 0
};

const rightPaddle = {
  x: canvas.width - 20,
  y: canvas.height / 2 - paddleHeight / 2,
  speed: 5
};

// Ball
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 8,
  speedX: 4,
  speedY: 3
};

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "w") leftPaddle.dy = -leftPaddle.speed;
  if (e.key === "s") leftPaddle.dy = leftPaddle.speed;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "w" || e.key === "s") leftPaddle.dy = 0;
});

function update() {
  // Move paddles
  leftPaddle.y += leftPaddle.dy;

  // Simple AI for right paddle
  if (ball.y < rightPaddle.y + paddleHeight / 2) {
    rightPaddle.y -= rightPaddle.speed;
  } else {
    rightPaddle.y += rightPaddle.speed;
  }

  // Move ball
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Wall collision (top/bottom)
  if (ball.y <= 0 || ball.y >= canvas.height) {
    ball.speedY *= -1;
  }

  // Paddle collision (left)
  if (
    ball.x - ball.radius < leftPaddle.x + paddleWidth &&
    ball.y > leftPaddle.y &&
    ball.y < leftPaddle.y + paddleHeight
  ) {
    ball.speedX *= -1;
  }

  // Paddle collision (right)
  if (
    ball.x + ball.radius > rightPaddle.x &&
    ball.y > rightPaddle.y &&
    ball.y < rightPaddle.y + paddleHeight
  ) {
    ball.speedX *= -1;
  }

  // Reset if out of bounds
  if (ball.x < 0 || ball.x > canvas.width) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Center line
  ctx.fillStyle = "white";
  for (let i = 0; i < canvas.height; i += 20) {
    ctx.fillRect(canvas.width / 2 - 1, i, 2, 10);
  }

  // Left paddle
  ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);

  // Right paddle
  ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
