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
  letter.style.transform = `rotate(${angle}deg) translateY(-45vmin) rotate(-${angle}deg)`;
});
