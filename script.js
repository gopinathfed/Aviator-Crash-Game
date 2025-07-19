let multiplier = 1.0;
let crashPoint = 0;
let gameInterval;
let hasBet = false;
let hasCashedOut = false;
let playerAmount = 1000;
let betAmount = 0;
let profit = 0;
let isGameRunning = false;
let betStartTime = null;
const input = document.getElementById("betAmount");
input.value = 100;

function getCrashPointWithProbability() {
  const rand = Math.random();

  if (rand < 0.20) return parseFloat((Math.random() * 0.049 + 1.00).toFixed(2)); // 20% - 1.00x to 1.05x
  if (rand < 0.50) return parseFloat((Math.random() * 0.45 + 1.06).toFixed(2));  // 30% - 1.06x to 1.50x
  if (rand < 0.75) return parseFloat((Math.random() * 0.99 + 1.51).toFixed(2));  // 25% - 1.51x to 2.5x
  if (rand < 0.90) return parseFloat((Math.random() * 1.49 + 2.51).toFixed(2));  // 15% - 2.51x to 4.0x
  if (rand < 0.96) return parseFloat((Math.random() * 5 + 4.01).toFixed(2));     // 6% - 4.01x to 9.0x
  if (rand < 0.99) return parseFloat((Math.random() * 10 + 9.01).toFixed(2));    // 3% - 9.01x to 19.0x
  return parseFloat((Math.random() * 31 + 19.01).toFixed(2));                    // 1% - 19.01x to 50.0x
}

function generateFakeCrashHistory() {
  const history = document.getElementById("crashHistory");
  const fakeHistory = [];
  const highCrashIndices = new Set();
  while (highCrashIndices.size < 5) {
    highCrashIndices.add(Math.floor(Math.random() * 20));
  }
  for (let i = 0; i < 20; i++) {
    let value;
    if (highCrashIndices.has(i)) {
      value = parseFloat((Math.random() * 31 + 19.01).toFixed(2)); // random 20x to 50x
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
  document.getElementById("profitLog").textContent = `Total Profit: ₹${profit.toFixed(2)}`;
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
  setTimeout(() => {
    if (isGameRunning) {
      document.getElementById("betButton").textContent = "Cash Out";
      document.getElementById("betButton").disabled = false;
    }
  }, 5000);
}

function handleCashOut() {
  if (!hasCashedOut && hasBet && isGameRunning) {
    hasCashedOut = true;
    const win = betAmount * multiplier;
    playerAmount += win;
    profit += win - betAmount;
  }
}

function startGame() {
  multiplier = 1.0;
  crashPoint = getCrashPointWithProbability();
  document.getElementById("crashDisplay").textContent = "Starting...";
  document.getElementById("multiplierDisplay").textContent = "1.00x";
  document.getElementById("betButton").disabled = false;
  document.getElementById("betButton").textContent = "Bet";
  isGameRunning = false;
  hasBet = false;
  hasCashedOut = false;

  setTimeout(() => {
    isGameRunning = true;

    if (isGameRunning && hasBet) {
      document.getElementById("betButton").textContent = "Cash Out";
      document.getElementById("betButton").disabled = false;
    }

    let currentMultiplier = 1.00;
    let interval;

    const speedBefore2x = 60;
    const speedAfter2xMin = 20;
    const speedAfter2xMax = 50;

    function updateMultiplier() {
      document.getElementById("crashDisplay").textContent = `${currentMultiplier.toFixed(2)}x`;
      multiplier = currentMultiplier;
      updateUI();

      if (currentMultiplier >= crashPoint) {
        clearTimeout(interval);
        document.getElementById("crashDisplay").textContent = `💥 Crashed at ${crashPoint.toFixed(2)}x`;
        logCrash(crashPoint);
        isGameRunning = false;

        if (hasBet && !hasCashedOut) {
          updateUI();
        }

        setTimeout(startGame, 3000);
        return;
      }

      currentMultiplier = parseFloat((currentMultiplier + 0.01).toFixed(2));

      const nextDelay = currentMultiplier <= 2
        ? speedBefore2x
        : Math.floor(Math.random() * (speedAfter2xMax - speedAfter2xMin + 1)) + speedAfter2xMin;

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
    } else if (isGameRunning && hasBet && !hasCashedOut) {
      handleCashOut();
      betBtn.disabled = true;
    }
  });
};
