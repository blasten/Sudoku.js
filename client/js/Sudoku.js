'use strict';

var assert = require('./assert');
var consts = require('./constants');


function Sudoku(difficulty) {
    this.setDifficulty(difficulty);

    // allocate storage
    this._board = new Array(consts.BOARD_SIZE);
    for (var i = 0; i < consts.BOARD_SIZE; i++) {
       this._board[i] = new Array(consts.BOARD_SIZE);
    }

    this.resetGame();
}

Sudoku.prototype.clearBoard = function(onlyUserInput) {
    var row, column;
    if (onlyUserInput) {
        for (row = 0; row < consts.BOARD_SIZE; row++) {
            for (column = 0; column < consts.BOARD_SIZE; column++) {
                if (!this.isPredefined(row, column)) {
                    this._board[row][column] = consts.EMPTY_CELL;
                }
            }
        }
    } else {
        this._predefined = {};
        for (row = 0; row < consts.BOARD_SIZE; row++) {
            for (column = 0; column < consts.BOARD_SIZE; column++) {
                this._board[row][column] = consts.EMPTY_CELL;
            }
        }
    }
};

Sudoku.prototype.setDifficulty = function(difficulty) {
    assert(difficulty >= consts.DIFFICULTY_BEGINNER && difficulty <= consts.DIFFICULTY_EMPTY, 
            difficulty + ' is not a valid difficulty');

    this._difficulty = difficulty;
};

Sudoku.prototype.getDifficulty = function() {
    return this._difficulty;
};

Sudoku.prototype.resetGame = function() {
    var ii, candidate;
    var hints = [40, 30, 25, 20, 15, 0];
    var hh = hints[this._difficulty];
    var set = [];

    this.clearBoard();

    for (var i = 0, j; i < consts.BOARD_SIZE; i++) {
        for (j = 0; j < consts.BOARD_SIZE; j++) {
            set.push([i, j]);
        }
    }

    while (hh > 0 && set.length > 0) {
        ii = parseInt(Math.random() * set.length);
        candidate = set[ii];
        if (this.pickNumberForCellAt.apply(this, candidate)) {
            this._predefined[candidate[0] * consts.BOARD_SIZE + candidate[1] ] = true;
        }
        set.splice(ii, 1);
        hh--;
    }
};

Sudoku.prototype.pickNumberForCellAt = function(row, column) {
    for (var guess = 1; guess <= 9; guess++) {
        if (this.isSolutionFor(guess, row, column)) {
            this._board[row][column] = guess;
            return guess;
        }
    }

    this._board[row][column] = consts.EMPTY_CELL;
    return 0;
};

Sudoku.prototype.isSolutionFor = function(guess, row, column) {
    return this.getConflictsFor(guess, row, column, true).length === 0;
};

Sudoku.prototype.getConflictsFor = function(guess, row, column, onlyOne) {
    assert(guess >= 1 && guess <= 9, 'Guess should be in range [1-9]');
    assert(row >= 0 && row <= consts.BOARD_SIZE, 'Invalid row ' + row);
    assert(column >= 0 && column <= consts.BOARD_SIZE, 'Invalid column ' + column);

    onlyOne = (onlyOne === true);

    var gridY, gridX;
    var gridOffsetY = parseInt(row / 3) * 3;
    var gridOffsetX = parseInt(column / 3) * 3;
    var conflictsDic = {};
    var conflicts = [];
    var currentValue = this._board[row][column];

    function addConflict(row, column, conflictsDic, conflicts) {
        if (!conflictsDic[row + ',' + column]) {
            conflictsDic[row + ',' + column] = true;
            conflicts.push([row, column]);
        }
    }

    this._board[row][column] = consts.EMPTY_CELL;

    for (var i = 0; i < consts.BOARD_SIZE && ((onlyOne && conflicts.length < 1) || !onlyOne); i++) {
        if (this._board[i][column] === guess) {
            addConflict(i, column, conflictsDic, conflicts);
        }
        if (this._board[row][i] === guess) {
            addConflict(row, i, conflictsDic, conflicts);
        }
        gridY = gridOffsetY + parseInt(i / 3);
        gridX = gridOffsetX + (i % 3);

        if (this._board[gridY][gridX] === guess) {
            addConflict(gridY, gridX, conflictsDic, conflicts);
        }
    }

    this._board[row][column] = currentValue;

    return conflicts;
};

Sudoku.prototype.setBoard = function(board) {
    assert(typeof board === 'string', 'The board should be a string');

    var character, digit, row, column, ii = 0;
    var zero = 48;
    var empty = 120;

    this.clearBoard();

    for (var i = 0; i < board.length; i++) {
        character = board.charCodeAt(i);
        digit = character - zero;

        if (character === empty) {
            ii++;
        } else if (digit >= 1 && digit <= 9) {
            row = parseInt(ii / consts.BOARD_SIZE);
            column = ii % consts.BOARD_SIZE;

            if (this.isSolutionFor(digit, row, column)) {
                this._board[row][column] = digit;
                this._predefined[ii] = true;
            } else {
                this.clearBoard();
                return false;
            }
            ii++;
        }
    }
    return true;
};

Sudoku.prototype.isPredefined = function(row, column) {
    return this._predefined[row * consts.BOARD_SIZE + column] === true;
};

Sudoku.prototype.solve = function() {
    function solve(row, column) {
        /*jshint validthis:true */
        var num, nextRow, nextColumn;

        if (row >= consts.BOARD_SIZE || column >= consts.BOARD_SIZE) {
            return true;
        }

        if (column + 1 < consts.BOARD_SIZE) {
            nextRow = row;
            nextColumn = column + 1;
        } else {
            nextRow = row + 1;
            nextColumn = 0;
        }

        if (this.isPredefined(row, column)) {
            return solve.call(this, nextRow, nextColumn);
        }

        for (num = 1; num <= 9; num++) {
            if (!this.isSolutionFor(num, row, column)) {
                continue;
            }

            this._board[row][column] = num;

            if (solve.call(this, nextRow, nextColumn)) {
                return true;
            } else {
                // backtrack
                this._board[row][column] = consts.EMPTY_CELL;
            }
        }
    }

    this.clearBoard(true);
    return solve.call(this, 0, 0);
};

Sudoku.prototype.isSolved = function() {
    for (var row = 0; row < consts.BOARD_SIZE; row++) {
        for (var column = 0; column < consts.BOARD_SIZE; column++) {
            if (this.isPredefined(row, column)) {
                continue;
            }
            if (this._board[row][column] === consts.EMPTY_CELL) {
                return false;
            }
            if (!this.isSolutionFor(this._board[row][column], row, column)) {
                return false;
            }
        }
    }
    return true;
};

Sudoku.prototype.toString = function() {
    var str = '';
    for (var row = 0; row < consts.BOARD_SIZE; row++) {
        for (var column = 0; column < consts.BOARD_SIZE; column++) {
            if (this._board[row][column] ===  consts.EMPTY_CELL) {
                str += 'x';
            } else {
                str += this._board[row][column];
            }
            if (column > 0 && (column+1) % 3 === 0 && column+1 < consts.BOARD_SIZE) {
                str += '|';
            }
        }
        str += '\n';
        if (row > 0 && (row+1) % 3 === 0 && row+1 < consts.BOARD_SIZE) {
            str += '―――――――――――';
            str += '\n';
        }
    }

    return str;
};

Sudoku.prototype.clone = function() {
    var copy = Sudoku.empty();
    for (var row = 0; row < consts.BOARD_SIZE; row++) {
        for (var column = 0; column < consts.BOARD_SIZE; column++) {
            copy._board[row][column] = this._board[row][column];
        }
    }
    return copy;
};

Sudoku.prototype.forEachCell = function(fn) {
    var copy = Sudoku.empty();
    for (var row = 0; row < consts.BOARD_SIZE; row++) {
        for (var column = 0; column < consts.BOARD_SIZE; column++) {
            fn.call(this, this._board[row][column], this.isPredefined(row, column), row, column);
        }
    }
    return copy;
};

Sudoku.prototype.forValueAtCell = function(row, column) {
    return this._board[row][column];
};

Sudoku.beginner = function() {
    return new Sudoku(consts.DIFFICULTY_BEGINNER);
};

Sudoku.easy = function() {
    return new Sudoku(consts.DIFFICULTY_EASY);
};

Sudoku.medium = function() {
    return new Sudoku(consts.DIFFICULTY_MEDIUM);
};

Sudoku.hard = function() {
    return new Sudoku(consts.DIFFICULTY_HARD);
};

Sudoku.expert = function() {
    return new Sudoku(consts.DIFFICULTY_EXPERT);
};

Sudoku.empty = function() {
    return new Sudoku(consts.DIFFICULTY_EMPTY);
};

module.exports = Sudoku;