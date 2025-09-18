const container = document.querySelector('.circle-container');
const lettersArray = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","Ñ","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

lettersArray.forEach(letterChar => {
  const letterDiv = document.createElement('div');
  letterDiv.className = 'letter';
  letterDiv.textContent = letterChar;
  container.appendChild(letterDiv);
});

const letters = document.querySelectorAll('.letter');
letters.forEach((letter, i) => {
  const angle = (i / letters.length) * 360;
  letter.style.transform = `rotate(${angle}deg) translateY(-36vmin) rotate(-${angle}deg)`;  
});

let currentIndex = 0;
letters[currentIndex].classList.add('current-border');

const correctButton = document.querySelector('#correct');
const wrongButton = document.querySelector('#wrong');
const skipButton = document.querySelector('#skip');
const pauseToggle = document.querySelector('#pause-toggle');

function setButtonsDisabled(value) {
  correctButton.disabled = value;
  wrongButton.disabled = value;
  skipButton.disabled = value;
}
setButtonsDisabled(true);

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

function highlightCurrent() {
  letters.forEach(letter => letter.classList.remove('current-border'));
  if (currentIndex < letters.length) letters[currentIndex].classList.add('current-border');
}

function findNextUnanswered(fromIndex) {
  let idx = fromIndex;
  do {
    idx = (idx + 1) % letters.length;
    if (!letters[idx].classList.contains('correct') && !letters[idx].classList.contains('wrong')) {
      return idx;
    }
  } while (idx !== fromIndex);
  return -1;
}

function nextLetter() {
  const next = findNextUnanswered(currentIndex);
  if (next === -1) {
    stopTimer();
    setButtonsDisabled(true);
    showToast("El juego ha finalizado, reinicia la ventana para iniciar otro.");
    return;
  }
  letters[currentIndex].classList.remove('current-border');
  currentIndex = next;
  highlightCurrent();
}

function handleButtonClick(callback) {
  if (timerInterval === null && !awaitingResume && !gameStarted) {
    showToast("Todavía no ha iniciado el juego, presiona ESPACIO para empezarlo.");
    return;
  }
  if (timerInterval === null && awaitingResume) {
    showToast("Presiona ESPACIO para reanudar el juego.");
    return;
  }
  callback();
  document.activeElement.blur();
}

const correctSound = new Audio('./resources/correct.mp3');
const wrongSound = new Audio('./resources/wrong.mp3');
const skipSound = new Audio('./resources/skip.wav');

correctSound.volume = 0.95;
wrongSound.volume = 0.95;
skipSound.volume = 0.9;

let time = 300;
let timerInterval = null;
let gameStarted = false;
let awaitingResume = false;

const scoreContainer = document.querySelector('.score-container');
let score = 0;
scoreContainer.innerHTML = `<h2 class="score">Puntación: ${score}</h2>`;

function updateTimerDisplay() {
  const minutes = String(Math.floor(time / 60)).padStart(2, '0');
  const seconds = String(time % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `TIEMPO: ${minutes}:${seconds}`;
}

function showBonusTime() {
  const bonus = document.getElementById('bonus-time');
  bonus.textContent = "+10s extra";
  setTimeout(() => { bonus.textContent = ""; }, 3000);
}

function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      if (time > 0) {
        time--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        setButtonsDisabled(true);
        showToast("El juego ha finalizado, reinicia la ventana para iniciar otro.");
      }
    }, 1000);
    setButtonsDisabled(false);
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function setPausedVisual(paused) {
  if (paused) {
    pauseToggle.innerHTML = `<i class="fa-solid fa-play"></i>`;
    setButtonsDisabled(true);
  } else {
    pauseToggle.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    setButtonsDisabled(false);
  }
}

correctButton.addEventListener('click', () => {
  handleButtonClick(() => {
    letters[currentIndex].classList.remove('wrong');
    letters[currentIndex].classList.add('correct');
    score++;
    time += 10;
    updateTimerDisplay();
    scoreContainer.querySelector('.score').textContent = `Score: ${score}`;
    correctSound.currentTime = 0; correctSound.play();
    showBonusTime();
    nextLetter();
  });
});

wrongButton.addEventListener('click', () => {
  handleButtonClick(() => {
    letters[currentIndex].classList.remove('correct');
    letters[currentIndex].classList.add('wrong');
    score--;
    scoreContainer.querySelector('.score').textContent = `Score: ${score}`;
    wrongSound.currentTime = 0; wrongSound.play();
    stopTimer();
    awaitingResume = true;
    setPausedVisual(true);
    nextLetter();
  });
});

skipButton.addEventListener('click', () => {
  handleButtonClick(() => {
    skipSound.currentTime = 0; skipSound.play();
    letters[currentIndex].classList.add('skipped');
    stopTimer();
    awaitingResume = true;
    setPausedVisual(true);
    nextLetter();
  });
});

function resumeAfterAwaiting() {
  if (!awaitingResume) return;
  awaitingResume = false;
  setPausedVisual(false);
  startTimer();
}

function togglePause() {
  if (!gameStarted) {
    gameStarted = true;
    startTimer();
    setPausedVisual(false);
    return;
  }
  if (awaitingResume) {
    resumeAfterAwaiting();
    return;
  }
  if (timerInterval) {
    stopTimer();
    setPausedVisual(true);
  } else {
    startTimer();
    setPausedVisual(false);
  }
}

pauseToggle.addEventListener('click', togglePause);

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    togglePause();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  if (k === 'q') correctButton.click();
  if (k === 'e') wrongButton.click();
  if (k === 'r') skipButton.click();
  if (k === 'v') {
    currentThemeColor = themeColors[Math.floor(Math.random() * themeColors.length)];
    applyTheme(currentThemeColor);
  }
});

function applyTheme(color) {
  document.body.style.setProperty('--main-color', color);
  document.querySelectorAll('.letter').forEach(l => l.style.borderColor = color);
  document.getElementById('timer').style.color = color;
  pauseToggle.style.color = color;
  pauseToggle.style.borderColor = color;
}
const themeColors = ['#ffeb3b','#2196f3'];
let currentThemeColor = themeColors[Math.floor(Math.random() * themeColors.length)];
applyTheme(currentThemeColor);

highlightCurrent();
updateTimerDisplay();