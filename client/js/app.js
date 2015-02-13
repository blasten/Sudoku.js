'use strict';

var domready = require('domready');
var consts = require('./constants');
var Sudoku = require('./Sudoku');
var Board = require('./Board');
var Timer = require('./Timer');

var gameBoard = null;
var sudokuGame = null;
var timer = null;
var isTouchDevice = !!('ontouchstart' in window);
var tapEventName = (isTouchDevice) ? 'touchend' : 'click';

// Builds the sudoku game and its UI
function boardFactory(difficulty) {
    sudokuGame = new Sudoku(difficulty);
    gameBoard = new Board('.sudoku-container', sudokuGame);

    if (timer) {
        timer.reset();
        timer.start();
    } else {
        timer = new Timer('.sudoku-timer');
    }

    document.body.classList.add('box-effect-game-on');
}

// Solves the game and updates the UI
function solveGame() {
    if (gameBoard) {
        if (!sudokuGame.isSolved() && !confirm('Do you really need to give up? come on')) {
            return;
        }
        sudokuGame.solve();
        gameBoard.update();
        timer.stop();
    }
}

// Clears the user input and updates the UI
function clearBoard() {
    if (gameBoard) {
        timer.start();
        sudokuGame.clearBoard(true);
        gameBoard.update();
    }
}

// Clears the game and updates the UI
function showHint() {
    if (gameBoard) {
        gameBoard.nextHint();
    }
}

// Shows the main menu
function showMenu() {
    document.body.classList.remove('box-effect-game-on');
    if (document.activeElement) {
        document.activeElement.blur();
    }
}

// Handles the event delegation for the menu items
function tapMenuHandler(event) {
    var target = event.target;
    if (target && target.hasAttribute('difficulty')) {
        switch (target.getAttribute('difficulty')) {
            case 'beginner':
                boardFactory(consts.DIFFICULTY_BEGINNER);
            break;
            case 'easy':
                boardFactory(consts.DIFFICULTY_EASY);
            break;
            case 'medium':
                boardFactory(consts.DIFFICULTY_MEDIUM);
            break;
            case 'hard':
                boardFactory(consts.DIFFICULTY_HARD);
            break;
            case 'expert':
                boardFactory(consts.DIFFICULTY_EXPERT);
            break;
        }
    }
}

// Handles the event delegation for the buttons
function tapButtonsHandler(event) {
    var button = event.target;

    if (button.classList.contains('btn-solve')) {
        solveGame();
    } else if (button.classList.contains('btn-hint')) {
        showHint();
    } else if (button.classList.contains('btn-clear')) {
        clearBoard();
    } else if (button.classList.contains('btn-back')) {
        showMenu();
    }
}

domready(function() {
    var menu = document.querySelector('.dropdown-difficulty .dropdown-menu');
    var controlGroup = document.querySelector('.sudoku-controls');

    menu.addEventListener(tapEventName, tapMenuHandler, false);
    controlGroup.addEventListener(tapEventName, tapButtonsHandler, false);
});

module.exports = {
    Sudoku: Sudoku
};

window.game = module.exports;