const numImages = 33;
let currentMode = "view"; // Tracks the current interaction mode (view, flip, highlight)
let mysteryOpen = false; // Tracks whether the mystery container is expanded
let gameCode = ""; // Stores the game code for multiplayer functionality
const allImages = Array.from({ length: numImages }, (_, i) => `images/${i + 1}.jpg`); // Array of image paths
let suggestedQuestions = []; // Stores loaded questions for the game

// Initialize event listeners for mode switching
document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentMode = btn.getAttribute("data-mode");
    });
});

// Close the enlarged image view
document.getElementById("close-enlarged").addEventListener("click", () => {
    document.getElementById("enlarged-view").classList.add("hidden");
});

// Toggle the mystery container
document.getElementById("mystery-toggle").addEventListener("click", toggleMystery);

// Splash screen logic
document.getElementById("create-game").addEventListener("click", () => {
    createGame();
    showGameContent();
});

// Show the join game form
document.getElementById("join-game").addEventListener("click", () => {
    document.getElementById("game-controls").classList.add("hidden");
    document.getElementById("join-game-form").classList.remove("hidden");
});

// Format game code input (e.g., ABC-DEF)
document.getElementById("game-code-input").addEventListener("input", (e) => {
    const input = e.target;
    let value = input.value.replace(/-/g, "");
    if (value.length > 3) {
        value = value.slice(0, 3) + "-" + value.slice(3);
    }
    input.value = value.toUpperCase();
    document.getElementById("code-error").classList.remove("visible");
});

// Handle Enter key for game code submission
document.getElementById("game-code-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
    }
});

// Submit game code
document.getElementById("submit-code").addEventListener("click", handleSubmit);

// Cancel join game and return to splash screen
document.getElementById("cancel-join").addEventListener("click", () => {
    document.getElementById("join-game-form").classList.add("hidden");
    document.getElementById("game-controls").classList.remove("hidden");
});

// Handle image clicks based on the current mode
function handleImageClick(card) {
    if (currentMode === "view") {
        const img = card.querySelector("img");
        enlargeImage(img.src);
    } else if (currentMode === "flip") {
        card.classList.toggle("flipped");
    } else if (currentMode === "highlight") {
        const front = card.querySelector(".front");
        front.classList.toggle("highlighted");
    }
}

// Enlarge an image for detailed viewing
function enlargeImage(src) {
    const enlargedView = document.getElementById("enlarged-view");
    const enlargedImg = document.getElementById("enlarged-img");
    const enlargedText = document.getElementById("enlarged-text");

    enlargedImg.src = src;
    const imageNumber = src.match(/(\d+)\.jpg/)[1];
    enlargedText.textContent = `JD # ${imageNumber}`;
    enlargedView.classList.remove("hidden");
}

// Toggle the mystery container's visibility
function toggleMystery() {
    const mysteryContainer = document.getElementById("mystery-container");
    const toggleArrow = document.getElementById("toggle-arrow");

    if (mysteryOpen) {
        mysteryContainer.style.transform = "translateY(100%)";
        toggleArrow.textContent = "⬆";
        mysteryOpen = false;
    } else {
        mysteryContainer.style.transform = "translateY(0%)";
        toggleArrow.textContent = "⬇";
        mysteryOpen = true;
    }
}

// Show the main game content
function showGameContent() {
    document.getElementById("splash-screen").classList.add("hidden");
    document.getElementById("game-content").classList.remove("hidden");
}

// Load questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch("questions.json");
        suggestedQuestions = await response.json();
    } catch (error) {
        console.error("Failed to load questions:", error);
    }
}

// Populate the scrolling gallery with images
async function populateGallery() {
    const galleryImages = document.getElementById("gallery-images");
    const shuffledImages = shuffleArray(allImages);

    // Add two copies of the shuffled images for seamless scrolling
    shuffledImages.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        galleryImages.appendChild(img);
    });
    shuffledImages.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        galleryImages.appendChild(img);
    });
}

// Handle game code submission
function handleSubmit() {
    const inputCode = document.getElementById("game-code-input").value.trim();
    const errorMessage = document.getElementById("code-error");

    if (validateCode(inputCode)) {
        errorMessage.classList.remove("visible");
        joinGame(inputCode);
    } else {
        errorMessage.textContent = "Invalid code. Format: ABC-DEF.";
        errorMessage.classList.add("visible");
    }
}

// Generate a random game code (e.g., ABC-DEF)
function generateCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
        if (i === 2) code += "-";
    }
    return code;
}

// Validate the game code format (e.g., ABC-DEF)
function validateCode(inputCode) {
    const regex = /^[A-Z]{3}-[A-Z]{3}$/;
    return regex.test(inputCode);
}

// Generate a seeded random number for consistent randomization
function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Shuffle an array using the Fisher-Yates algorithm
function shuffleArray(array) {
    const arrClone = [...array];
    for (let i = arrClone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrClone[i], arrClone[j]] = [arrClone[j], arrClone[i]];
    }
    return arrClone;
}

// Select a random subset of items from an array
function selectRandomSubset(array, size, random) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, size);
}

// Show a random question in the toast
function showRandomQuestion() {
    if (suggestedQuestions.length === 0) return;

    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");

    const randomQuestion = 'Try asking: ' + suggestedQuestions[Math.floor(Math.random() * suggestedQuestions.length)];
    toastMessage.textContent = randomQuestion;
    toast.classList.add("visible");

    setTimeout(() => {
        toast.classList.remove("visible");
    }, 10000);
}

// Start showing random questions at intervals
function startQuestionInterval() {
    const minInterval = 20000;
    const maxInterval = 40000;

    setTimeout(() => {
        showRandomQuestion();
        setInterval(showRandomQuestion, minInterval + Math.random() * (maxInterval - minInterval));
    }, minInterval + Math.random() * (maxInterval - minInterval));
}

// Create a new game
function createGame() {
    gameCode = generateCode();
    console.log("Game Code:", gameCode);
    document.getElementById("game-code-display").textContent = `Game Code: ${gameCode}`;

    const seed = Array.from(gameCode.replace("-", "")).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = seededRandom(seed);

    const selectedImages = selectRandomSubset(allImages, 24, random);
    const mysteryIndex = Math.floor(random * selectedImages.length);
    const mysteryPerson = selectedImages[mysteryIndex];
    const shuffledImages = shuffleArray(selectedImages);

    initializeGame(shuffledImages, mysteryPerson);
}

// Join an existing game
function joinGame(inputCode) {
    const formattedCode = inputCode.replace(/-/g, "");
    const seed = Array.from(formattedCode).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = seededRandom(seed);

    const selectedImages = selectRandomSubset(allImages, 24, random);
    const creatorMysteryIndex = Math.floor(random * selectedImages.length);
    const possibleIndices = selectedImages
        .map((_, index) => index)
        .filter(index => index !== creatorMysteryIndex);

    const joinerMysteryIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
    const joinerMysteryPerson = selectedImages[joinerMysteryIndex];
    const shuffledImages = shuffleArray(selectedImages);

    initializeGame(shuffledImages, joinerMysteryPerson);
    const displayCode = formattedCode.slice(0, 3) + "-" + formattedCode.slice(3);
    document.getElementById("game-code-display").textContent = `Game Code: ${displayCode}`;
    document.getElementById("join-game-form").classList.add("hidden");
    showGameContent();
}

// Initialize the game board and mystery person
function initializeGame(selectedImages, mysteryPerson) {
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = "";

    selectedImages.forEach(src => {
        const card = document.createElement("div");
        card.classList.add("card");

        const front = document.createElement("div");
        front.classList.add("front");
        const img = document.createElement("img");
        img.src = src;
        front.appendChild(img);

        const back = document.createElement("div");
        back.classList.add("back");

        card.appendChild(front);
        card.appendChild(back);

        card.addEventListener("click", () => handleImageClick(card));
        gameBoard.appendChild(card);
    });

    const mysteryNumber = mysteryPerson.match(/(\d+)\.jpg/)[1];
    document.getElementById("mystery-img").src = mysteryPerson;
    document.getElementById("mystery-text").textContent = `Your mystery JD is #${mysteryNumber}`;

    if (!mysteryOpen) toggleMystery();
    startQuestionInterval();
}

// Initialize the gallery and load questions
function main() {
    populateGallery();
    loadQuestions();
}

main();