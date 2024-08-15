const startBtn = document.getElementById('start-btn');
const playerForm = document.getElementById('player-form');
const categorySelectionPage = document.getElementById('category-selection');
const questionPage = document.getElementById('question-page');
const endGamePage = document.getElementById('end-game');
const playerTurnIndicator = document.createElement('h3'); // Add an indicator for player turns
const blobContainer = document.getElementById('blob-container');
const playerNamesHeader = document.getElementById('player-names');

let players = {};
let currentPlayerIndex = 0;
let currentCategory = '';
let currentQuestionIndex = 0;
let questions = [];

// API base URL
const API_BASE_URL = 'https://the-trivia-api.com/api';

// Start game button listener
startBtn.addEventListener('click', () => {
    showPage('player-setup');
    blobContainer.classList.remove('hidden'); // Show blob container on start page
});

// Player form submission listener
playerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    players = {
        player1: {
            name: document.getElementById('player1').value,
            score: 0,
        },
        player2: {
            name: document.getElementById('player2').value,
            score: 0,
        }
    };
    playerNamesHeader.innerText = `${players.player1.name} vs ${players.player2.name}`;
    playerNamesHeader.style.display = 'block'; // Display player names header
    fetchCategories();
    showPage('category-selection');
    blobContainer.classList.add('hidden'); // Hide blob container after category selection
});

// Fetch categories from the API
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        populateCategories(data);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Populate categories on the category selection page
function populateCategories(categories) {
    const categoriesContainer = document.getElementById('categories');
    categoriesContainer.innerHTML = '';
    Object.keys(categories).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.innerText = category;
        categoryDiv.addEventListener('click', () => selectCategory(category));
        categoriesContainer.appendChild(categoryDiv);
    });
}

// Select a category and fetch questions from the API
async function selectCategory(category) {
    currentCategory = category;
    try {
        const response = await fetch(`${API_BASE_URL}/questions?categories=${category}&limit=6`);
        const data = await response.json();
        questions = data; // Fetch 6 questions
        currentQuestionIndex = 0;
        showPage('question-page');
        showQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

// Show the current question and answers
function showQuestion() {
    const questionText = document.getElementById('question-text');
    const answersContainer = document.getElementById('answers');
    const currentQuestion = questions[currentQuestionIndex];

    // Update the player turn indicator
    const currentPlayer = players[`player${currentPlayerIndex + 1}`];
    playerTurnIndicator.innerText = `${currentPlayer.name}'s Turn`;
    questionPage.prepend(playerTurnIndicator);

    questionText.innerText = currentQuestion.question;
    answersContainer.innerHTML = '';
    const allAnswers = [...currentQuestion.incorrectAnswers, currentQuestion.correctAnswer];
    shuffleArray(allAnswers).forEach(answer => {
        const answerBtn = document.createElement('button');
        answerBtn.innerText = answer;
        answerBtn.addEventListener('click', () => checkAnswer(answer));
        answersContainer.appendChild(answerBtn);
    });
}

// Shuffle the answer options
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Check the selected answer and update the score
function checkAnswer(answer) {
    const currentQuestion = questions[currentQuestionIndex];
    const currentPlayer = players[`player${currentPlayerIndex + 1}`];
    if (answer === currentQuestion.correctAnswer) {
        switch (currentQuestion.difficulty) {
            case 'easy':
                currentPlayer.score += 10;
                break;
            case 'medium':
                currentPlayer.score += 15;
                break;
            case 'hard':
                currentPlayer.score += 20;
                break;
        }
    }
    currentQuestionIndex++;
    currentPlayerIndex = (currentPlayerIndex + 1) % 2; // Switch player turn
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showEndGame();
    }
}

// Show the final scores and the winner
function showEndGame() {
    showPage('end-game');
    const finalScores = document.getElementById('final-scores');
    const player1 = players.player1;
    const player2 = players.player2;
    const winner = player1.score > player2.score ? player1.name : player2.name;
    finalScores.innerText = `Winner: ${winner}\n${player1.name}: ${player1.score} vs ${player2.name}: ${player2.score}`;
}

// Show a specific page by ID
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Replay button listener
document.getElementById('replay-btn').addEventListener('click', () => {
    showPage('player-setup');
    playerNamesHeader.style.display = 'none'; // Hide player names header
    blobContainer.classList.remove('hidden'); // Show blob container on replay
});
