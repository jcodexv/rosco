const container = document.querySelector('.circle-container');
const lettersArray = [
  "A","B","C","D","E","F","G","H","I","J","K","L","M",
  "N","Ñ","O","P","Q","R","S","T","U","V","W","X","Y","Z"
];

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
letters[currentIndex].classList.add('current');

const correctButton = document.querySelector('#correct');
const wrongButton = document.querySelector('#wrong');
const skipButton = document.querySelector('#skip');

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
  if(currentIndex < letters.length - 1) {
    currentIndex++;
    highlightCurrent();
  } else {
    stopTimer();
    letters[currentIndex].classList.remove('current-border');
    setButtonsDisabled(true);
    showToast("El juego ha finalizado, reinicia la ventana para iniciar otro.");
  }
}

function handleButtonClick(callback) {
  if(timerInterval === null) {
    showToast("El juego esta pausado, presiona ESPACIO para reanudarlo.");
    return;
  }
  callback();
  document.activeElement.blur();
}

correctButton.addEventListener('click', () => {
  handleButtonClick(() => {
    letters[currentIndex].classList.remove('skip', 'wrong');
    letters[currentIndex].classList.add('correct');
    score++;
    scoreContainer.querySelector('.score').textContent = `score: ${score}`;
    nextLetter();
  });
});

wrongButton.addEventListener('click', () => {
  handleButtonClick(() => {
    letters[currentIndex].classList.remove('skip', 'correct');
    letters[currentIndex].classList.add('wrong');
    score--;
    scoreContainer.querySelector('.score').textContent = `score: ${score}`;
    nextLetter();
  });
});

skipButton.addEventListener('click', () => {
  handleButtonClick(() => {
    stopTimer();
    letters[currentIndex].classList.remove('correct', 'wrong');
    letters[currentIndex].classList.add('skip');
  });
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (timerInterval) {
      stopTimer();
    } else {
      startTimer();
      if (letters[currentIndex].classList.contains('skip')) {
        nextLetter();
      }
    }
  }
});

const gameHeader = document.querySelector('.game-header');
let time = 600;
let timerInterval = null;

function updateTimerDisplay() {
  const minutes = String(Math.floor(time / 60)).padStart(2, '0');
  const seconds = String(time % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `TIME: ${minutes}:${seconds}`;
}

gameHeader.innerHTML = `<h2 id="timer">TIME: 10:00 <br>(Presiona ESPACIO para comenzar)</h2>`;

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
scoreContainer.innerHTML = `<h2 class="score">score: ${score}</h2>`;

const style = document.createElement('style');
style.innerHTML = `
.letter.correct { background-color: #4CAF50; border: 1px solid #4CAF50; }
.letter.wrong { background-color: #f44336; border: 1px solid #f44336; }
.letter.skip { background-color: #8b8b8b; border: 1px solid #8b8b8b; }
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
`;
document.head.appendChild(style);

highlightCurrent();
