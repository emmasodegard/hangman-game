import * as readlinePromises from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ANSI } from './ansi.mjs';
import { HANGMAN_UI } from './graphics.mjs';

const rl = readlinePromises.createInterface({ input, output });

const RANDOM_WORDS = [
    'elephant', 'giraffe', 'kangaroo', 'penguin', 'coconut', 'laptop',
    'bicycle', 'chocolate', 'mountain', 'river', 'jungle', 'volcano',
    'diamond', 'unicorn', 'wizard', 'robot',
    'banana', 'strawberry', 'watermelon', 'grapefruit', 'pineapple',
    'keyboard', 'monitor', 'backpack', 'notebook', 'headphones'
];

const PLAYER_TEXT = {
    WIN: ANSI.COLOR.GREEN + "You won!" + ANSI.RESET,
    LOSE: ANSI.COLOR.RED + "You lost! The word was: " + ANSI.RESET,
    PLAY_AGAIN: "Type 'next' to play again, or 'exit' to quit: ",
    CHOICE: "Guess a letter or the full word: ",
};

const STATS = {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0
};

let correctWord, guessedWord, wrongGuesses, isGameOver;
const maxAttempts = HANGMAN_UI.length - 1;

function resetGame() {
    correctWord = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)].toLowerCase();
    guessedWord = "_".repeat(correctWord.length).split('');
    wrongGuesses = [];
    isGameOver = false;
    STATS.gamesPlayed++;
}

async function playGame() {
    resetGame();
    while (!isGameOver) {
        console.clear();
        console.log(ANSI.CLEAR_SCREEN);
        console.log(`Word: ${guessedWord.join(" ")}`);
        console.log(`Wrong guesses: ${wrongGuesses.join(", ")}`);
        console.log(HANGMAN_UI[wrongGuesses.length]);

        if (wrongGuesses.length >= maxAttempts) {
            console.log(PLAYER_TEXT.LOSE + correctWord);
            STATS.gamesLost++;
            isGameOver = true;
            break;
        }

        let guess = (await askQuestion(PLAYER_TEXT.CHOICE)).toLowerCase();


        if (guess.length > 1) {
            if (guess === correctWord) {
                guessedWord = correctWord.split('');
                isGameOver = true;
                console.log(PLAYER_TEXT.WIN);
                STATS.gamesWon++;
            } else {
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
                    STATS.gamesWon++;
                }
            } else {
                handleWrongGuess(guess);
            }
        }
    }
    await askToPlayAgain();
}

function handleWrongGuess(guess) {
    if (!wrongGuesses.includes(guess)) {
        wrongGuesses.push(guess);
    }
}

async function askToPlayAgain() {
    let answer = (await askQuestion(PLAYER_TEXT.PLAY_AGAIN)).toLowerCase();
    if (answer === 'next') {
        playGame();
    } else {
        showStats();
        rl.close();
        process.exit();
    }
}

function showStats() {
    console.log(ANSI.CLEAR_SCREEN);
    console.log(ANSI.COLOR.BLUE + "\nGame Statistics:\n" + ANSI.RESET);
    console.log(`Games Played: ${STATS.gamesPlayed}`);
    console.log(`Games Won: ${STATS.gamesWon}`);
    console.log(`Games Lost: ${STATS.gamesLost}`);
}

async function askQuestion(question) {
    return await rl.question(question);
}

playGame();