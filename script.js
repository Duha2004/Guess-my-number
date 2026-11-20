"use strict";

let secretNumber = Math.trunc(Math.random() * 20) + 1;
let score = 20;
let highscore = 0;
let playing = true;

const $ = sel => document.querySelector(sel);
const body = document.body;
const numberBox = $(".number");
const guessInput = $(".guess");
const rangeEl = $(".range");

const displayMessage = message => {
  $(".message").textContent = message;
};

/* score + ring */
const C = 326.7;
const updateScore = () => {
  $(".score").textContent = score;
  const ring = $(".prog");
  ring.style.strokeDashoffset = C * (1 - score / 20);
  ring.classList.toggle("low", score <= 6 && score > 0);
};

/* tiles */
const buildTiles = () => {
  rangeEl.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const t = document.createElement("div");
    t.className = "tile";
    t.textContent = i;
    t.dataset.n = i;
    rangeEl.appendChild(t);
  }
};
const tile = n => rangeEl.querySelector(`[data-n="${n}"]`);
const narrowRange = (guess, tooHigh) => {
  rangeEl.querySelectorAll(".tile").forEach(t => {
    const n = Number(t.dataset.n);
    if (tooHigh ? n >= guess : n <= guess) t.classList.add("out");
  });
  tile(guess).classList.add("tried");
};

const shake = () => {
  const el = $(".main");
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
};

/* check */
const check = function () {
  if (!playing) return;
  const guess = Number(guessInput.value);

  if (!guess || guess < 1 || guess > 20) {
    displayMessage("⛔️ Enter a number from 1 to 20");
    shake();
    return;
  }

  if (guess === secretNumber) {
    displayMessage("🎉 Correct number!");
    numberBox.textContent = secretNumber;
    body.classList.add("win");
    tile(guess).classList.add("hit");
    playing = false;
    if (score > highscore) {
      highscore = score;
      $(".highscore").textContent = highscore;
    }
    launchConfetti();
    return;
  }

  const tooHigh = guess > secretNumber;
  if (score > 1) {
    displayMessage(tooHigh ? "📈 Too high!" : "📉 Too low!");
    narrowRange(guess, tooHigh);
    score--;
    updateScore();
    shake();
  } else {
    displayMessage("💥 You lost the game!");
    score = 0;
    updateScore();
    numberBox.textContent = secretNumber;
    body.classList.add("lose");
    playing = false;
    shake();
  }
  guessInput.value = "";
  guessInput.focus();
};

$(".check").addEventListener("click", check);
guessInput.addEventListener("keydown", e => {
  if (e.key === "Enter") check();
});

/* again */
$(".again").addEventListener("click", function () {
  score = 20;
  secretNumber = Math.trunc(Math.random() * 20) + 1;
  playing = true;
  displayMessage("Start guessing...");
  updateScore();
  numberBox.textContent = "?";
  guessInput.value = "";
  body.classList.remove("win", "lose");
  buildTiles();
  $(".play").scrollIntoView({ behavior: "smooth", block: "center" });
});

/* scroll-linked hero: sets --p from 0 to 1 */
const hero = $(".hero");
let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const max = hero.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, scrollY / max));
    document.documentElement.style.setProperty("--p", p.toFixed(4));
    ticking = false;
  });
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* reveal on scroll */
const io = new IntersectionObserver(
  entries =>
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.15 },
);
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* confetti */
const canvas = $("#confetti");
const ctx = canvas.getContext("2d");
let pieces = [];
let raf;
const resize = () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
};
addEventListener("resize", resize);
resize();

function launchConfetti() {
  const colors = ["#1fc8a4", "#7c4dff", "#ff6fa5", "#ffa94d", "#ffe27a"];
  pieces = Array.from({ length: 140 }, () => ({
    x: canvas.width / 2,
    y: canvas.height * 0.4,
    vx: (Math.random() - 0.5) * 16,
    vy: Math.random() * -14 - 4,
    size: Math.random() * 8 + 4,
    rot: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.4,
    color: colors[Math.trunc(Math.random() * colors.length)],
  }));
  cancelAnimationFrame(raf);
  animate();
}
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    p.vy += 0.35;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  });
  pieces = pieces.filter(p => p.y < canvas.height + 20);
  if (pieces.length) raf = requestAnimationFrame(animate);
  else ctx.clearRect(0, 0, canvas.width, canvas.height);
}

buildTiles();
updateScore();
