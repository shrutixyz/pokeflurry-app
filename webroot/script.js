class App {
  constructor() {
    const cardsContainer = document.getElementById('cards');
    const timerElement = document.getElementById('timer');


const gameOverComponent = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const gameOverText = document.getElementById('game-over-text');

// Example logic to switch between "Game Over" and "Level Up" states
const gameOverElement = document.getElementById('gameOver');
const gameOverMessage = document.getElementById('game-over-message');
const levelUpButton = document.getElementById('level-up-button');

const gameParent = document.getElementById('gameParent');
const scoreElement = document.getElementById('score');
const scoreEndElement = document.getElementById('scoreEnd')

let username = "snoos";

// In webroot/app.js
window.addEventListener('message', (event) => {
  if (event.data.type === 'devvit-message') {
    username = event.data.data.message.data.username
    console.log("inside", username, event.data)
  }
});

let interval;

    let timer = 60;
    let currentIndex = 0;

    function startTimer() {
      interval = setInterval(() => {
        console.log(username)
        if (timer <= 0) {
          clearInterval(interval);
          console.log('Time is up!');
          endGame();
        } else {
          timer--;
          timerElement.textContent = timer;
        }
      }, 1000);
    }

    const pokemonList = ['pikachu', 'spheal']; // TODO: Add folder names here

    const assets = pokemonList.map(name => ({
      folder: name,
      correct: `${name}-correct.jpg`,
      incorrect: [
        `${name}-incorrect1.jpg`,
        `${name}-incorrect2.jpg`,
        `${name}-incorrect3.jpg`
      ]
    }));
    
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
    }
    
    function loadCards(index) {
      // Shuffle the assets array before loading cards
      shuffleArray(assets);
      const pokemon = assets[index];
      const allCards = [
        { src: `assets/${pokemon.folder}/${pokemon.correct}`, isCorrect: true },
        ...pokemon.incorrect.map(image => ({
          src: `assets/${pokemon.folder}/${image}`, isCorrect: false
        }))
      ];
    
      // Shuffle cards
      allCards.sort(() => Math.random() - 0.5);
    
      cardsContainer.innerHTML = '';
      allCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `<img src="${card.src}" alt="Pokemon Card">`;
    
        cardElement.addEventListener('click', () => {
          console.log("card:", card)
          if (card.isCorrect) {
            console.log('Correct!');
            nextSet();
            // nextSetButton.style.display = 'block';
          } else {
            console.log('Incorrect! Game Over!');
            endGame();
          }
        });
    
        cardsContainer.appendChild(cardElement);
      });
    }

    // nextSetButton.addEventListener('click', () => {
      
    // });

    function nextSet() {
      currentIndex++;
      if (currentIndex < assets.length) {
        loadCards(currentIndex);
        scoreElement.textContent = currentIndex * 100;
      } else {
        alert('You have completed all sets!');
        endGame(true);
      }
    }


function showGameOver() {
  gameOverElement.classList.remove('hidden');
  gameOverText.textContent = 'Game Over!';
  gameOverMessage.textContent = 'Try again or level up!';
  restartButton.classList.remove('hidden');
  levelUpButton.classList.add('hidden');
}

function showLevelUp() {
  gameOverElement.classList.remove('hidden');
  gameOverText.textContent = 'Congratulations!';
  gameOverMessage.textContent = "You’ve caught 'em all and become a Pokémon Master!";
  restartButton.classList.add('hidden');
  levelUpButton.classList.remove('hidden');
}


// Simulate crossing all levels or game over
// Use this depending on your game logic
function handleGameCompletion(isLevelComplete) {
  if (isLevelComplete) {
      showLevelUp();
  } else {
      showGameOver();
  }

  scoreEndElement.textContent = `Your Score: ${currentIndex * 100}`
}

    function endGame(displayCongrats = false) {
      cardsContainer.innerHTML = '';
      gameOverComponent.classList.remove('hidden');
      gameParent.classList.add('hidden');
      if (displayCongrats) {
        handleGameCompletion(true)
      }
      else
      {
        handleGameCompletion(false)
      }
      clearInterval(interval)
      console.log("swnding score: ", username, currentIndex)
      // update score
      window.parent?.postMessage(
        {
          type: 'updateScore',
          data: { 'username' : username, 'score': currentIndex},
        },
        '*'
      );
    }

    restartButton.addEventListener('click', () => {
      window.parent?.postMessage(
        {
          type: 'changeScreen',
          data: { 'screen' : 'home'},
        },
        '*'
      );
    });

    levelUpButton.addEventListener('click', () => {
      window.parent?.postMessage(
        {
          type: 'changeScreen',
          data: { 'screen' : 'home'},
        },
        '*'
      );
    });

    // Initialize
    startTimer();
    loadCards(currentIndex);
  
  }
}

new App();
