class App {
  constructor() {
    const cardsContainer = document.getElementById('cards');
    const timerElement = document.getElementById('timer');
    const nextSetButton = document.getElementById('nextSetButton');



    let timer = 60;
    let currentIndex = 0;

    function startTimer() {
      const interval = setInterval(() => {
        if (timer <= 0) {
          clearInterval(interval);
          alert('Time is up!');
          location.reload();
        } else {
          timer--;
          timerElement.textContent = timer;
        }
      }, 1000);
    }

    const pokemonList = ['pikachu', 'spheal']; // Add folder names here

    const assets = pokemonList.map(name => ({
      folder: name,
      correct: `${name}-correct.jpg`,
      incorrect: [
        `${name}-incorrect1.jpg`,
        `${name}-incorrect2.jpg`,
        `${name}-incorrect3.jpg`
      ]
    }));
    
    function loadCards(index) {
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
        nextSetButton.style.display = 'none';
      } else {
        alert('You have completed all sets!');
      }
    }

    // Initialize
    startTimer();
    loadCards(currentIndex);
  
  }
}

new App();