const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


let animationId;
let isPaused = false;
let difficulty = "medium";

const paddleWidth = 12;
const paddleHeight = 80;

let playerScore = 0;
let aiScore = 0;
let playerLives = 3;

const playerScoreElem = document.getElementById("playerScore");
const aiScoreElem = document.getElementById("aiScore");
const livesElem = document.getElementById("lives");
const messageElem = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");
let player = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
};

let computer = {
  x: canvas.width - paddleWidth - 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
};

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 8,
  speed: 5,
  velocityX: 5,
  velocityY: 5,
};
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawNet() {
  for (let i = 0; i <= canvas.height; i += 30) {
    drawRect(canvas.width / 2 - 1, i, 2, 20, "#888");
  }
}

function draw() {
  drawRect(0, 0, canvas.width, canvas.height, "#111827"); 
  drawNet();
  drawRect(player.x, player.y, player.width, player.height, "#00ffe0"); 

  let aiColor = {
    easy: "#a1a1aa",
    medium: "#facc15",
    hard: "#dc2626",
  }[difficulty] || "#ff8c00";

  drawRect(computer.x, computer.y, computer.width, computer.height, aiColor); 
  drawCircle(ball.x, ball.y, ball.radius, "#ff0080"); 
}

function updateScore() {
  playerScoreElem.textContent = playerScore;
  aiScoreElem.textContent = aiScore;
}

function updateLives() {
  const fullHeart = "❤️";
  const emptyHeart = "🤍";
  livesElem.innerHTML = Array.from({ length: 3 }, (_, i) =>
    i < playerLives ? fullHeart : emptyHeart
  ).join("");
}

function gameOver(win) {
  isPaused = true;
  cancelAnimationFrame(animationId);
  messageElem.textContent = win
    ? "🎉 ¡Felicidades! Ganaste el juego 🎉"
    : difficulty === "easy"
    ? "💀 ¡Era fácil y perdiste! 😅💀"
    : "💀 Te quedaste sin corazones. Fin del juego 💀";
  messageElem.style.display = "block";
  restartBtn.style.display = "inline-block";
}

function checkCollision(ball, paddle) {
  return (
    ball.x - ball.radius < paddle.x + paddle.width &&
    ball.x + ball.radius > paddle.x &&
    ball.y - ball.radius < paddle.y + paddle.height &&
    ball.y + ball.radius > paddle.y
  );
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
  ball.velocityY = (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1);
}

function update() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.velocityY = -ball.velocityY;
  }

  const cpuSpeed = difficulty === "easy" ? 1.2 : difficulty === "medium" ? 3.5 : 5;
  const trackFactor = difficulty === "easy" ? 0.02 : 0.09;
  computer.y += (ball.y - (computer.y + computer.height / 2)) * trackFactor * cpuSpeed;

  if (checkCollision(ball, player)) {
    ball.velocityX = -ball.velocityX;
    ball.x = player.x + player.width + ball.radius;
  }
  if (checkCollision(ball, computer)) {
    if (!(difficulty === "easy" && Math.random() < 0.4)) {
      ball.velocityX = -ball.velocityX;
      ball.x = computer.x - ball.radius;
    }
  }
  if (ball.x - ball.radius < 0) {
    aiScore++;
    playerLives--;
    updateScore();
    updateLives();
    if (playerLives <= 0) {
      gameOver(false);
      return;
    }
    resetBall();
  }
  if (ball.x + ball.radius > canvas.width) {
    playerScore++;
    updateScore();
    if (playerScore >= 5) {
      gameOver(true);
      return;
    }
    resetBall();
  }
}
function gameLoop() {
  draw();
  update();
  if (!isPaused) {
    animationId = requestAnimationFrame(gameLoop);
  }
}
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  player.y = mouseY - player.height / 2;
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
});
function startGame() {
  cancelAnimationFrame(animationId);
  playerScore = 0;
  aiScore = 0;
  playerLives = 3;
  updateScore();
  updateLives();
  messageElem.style.display = "none";
  restartBtn.style.display = "none";
  isPaused = false;
  resetBall();
  gameLoop();
}
document.getElementById("startBtn").addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  if (!isPaused) gameLoop();
});
document.getElementById("difficultySelect").addEventListener("change", (e) => {
  difficulty = e.target.value;
});
