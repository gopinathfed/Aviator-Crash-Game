let multiplier = 1.0;
let crashPoint = 0;
let gameInterval;
let hasBet = false;
let hasCashedOut = false;
let playerAmount = parseFloat(localStorage.getItem("playerAmount")) || 100000;
let betAmount = 0;
let isGameRunning = false;
let prob = "";
const input = document.getElementById("betAmount");
input.value = 100;

function getCrashPointWithProbability(betActive) {
  const rand = Math.random();

  if (betActive) {
    prob = "risk";
    if (rand < 0.30) return parseFloat((Math.random() * 0.049 + 1.00).toFixed(2));
    if (rand < 0.65) return parseFloat((Math.random() * 0.44 + 1.06).toFixed(2));
    if (rand < 0.85) return parseFloat((Math.random() * 0.99 + 1.51).toFixed(2));
    if (rand < 0.94) return parseFloat((Math.random() * 1.49 + 2.51).toFixed(2));
    if (rand < 0.98) return parseFloat((Math.random() * 4.99 + 4.01).toFixed(2));
    return parseFloat((Math.random() * 5 + 9.01).toFixed(2));
  } else {
    prob = "no-risk";
    if (rand < 0.05) return parseFloat((Math.random() * 0.049 + 1.00).toFixed(2));      // 5% - 1.00x to 1.05x
    if (rand < 0.15) return parseFloat((Math.random() * 0.44 + 1.06).toFixed(2));       // 10% - 1.06x to 1.50x
    if (rand < 0.30) return parseFloat((Math.random() * 0.99 + 1.51).toFixed(2));       // 15% - 1.51x to 2.5x
    if (rand < 0.50) return parseFloat((Math.random() * 1.49 + 2.51).toFixed(2));       // 20% - 2.51x to 4.0x
    if (rand < 0.70) return parseFloat((Math.random() * 5 + 4.01).toFixed(2));          // 20% - 4.01x to 9.0x
    if (rand < 0.85) return parseFloat((Math.random() * 5 + 9.01).toFixed(2));          // 15% - 9.01x to 14.0x
    if (rand < 0.95) return parseFloat((Math.random() * 5 + 14.01).toFixed(2));         // 10% - 14.01x to 19.0x
    return parseFloat((Math.random() * 5 + 19.01).toFixed(2));                          // 5% - 19.01x to 24.0x
  }

}

function generateFakeCrashHistory() {
  const history = document.getElementById("crashHistory");
  const highCrashIndices = new Set();
  while (highCrashIndices.size < 5) {
    highCrashIndices.add(Math.floor(Math.random() * 20));
  }
  for (let i = 0; i < 20; i++) {
    let value;
    if (highCrashIndices.has(i)) {
      value = parseFloat((Math.random() * 31 + 19.01).toFixed(2));
    } else {
      const rand = Math.random();
      if (rand < 0.3) value = parseFloat((Math.random() * 0.049 + 1.00).toFixed(2));
      else if (rand < 0.5) value = parseFloat((Math.random() * 0.45 + 1.06).toFixed(2));
      else if (rand < 0.7) value = parseFloat((Math.random() * 1.99 + 1.51).toFixed(2));
      else value = parseFloat((Math.random() * 10 + 2.5).toFixed(2));
    }

    const el = document.createElement("span");
    el.textContent = value + "x";

    if (value < 2) el.classList.add("low");
    else if (value < 10) el.classList.add("mid");
    else if (value < 100) el.classList.add("high");
    else el.classList.add("jackpot");

    history.appendChild(el);
  }
}

function updateUI() {
  document.getElementById("multiplierDisplay").textContent = multiplier.toFixed(2) + "x";
  document.getElementById("playerAmount").textContent = `Your Amount: ₹${playerAmount.toFixed(2)}`;
  localStorage.setItem("playerAmount", playerAmount.toFixed(2));
}

function logCrash(crash) {
  const el = document.createElement("span");
  el.textContent = crash + "x";

  if (crash < 2) el.classList.add("low");
  else if (crash < 10) el.classList.add("mid");
  else if (crash < 100) el.classList.add("high");
  else el.classList.add("jackpot");

  const history = document.getElementById("crashHistory");
  history.prepend(el);
  if (history.children.length > 20) history.removeChild(history.lastChild);
}

function placeBet() {
  betAmount = parseFloat(input.value);
  if (isNaN(betAmount) || betAmount <= 0 || betAmount > playerAmount) {
    alert("Enter valid bet amount.");
    return;
  }

  hasBet = true;
  hasCashedOut = false;
  playerAmount -= betAmount;
  updateUI();
  document.getElementById("betButton").disabled = true;
}

function handleCashOut() {
  if (!hasCashedOut && hasBet && isGameRunning) {
    hasCashedOut = true;
    const win = betAmount * multiplier;
    playerAmount += win;
    crashPoint += 10;
  }
}

function startGame() {
  multiplier = 1.0;
  crashPoint = null; // will be generated after 5 seconds
  document.getElementById("crashDisplay").textContent = "Starting...";
  document.getElementById("multiplierDisplay").textContent = "1.00x";
  document.getElementById("betButton").disabled = false;
  document.getElementById("betButton").textContent = "Bet";
  isGameRunning = false;
  hasBet = false;
  hasCashedOut = false;

  setTimeout(() => {
    const activeBet = hasBet;
    crashPoint = getCrashPointWithProbability(activeBet);
    isGameRunning = true;

    console.log("hasBet:", activeBet);
    console.log("Crash Point:", crashPoint);
    console.log("Probability:", prob);

    if (activeBet) {
      document.getElementById("betButton").textContent = "Cash Out";
      document.getElementById("betButton").disabled = false;
    }

    let currentMultiplier = 1.00;
    let interval;

    const baseDelay = 60;

    function getSpeed(mult) {
      if (mult <= 2) return baseDelay;
      if (mult <= 5) return 30;
      if (mult <= 10) return 10;
      if (mult <= 20) return 5;
      return 1; // faster speed after 5x
    }

    function updateMultiplier() {
      document.getElementById("crashDisplay").textContent = `${currentMultiplier.toFixed(2)}x`;
      multiplier = currentMultiplier;
      updateUI();

      if (currentMultiplier >= crashPoint) {
        clearTimeout(interval);
        document.getElementById("crashDisplay").textContent = `💥 Crashed at ${crashPoint.toFixed(2)}x`;
        logCrash(crashPoint);
        isGameRunning = false;

        if (activeBet && !hasCashedOut) {
          updateUI();
        }

        setTimeout(startGame, 3000);
        return;
      }

      currentMultiplier = parseFloat((currentMultiplier + 0.01).toFixed(2));
      const nextDelay = getSpeed(currentMultiplier);
      interval = setTimeout(updateMultiplier, nextDelay);
    }

    updateMultiplier();
  }, 5000);
}

window.onload = () => {
  updateUI();
  generateFakeCrashHistory();
  startGame();

  const betBtn = document.getElementById("betButton");
  betBtn.addEventListener("click", () => {
    if (!isGameRunning && !hasBet) {
      placeBet();
    } else if (isGameRunning && !hasCashedOut && hasBet) {
      handleCashOut();
      betBtn.disabled = true;
    }
  });
};
