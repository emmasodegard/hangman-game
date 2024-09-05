// Import necessary modules
import * as readlinePromises from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ANSI } from './ansi.mjs';
import { HANGMAN_UI } from './graphics.mjs';

// Set up the readline interface for user input
const rl = readlinePromises.createInterface({ input, output });

// Random words for the game
const RANDOM_WORDS = [
    'elephant', 'giraffe', 'kangaroo', 'penguin', 'coconut', 'laptop',
    'bicycle', 'chocolate', 'mountain', 'river', 'jungle', 'volcano',
    'diamond', 'unicorn', 'wizard', 'robot'
];

// Game messages
const PLAYER_TEXT = {
    WIN: "You won!",
    LOSE: `You lost! The word was: `,
    PLAY_AGAIN: "Type 'next' to play again, or 'exit' to quit: ",
    CHOICE: "Guess a letter or the full word: "
};

// Stats to track games played, won, and lost
const STATS = {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0
};

// Set up initial game state
let correctWord, guessedWord, wrongGuesses, isGameOver;
const maxAttempts = HANGMAN_UI.length - 1; // Max attempts based on hangman steps

// Function to reset the game state
function resetGame() {
    correctWord = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)].toLowerCase();
    guessedWord = "_".repeat(correctWord.length).split('');
    wrongGuesses = [];
    isGameOver = false;
    STATS.gamesPlayed++; // Increment games played
}

// Main game loop
async function playGame() {
    resetGame(); // Reset game state before starting
    while (!isGameOver) {
        console.clear();
        console.log(ANSI.CLEAR_SCREEN);
        console.log(`Word: ${guessedWord.join(" ")}`);
        console.log(`Wrong guesses: ${wrongGuesses.join(", ")}`);
        console.log(HANGMAN_UI[wrongGuesses.length]);

        // Check if the number of wrong guesses has reached the max attempts
        if (wrongGuesses.length >= maxAttempts) {
            console.log(PLAYER_TEXT.LOSE + correctWord);
            STATS.gamesLost++; // Increment games lost
            isGameOver = true;
            break;
        }

        let guess = (await askQuestion(PLAYER_TEXT.CHOICE)).toLowerCase();

        // Full-word guess
        if (guess.length > 1) {
            if (guess === correctWord) {
                guessedWord = correctWord.split('');
                isGameOver = true;
                console.log(PLAYER_TEXT.WIN);
                STATS.gamesWon++; // Increment games won
            } else {
                // Incorrect full word guess: add as a wrong guess and update hangman
                handleWrongGuess(guess);
            }
        }
        // Single-letter guess
        else if (guess.length === 1) {
            if (correctWord.includes(guess)) {
                for (let i = 0; i < correctWord.length; i++) {
                    if (correctWord[i] === guess) {
                        guessedWord[i] = guess;
                    }
                }
                if (!guessedWord.includes("_")) {
                    isGameOver = true;
                    console.log(PLAYER_TEXT.WIN);
                    STATS.gamesWon++; // Increment games won
                }
            } else {
                // Incorrect single-letter guess: add as a wrong guess and update hangman
                handleWrongGuess(guess);
            }
        }
    }
    await askToPlayAgain(); // Prompt to play again or exit
}

// Function to handle wrong guesses (both letters and full words)
function handleWrongGuess(guess) {
    if (!wrongGuesses.includes(guess)) {
        wrongGuesses.push(guess); // Add to wrong guesses
    }
}

// Function to ask the player if they want to play again
async function askToPlayAgain() {
    let answer = (await askQuestion(PLAYER_TEXT.PLAY_AGAIN)).toLowerCase();
    if (answer === 'next') {
        playGame(); // Restart the game
    } else {
        showStats(); // Show stats before exiting
        rl.close(); // Close the input stream and exit
        process.exit();
    }
}

// Show the game statistics
function showStats() {
    console.log(ANSI.CLEAR_SCREEN);
    console.log(ANSI.COLOR.BLUE + "\nGame Statistics:\n" + ANSI.RESET);
    console.log(`Games Played: ${STATS.gamesPlayed}`);
    console.log(`Games Won: ${STATS.gamesWon}`);
    console.log(`Games Lost: ${STATS.gamesLost}`);
}

// Utility function to ask a question using readline promises
async function askQuestion(question) {
    return await rl.question(question);
}

// Start the game
playGame();