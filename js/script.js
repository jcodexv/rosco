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
  letter.style.transform = `rotate(${angle}deg) translateY(-40vmin) rotate(-${angle}deg)`; 
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
  if(currentIndex < letters.length) letters[currentIndex].classList.add('current-border');
}

function nextLetter() {
  letters[currentIndex].classList.remove('current-border');

  // buscar la siguiente letra aún no respondida (ni correct, ni wrong)
  let found = false;
  let startIndex = currentIndex;

  do {
    currentIndex = (currentIndex + 1) % letters.length;
    if (!letters[currentIndex].classList.contains("correct") &&
        !letters[currentIndex].classList.contains("wrong")) {
      found = true;
      break;
    }
  } while (currentIndex !== startIndex);

  if (!found) {
    stopTimer();
    setButtonsDisabled(true);
    showToast("El juego ha finalizado, reinicia la ventana para iniciar otro.");
    return;
  }
  letters[currentIndex].classList.add("current-border");
}

function handleButtonClick(callback) {
  if(timerInterval === null) {
    showToast("El juego está pausado, presiona ESPACIO o el botón para reanudarlo.");
    return;
  }
  callback();
  document.activeElement.blur();
}

const correctSound = new Audio('./resources/correct.mp3');
const wrongSound = new Audio('./resources/wrong.wav');
const skipSound = new Audio('./resources/skip.wav');

correctButton.addEventListener('click', () => {
  handleButtonClick(() => {
    letters[currentIndex].classList.remove('skip','wrong');
    letters[currentIndex].classList.add('correct');
    score++;
    time += 10; 
    updateTimerDisplay();
    scoreContainer.querySelector('.score').textContent = `Score: ${score}`;
    correctSound.currentTime = 0; 
    correctSound.play();
    showBonusTime();
    nextLetter();
  });
});

wrongButton.addEventListener('click', () => {
  handleButtonClick(() => {
    letters[currentIndex].classList.remove('skip','correct');
    letters[currentIndex].classList.add('wrong');
    score--;
    scoreContainer.querySelector('.score').textContent = `Score: ${score}`;
    wrongSound.currentTime = 0;
    wrongSound.play();
    stopTimer();
    nextLetter();
  });
});

skipButton.addEventListener('click', () => {
  handleButtonClick(() => {
    stopTimer();
    letters[currentIndex].classList.remove('correct','wrong');
    letters[currentIndex].classList.add('skip');
    skipSound.currentTime = 0;
    skipSound.play();
    nextLetter();
  });
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') togglePause();
});
pauseToggle.addEventListener('click', togglePause);

function togglePause() {
  if (timerInterval) {
    stopTimer();
    pauseToggle.innerHTML = `<i class="fa-solid fa-play"></i>`;
  } else {
    startTimer();
    pauseToggle.innerHTML = `<i class="fa-solid fa-pause"></i>`;
  }
}


let time = 300; 
let timerInterval = null;

function updateTimerDisplay() {
  const minutes = String(Math.floor(time / 60)).padStart(2, '0');
  const seconds = String(time % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `TIEMPO: ${minutes}:${seconds}`;
}

function startTimer() {
  if (!timerInterval) {
    setButtonsDisabled(false);
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
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

const scoreContainer = document.querySelector('.score-container');
let score = 0;
scoreContainer.innerHTML = `<h2 class="score">Score: ${score}</h2>`;

function showBonusTime() {
  const bonus = document.createElement('span');
  bonus.textContent = " +10s extra";
  bonus.style.color = "limegreen";
  bonus.style.marginLeft = "10px";
  bonus.style.fontWeight = "bold";
  bonus.style.animation = "fadeOut 3s forwards";
  document.getElementById('timer').appendChild(bonus);
  setTimeout(() => bonus.remove(), 3000);
}

const style = document.createElement('style');
style.innerHTML = `
.letter.correct { background-color: #4CAF50; border: 1px solid #4CAF50; }
.letter.wrong { background-color: #f44336; border: 1px solid #f44336; }
.letter.skip { background-color: #2196F3; border: 1px solid #2196F3; }
.letter.current-border { border: 2px solid #fff; box-shadow: 0 0 15px #fff; }
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f1f1f;
  color: #fff;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 1rem;
  box-shadow: 0 0 12px #00000088;
  z-index: 9999;
  opacity: 0.95;
  text-align: center;
}
@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
`;
document.head.appendChild(style);

highlightCurrent();
