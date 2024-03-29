const SPEED_SCALE = 0.000010;

var jump_sound = new Audio("./game/assets/jump.mp3")
var game_over_sound = new Audio("./game/assets/game_over.mp3")

const game = document.querySelector("#game");
const scoreDisplay = document.querySelector("#score");
const startMessage = document.querySelector("#start-message");
const gameoverMessage = document.querySelector("#gameover-message");

document.addEventListener("keydown", startGame, { once: true });

/* general variables */
let lastTime;
let speedScale;
let score;

/* frame update */
function update(time) { 
  if (lastTime == null) {
    lastTime = time;
    window.requestAnimationFrame(update);
    return;
  }

  const delta = time - lastTime;

  updateGround(delta, speedScale);
  updateDino(delta, speedScale);
  updateCactus(delta, speedScale);
  updateSpeedScale(delta);
  updateScore(delta);

  if (checkGameOver()) return handleGameOver();

  lastTime = time;
  window.requestAnimationFrame(update);
}

function startGame() {
  lastTime = null;
  speedScale = 1;
  score = 0;
  setupGround();
  setupDino();
  setupCactus();
  startMessage.classList.add("hide");
  gameoverMessage.classList.add("hide");
  window.requestAnimationFrame(update);
}

/* speeds up the game over time */
function updateSpeedScale(delta) { 
  speedScale += delta * SPEED_SCALE;
}

function updateScore(delta) {
  score += delta * 0.01; 
  scoreDisplay.textContent = Math.floor(score);
}

/* collision conditions */
function checkCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right - 10 &&
    rect1.top < rect2.bottom - 10  &&
    rect1.right > rect2.left + 30 &&
    rect1.bottom > rect2.top + 30 
  );
}

function checkGameOver() {
  const dinoRect = getDinoRect();
  return getCactusRects().some(rect => checkCollision(rect, dinoRect)); /* check collision with any of the cactus */
}

function handleGameOver() {
  setDinoLose();
  setTimeout(() => {
    document.addEventListener("keydown", startGame, { once: true }); /* prevents accidental click */
    gameoverMessage.classList.remove("hide");
  }, 100);
}




/* HANDLING CSS PROPERTIES */

/* get property value */
function getCustomProperty(elem, prop) {
  return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0;
}

/* set property value */
function setCustomProperty(elem, prop, value) {
  elem.style.setProperty(prop, value);
}

/* increment the property value */
function incrementCustomProperty(elem, prop, inc) {
  setCustomProperty(elem, prop, getCustomProperty(elem, prop) + inc);
}


/* GROUND MOVEMENT */

const GROUND_SPEED = 0.05;
const grounds = document.querySelectorAll(".ground");

function setupGround() {
  setCustomProperty(grounds[0], "--left", 0);
  setCustomProperty(grounds[1], "--left", 300);
}

function updateGround(delta, speedScale) {
  grounds.forEach(ground => {
    incrementCustomProperty(ground, "--left", delta * speedScale * GROUND_SPEED * -1); /* moves the ground according to game speed */

    if (getCustomProperty(ground, "--left") <= -300) {
      incrementCustomProperty(ground, "--left", 600); /* loop the elements */
    }
  });
}

/* DINOSAUR MOVEMENT */

const dino = document.querySelector("#dino");
const JUMP_SPEED = 0.4;
const GRAVITY = 0.0015;
const DINO_FRAME_COUNT = 2;
const FRAME_TIME = 100;

let isJumping;
let dinoFrame;
let currentFrameTime;
let yVelocity;

function setupDino() {
  isJumping = false;
  dinoFrame = 0;
  currentFrameTime = 0;
  yVelocity = 0;

  setCustomProperty(dino, "--bottom", 0);
  document.removeEventListener("keydown", onJump); /* reset the dinosaur if the player dies while jumping */
  document.addEventListener("keydown", onJump);
}

function updateDino(delta, speedScale) {
  handleRun(delta, speedScale);
  handleJump(delta);
}

function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

function getDinoRect() {
  let bcr = dino.getBoundingClientRect();
  bcr.left = bcr.left - (bcr.left * 0.9);
  bcr.right = bcr.right - (bcr.right * 0.9);
  return bcr /* get the dinosaur hitbox */
}

function setDinoLose() {
  game_over_sound.play()
  dino.src = "game/assets/egyptian-02.png";
  setTimeout(() => {
    dino.src = "game/assets/egyptian-03.png";
    setTimeout(() => {
      dino.src = "game/assets/egyptian-04.png";
      setTimeout(() => {
        dino.src = "game/assets/egyptian-01.png";
        setTimeout(() => {
          dino.src = "game/assets/egyptian-02.png";
          setTimeout(() => {
            dino.src = "game/assets/egyptian-03.png";
          }, 30)
        }, 50)
      }, 80)
    }, 100)
  }, 0)
}

function handleRun(delta, speedScale) {
  if (isJumping) {
    //dino.src = `game/assets/dino-stationary.png`;
    dino.src = `game/assets/egyptian-00.png`;
    return;
  }

  if (currentFrameTime >= FRAME_TIME) {
    dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT;
    dino.src = `game/assets/egyptian-0${dinoFrame}.png`; /* switch between images to simulate movement */
    //dino.src = 'game/assets/egyptian.png';
    currentFrameTime -= FRAME_TIME;
  }
  currentFrameTime += delta * speedScale;
}

function handleJump(delta) {
  if (!isJumping) return;

  incrementCustomProperty(dino, "--bottom", yVelocity * delta);

  if (getCustomProperty(dino, "--bottom") <= 0) {
    setCustomProperty(dino, "--bottom", 0);
    isJumping = false;
  }

  yVelocity -= GRAVITY * delta;
}

function onJump(e) {
  if (e.code !== "Space" || isJumping) return;

  yVelocity = JUMP_SPEED;
  jump_sound.play();
  isJumping = true;
}

/* ADD CACTUS */

const CACTUS_SPEED = 0.05;
const CACTUS_INTERVAL_MIN = 600;
const CACTUS_INTERVAL_MAX = 2000;

let nextCactusTime;

function setupCactus() {
  nextCactusTime = CACTUS_INTERVAL_MIN;
  document.querySelectorAll(".cactus").forEach(cactus => {
    cactus.remove(); /* remove cactus when game restart */
  })
}

function updateCactus(delta, speedScale) {
  document.querySelectorAll(".cactus").forEach(cactus => {
    incrementCustomProperty(cactus, "--left", delta * speedScale * CACTUS_SPEED * -1);
    if (getCustomProperty(cactus, "--left") <= -100) {
      cactus.remove(); /* remove cactus off screen so it doesn't impair game performance */
    }
  })

  if (nextCactusTime <= 0) {
    createCactus();
    nextCactusTime =
      randomizer(CACTUS_INTERVAL_MIN, CACTUS_INTERVAL_MAX) / speedScale;
  }
  nextCactusTime -= delta;
}

function getCactusRects() {
  return [...document.querySelectorAll(".cactus")].map(cactus => {
    let bcr = cactus.getBoundingClientRect();
    bcr.left = bcr.left - (bcr.left * 0.5);
    bcr.right = bcr.right - (bcr.right * 0.5);
    return bcr; /* get the hitbox of all the cactus on the screen */
  })
}

function createCactus() {
  const cactus = document.createElement("img");
  //cactus.src = "game/assets/dancerGIF.gif";
  cactus.src = "game/assets/elo.png";
  cactus.classList.add("cactus");
  setCustomProperty(cactus, "--left", 100);
  game.append(cactus); 
}

function randomizer(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min); /* choose a number between minimum and maximum */
}
