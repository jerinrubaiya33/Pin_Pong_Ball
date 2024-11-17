// Selecting Elements
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const panel = document.querySelector(".panel");
const play = document.querySelector(".play");
const mode = document.querySelector("input[type=text]");
const modeValues = document.querySelectorAll(".mode");
const statPanel = document.querySelector(".stat");

const comScore = new Audio();
comScore.src = "resources/audio/comScore.mp3";
const userScore = new Audio();
userScore.src = "resources/audio/userScore.mp3";

// User choosing the mode.
modeValues.forEach((modeValue) => {
    modeValue.addEventListener("click", () => {
        modeValues.forEach((index) => {
            index.classList.remove("selected");
        });
        modeValue.classList.add("selected");
        let value = modeValue.dataset.number;
        mode.value = value;

        // Set computer speed based on mode
        switch (value) {
            case "easy":
                compSpeed = 0.05;
                break;
            case "medium":
                compSpeed = 0.1;
                break;
            case "hard":
                compSpeed = 0.15;
                break;
        }
    });
});

let compSpeed = 0.1; // Default to medium speed

let user = { width: 10, height: 100, color: "white", x: 10, y: 0, score: 0 };
let computer = { width: 10, height: 100, color: "white", x: 0, y: 0, score: 0 };
let ball = { radius: 10, velocity: { x: 7, y: 7 }, speed: 7, color: "white", x: 0, y: 0 };
let net = { x: 0, y: 0, color: "white", width: 2, height: 10 };

// Detect if the device is mobile
const isMobile = window.innerWidth <= 768; // Adjust the width as per your criteria
if (isMobile) {
    ball.speed = 4; // Slow down the ball speed for mobile devices
    ball.velocity.x = 4;
    ball.velocity.y = 4;

    // Show the rotate popup on mobile devices
    const rotatePopup = document.createElement('div');
    rotatePopup.style.position = 'fixed'; // Use fixed positioning
    rotatePopup.style.top = '50%';
    rotatePopup.style.left = '50%';
    rotatePopup.style.transform = 'translate(-50%, -50%)';
    rotatePopup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    rotatePopup.style.color = 'white';
    rotatePopup.style.padding = '20px';
    rotatePopup.style.borderRadius = '10px';
    rotatePopup.style.fontSize = '18px';
    rotatePopup.style.textAlign = 'center'; // Center the text
    rotatePopup.style.zIndex = '9999'; // Ensure the popup appears above all other elements
    rotatePopup.innerText = 'Please Rotate Your Phone';
    document.body.appendChild(rotatePopup);

    // Animation duration
    setTimeout(() => {
        rotatePopup.style.transition = 'opacity 1s ease-out';
        rotatePopup.style.opacity = 0;
        setTimeout(() => {
            rotatePopup.remove();
        }, 1000);
    }, 2000);

    // Listen for orientation change and remove the popup
    window.addEventListener('orientationchange', () => {
        rotatePopup.style.transition = 'opacity 1s ease-out';
        rotatePopup.style.opacity = 0;
        setTimeout(() => {
            rotatePopup.remove();
        }, 1000);
    });
}

// Responsive canvas
function setCanvasSize() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.7;
    user.y = (canvas.height - user.height) / 2;
    computer.y = (canvas.height - computer.height) / 2;
    user.x = 10;
    computer.x = canvas.width - 20;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    net.x = (canvas.width - net.width) / 2;
}
setCanvasSize();
window.addEventListener("resize", setCanvasSize);

// Drawing functions
function drawRect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function drawArc(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function drawText(text, x, y) { ctx.font = "30px Arial"; ctx.fillStyle = "white"; ctx.fillText(text, x, y); }
function drawNet() {
    for (let i = 0; i < canvas.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// Paddle movement
canvas.addEventListener("mousemove", (e) => {
    let rect = canvas.getBoundingClientRect();
    user.y = e.clientY - rect.top - user.height / 2;
});
canvas.addEventListener("touchmove", (e) => {
    let rect = canvas.getBoundingClientRect();
    user.y = e.touches[0].clientY - rect.top - user.height / 2;
});

// Game logic
function collision(b, p) {
    return (
        p.x < b.x + b.radius && p.x + p.width > b.x - b.radius &&
        p.y < b.y + b.radius && p.y + p.height > b.y - b.radius
    );
}
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocity = {
        x: ball.speed * (Math.random() > 0.5 ? 1 : -1),
        y: ball.speed * (Math.random() > 0.5 ? 1 : -1),
    };
    // Adjust computer speed to scale with ball speed
    compSpeed = Math.min(0.15, ball.speed / 50);
}
function gameOver() {
    if (user.score >= 10 || computer.score >= 10) {
        panel.classList.add("reveal");
        statPanel.textContent = user.score >= 10 ? "You Won!" : "You Lost!";
        cancelAnimationFrame(gameId);
    }
}

// Main game function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(0, 0, canvas.width, canvas.height, "hotpink");
    drawNet();
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
    drawArc(ball.x, ball.y, ball.radius, ball.color);
    drawText(user.score, canvas.width / 4, 50);
    drawText(computer.score, (3 * canvas.width) / 4, 50);
}

let gameId;
function update() {
    gameId = requestAnimationFrame(update);
    ball.x += ball.velocity.x;
    ball.y += ball.velocity.y;

    // Ball collision with top and bottom walls
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocity.y = -ball.velocity.y;
    }

    // Ball collision with paddles
    let player = ball.x < canvas.width / 2 ? user : computer;
    if (collision(ball, player)) {
        ball.velocity.x = -ball.velocity.x;
        // Increase ball speed gradually
        ball.speed += 0.1;
        ball.velocity.x *= 1.1;
        ball.velocity.y *= 1.1;
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        computer.score++;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }

    // Computer AI: Move computer paddle towards the ball
    let computerTargetY = ball.y - computer.height / 2;
    computer.y += (computerTargetY - computer.y) * compSpeed;

    // Prevent the computer paddle from going out of bounds
    computer.y = Math.max(0, Math.min(canvas.height - computer.height, computer.y));

    gameOver();
    draw();
}

play.addEventListener("click", () => {
    user.score = 0; computer.score = 0;
    panel.classList.remove("reveal");
    resetBall();
    update();
});
