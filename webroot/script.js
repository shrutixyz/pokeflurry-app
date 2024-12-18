class App {
  constructor() {
    const cardsContainer = document.getElementById('cards');
    const timerElement = document.getElementById('timer');
    const pokemonName = document.getElementById('pokemonname');
    const gameOverComponent = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton');
    const gameOverText = document.getElementById('game-over-text');
    const gameOverElement = document.getElementById('gameOver');
    const gameOverMessage = document.getElementById('game-over-message');
    const levelUpButton = document.getElementById('level-up-button');
    const gameParent = document.getElementById('gameParent');
    const scoreElement = document.getElementById('score');
    const scoreEndElement = document.getElementById('scoreEnd');

    let username = "snoos";

    // Track used Pokémon
    const usedPokemon = new Set();
    window.addEventListener('message', (event) => {
      if (event.data.type === 'devvit-message') {
        username = event.data.data.message.data.username
        console.log("inside", username, event.data)
      }
    });
        let timer = 60;
    let currentIndex = 0;
    let interval;

    const pokemonList = ['pikachu', 'spheal', 'shemdi']; // TODO: Add folder names here

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

    function startTimer() {
      interval = setInterval(() => {
        if (timer <= 0) {
          clearInterval(interval);
          endGame();
        } else {
          timer--;
          timerElement.textContent = timer;
        }
      }, 1000);
    }

    function getNextPokemon() {
      if (usedPokemon.size >= assets.length) return null; // All Pokémon used
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * assets.length);
      } while (usedPokemon.has(nextIndex));
      usedPokemon.add(nextIndex);
      return nextIndex;
    }

    function loadCards(index) {
      const pokemon = assets[index];
      const allCards = [
        { src: `assets/${pokemon.folder}/${pokemon.correct}`, isCorrect: true },
        ...pokemon.incorrect.map(image => ({
          src: `assets/${pokemon.folder}/${image}`, isCorrect: false
        }))
      ];
    
      shuffleArray(allCards);
    
      cardsContainer.innerHTML = '';
      const totalCards = allCards.length;
      const angleIncrement = 20; // Degrees between cards
      const startAngle = -((totalCards - 1) * angleIncrement) / 2; // Center the arch
    
      const symbols = ['♠', '♥', '♦', '♣']; // Symbols to choose from
    
      allCards.forEach((card, i) => {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]; // Pick a random symbol
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
    
        // Add a placeholder with the random symbol
        cardElement.innerHTML = `
          <div class="card-placeholder">${randomSymbol}</div>
          <img src="${card.src}" alt="Pokemon Card" style="display: none;">
        `;
    
        // Calculate rotation angle
        const angle = startAngle + i * angleIncrement;
    
        // Adjust vertical positioning for arch effect
        const translateY = Math.abs(angle) * 2; // Higher angle means higher placement
    
        // Apply transformations
        cardElement.style.transform = `rotate(${angle}deg) translateY(${translateY}px)`;
    
        // Load image and replace placeholder
        const imgElement = cardElement.querySelector('img');
        const placeholder = cardElement.querySelector('.card-placeholder');
    
        imgElement.onload = () => {
          placeholder.style.display = 'none';
          imgElement.style.display = 'block';
        };
    
        // Handle click events
        cardElement.addEventListener('click', () => {
          if (card.isCorrect) {
            nextSet();
          } else {
            endGame();
          }
        });
    
        cardsContainer.appendChild(cardElement);
      });
    
      pokemonName.innerHTML = pokemon.correct.split("-correct")[0].toUpperCase();
    }
    
    function nextSet() {
      const nextIndex = getNextPokemon();
      if (nextIndex === null) {
        currentIndex++;
        endGame(true); // Game over when all Pokémon are used
      } else {
        currentIndex++;
        loadCards(nextIndex);
        scoreElement.textContent = currentIndex * 100;
      }
    }

    function endGame(displayCongrats = false) {
      cardsContainer.innerHTML = '';
      gameOverComponent.classList.remove('hidden');
      gameParent.classList.add('hidden');
      if (displayCongrats) {
        handleGameCompletion(true);
      } else {
        handleGameCompletion(false);
      }
      clearInterval(interval);
      window.parent?.postMessage(
        {
          type: 'updateScore',
          data: { username, score: currentIndex },
        },
        '*'
      );
    }

    function handleGameCompletion(isLevelComplete) {
      if (isLevelComplete) {
        showLevelUp();
      } else {
        showGameOver();
      }
      scoreEndElement.textContent = `Your Score: ${currentIndex * 100}`;
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
      gameOverMessage.textContent = "You've collected 'em all and become a Pokémon Master!";
      restartButton.classList.add('hidden');
      levelUpButton.classList.remove('hidden');
    }

    restartButton.addEventListener('click', () => {
      window.parent?.postMessage(
        {
          type: 'changeScreen',
          data: { screen: 'home' },
        },
        '*'
      );
    });

    levelUpButton.addEventListener('click', () => {
      window.parent?.postMessage(
        {
          type: 'changeScreen',
          data: { screen: 'home' },
        },
        '*'
      );
    });

    // Initialize
    startTimer();
    const firstIndex = getNextPokemon();
    loadCards(firstIndex);
  }
}

new App();
