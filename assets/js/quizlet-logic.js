// assets/js/quizlet-logic.js

// This script will only run on the quizlet.html page due to specific element IDs.

let flashcards = []; // Stores objects like { term: "...", definition: "..." }
let currentQuizQuestionIndex = 0;
let currentQuizCard = null;

// DOM Elements
const addCardForm = document.getElementById('addCardForm');
const termInput = document.getElementById('termInput');
const definitionInput = document.getElementById('definitionInput');
const cardListDiv = document.getElementById('cardList');
const startQuizBtn = document.getElementById('startQuizBtn');
const quizArea = document.getElementById('quizArea');
const quizMessage = document.getElementById('quizMessage');
const quizQuestionElem = document.getElementById('quizQuestion');
const quizForm = document.getElementById('quizForm');
const quizFeedback = document.getElementById('quizFeedback');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');

// --- Functions for managing Flashcards ---

function renderFlashcards() {
    if (!cardListDiv) return; // Ensure element exists (only on quizlet.html)

    cardListDiv.innerHTML = ''; // Clear existing list
    if (flashcards.length === 0) {
        cardListDiv.innerHTML = '<p>No flashcards added yet. Add some above!</p>';
        if (startQuizBtn) startQuizBtn.style.display = 'none'; // Hide quiz button if no cards
        if (quizArea) quizArea.style.display = 'none';
        if (quizMessage) quizMessage.textContent = '';
        return;
    }

    if (startQuizBtn) startQuizBtn.style.display = 'block'; // Show quiz button if cards exist
    flashcards.forEach((card, index) => {
        const cardItem = document.createElement('div');
        cardItem.className = 'card-item';
        cardItem.innerHTML = `
            <span><strong>${card.term}:</strong> ${card.definition}</span>
            <button data-index="${index}">Delete</button>
        `;
        cardListDiv.appendChild(cardItem);
    });

    // Add event listeners for delete buttons
    cardListDiv.querySelectorAll('.card-item button').forEach(button => {
        button.addEventListener('click', (event) => {
            const indexToDelete = event.target.dataset.index;
            deleteFlashcard(indexToDelete);
        });
    });
}

function addFlashcard(term, definition) {
    if (term.trim() && definition.trim()) {
        flashcards.push({ term: term.trim(), definition: definition.trim() });
        termInput.value = '';
        definitionInput.value = '';
        renderFlashcards();
    }
}

function deleteFlashcard(index) {
    flashcards.splice(index, 1);
    renderFlashcards();
}

// --- Functions for Quiz ---

async function generateAIConsistentIncorrectAnswers(correctAnswer, allDefinitions, numIncorrect = 3) {
    // THIS IS A PLACEHOLDER FOR AI INTEGRATION.
    // Replace this with a real API call to an AI model (e.g., Google Gemini, OpenAI).
    // The most secure way is to use a backend server to call the AI API.

    console.log("AI would generate incorrect answers here based on:", correctAnswer, allDefinitions);

    const incorrectAnswers = [];
    const availableDefinitions = allDefinitions.filter(def => def !== correctAnswer);

    // Shuffle and pick from available definitions as a fallback/mock-up
    for (let i = availableDefinitions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableDefinitions[i], availableDefinitions[j]] = [availableDefinitions[j], availableDefinitions[i]];
    }

    for (let i = 0; i < numIncorrect && i < availableDefinitions.length; i++) {
        incorrectAnswers.push(availableDefinitions[i]);
    }

    // Fallback if not enough distinct definitions are available from other cards
    while (incorrectAnswers.length < numIncorrect) {
        // You could make these more generic or thematic if you know the subject matter
        incorrectAnswers.push("A plausible but incorrect alternative.");
    }

    return incorrectAnswers;
}

async function startQuiz() {
    if (!quizMessage || !quizArea || !startQuizBtn) return;

    if (flashcards.length < 2) {
        quizMessage.textContent = "You need at least 2 flashcards to start a quiz!";
        quizArea.style.display = 'none';
        return;
    }

    quizMessage.textContent = '';
    quizArea.style.display = 'block';
    startQuizBtn.style.display = 'none';
    currentQuizQuestionIndex = 0;
    shuffleArray(flashcards); // Randomize order of questions for each quiz start
    displayNextQuestion();
}

async function displayNextQuestion() {
    if (!quizForm || !quizFeedback || !nextQuestionBtn) return;

    quizForm.innerHTML = '';
    quizFeedback.style.display = 'none';
    nextQuestionBtn.style.display = 'none';

    if (currentQuizQuestionIndex >= flashcards.length) {
        if (quizQuestionElem) quizQuestionElem.textContent = "Quiz Complete! You've gone through all your cards.";
        quizForm.innerHTML = '';
        if (startQuizBtn) startQuizBtn.style.display = 'block'; // Allow starting a new quiz
        return;
    }

    currentQuizCard = flashcards[currentQuizQuestionIndex];
    if (quizQuestionElem) quizQuestionElem.textContent = `What is the definition of "${currentQuizCard.term}"?`;

    const allDefinitions = flashcards.map(card => card.definition);
    const incorrectOptions = await generateAIConsistentIncorrectAnswers(
        currentQuizCard.definition,
        allDefinitions.filter(def => def !== currentQuizCard.definition) // Pass other definitions
    );

    let options = [currentQuizCard.definition, ...incorrectOptions];
    shuffleArray(options); // Shuffle options to randomize correct answer position

    options.forEach((option, index) => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="radio" name="quizOption" value="${option}" data-index="${index}"> ${option}`;
        quizForm.appendChild(label);
    });

    // Add submit button for the current question
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Submit Answer';
    quizForm.appendChild(submitBtn);

    // Re-attach event listener for the form submission
    quizForm.addEventListener('submit', handleQuizSubmit, { once: true }); // Ensure handler runs only once per submit
}

function handleQuizSubmit(event) {
    if (!quizForm || !quizFeedback || !nextQuestionBtn) return;

    event.preventDefault();
    quizFeedback.style.display = 'block';

    const selectedOption = quizForm.querySelector('input[name="quizOption"]:checked');

    if (!selectedOption) {
        quizFeedback.className = 'feedback';
        quizFeedback.textContent = 'Please select an answer!';
        // Re-add event listener if nothing was selected, as 'once: true' would remove it.
        quizForm.addEventListener('submit', handleQuizSubmit, { once: true });
        return;
    }

    const userAnswer = selectedOption.value;
    const correctAnswer = currentQuizCard.definition;

    if (userAnswer === correctAnswer) {
        quizFeedback.className = 'feedback correct';
        quizFeedback.textContent = 'Correct!';
    } else {
        quizFeedback.className = 'feedback incorrect';
        quizFeedback.textContent = `Incorrect. The correct answer was: "${correctAnswer}"`;
    }

    nextQuestionBtn.style.display = 'block';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- Event Listeners ---
// Only add event listeners if the elements exist on the page.
// This prevents errors if this script is mistakenly included on other pages.

document.addEventListener('DOMContentLoaded', () => {
    if (addCardForm) {
        addCardForm.addEventListener('submit', (event) => {
            event.preventDefault();
            addFlashcard(termInput.value, definitionInput.value);
        });
    }

    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startQuiz);
    }

    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            currentQuizQuestionIndex++;
            displayNextQuestion();
        });
    }

    // Initial Render
    if (cardListDiv) { // Ensure this only runs on the quizlet page
        renderFlashcards();
    }
});
