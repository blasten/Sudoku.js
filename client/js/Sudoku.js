'use strict';

var assert = require('./assert');
var consts = require('./constants');

/**
 * Constructs a Sudoku
 *
 * @param difficulty Number[0-5] for the difficulty
 * check ./constants for more information
 */
function Sudoku(difficulty) {
    this.setDifficulty(difficulty);

    // allocate storage
    this._hasSolution = false;
    this._board = new Array(consts.BOARD_SIZE);
    this._solution = new Array(consts.BOARD_SIZE);

    for (var i = 0; i < consts.BOARD_SIZE; i++) {
        this._board[i] = new Array(consts.BOARD_SIZE);
        this._solution[i] = new Array(consts.BOARD_SIZE);
    }

    this.resetGame();
}
/**
 * Clears the game board
 *
 * @param onlyUserInput Boolean true if you want to only clear the values the user entered
 */
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
        this._hasSolution = false;

        for (row = 0; row < consts.BOARD_SIZE; row++) {
            for (column = 0; column < consts.BOARD_SIZE; column++) {
                this._board[row][column] = consts.EMPTY_CELL;
            }
        }
    }
};
/**
 * Sets the difficulty
 *
 * @param difficulty Number[0-5] for the difficulty
 */
Sudoku.prototype.setDifficulty = function(difficulty) {
    assert(difficulty >= consts.DIFFICULTY_BEGINNER && difficulty <= consts.DIFFICULTY_EMPTY, 
            difficulty + ' is not a valid difficulty');

    this._difficulty = difficulty;
};
/**
 * Gets the difficulty
 *
 * @return Number[0-5] the current difficulty
 */
Sudoku.prototype.getDifficulty = function() {
    return this._difficulty;
};
/**
 * Resets the game, that is, it will create a whole new game
 *
 */
Sudoku.prototype.resetGame = function() {
    var ii, candidate;
    var hints = [40, 30, 25, 20, 15, 0];
    var hh = (consts.BOARD_SIZE * consts.BOARD_SIZE) - hints[this._difficulty];
    var set = [];

    // clear the game board
    this.clearBoard();
    // build a solution
    this._solveGame(true);

    for (var row = 0, column; row < consts.BOARD_SIZE; row++) {
        for (column = 0; column < consts.BOARD_SIZE; column++) {
            // insert the pair into a set that will hold all the predefined or preselected values
            set.push([row, column]);
            this._predefined[row * consts.BOARD_SIZE + column] = true;
            this._solution[row][column] = this._board[row][column];
        }
    }
    // lets take values out of the set and define them as empty cells
    while (hh > 0 && set.length > 0) {
        ii = parseInt(Math.random() * set.length);
        candidate = set[ii];
        
        this._board[candidate[0]][candidate[1]] = consts.EMPTY_CELL;
        this._predefined[candidate[0] * consts.BOARD_SIZE + candidate[1]] = false;

        set.splice(ii, 1);
        hh--;
    }

    this._hasSolution = true;
};
/**
 * Gets all the user values that are causing conflicts with another values
 *
 * @return Object
 */
Sudoku.prototype.getAllConflicts = function() {
    var currentBox, subConflict, conflictBox, subsetConflicts;
    var added = {};
    var conflictCells = [], conflictRows = [], conflictColumns = [], conflictBoxes = [];

    for (var row = 0; row < consts.BOARD_SIZE; row++) {
        for (var column = 0; column < consts.BOARD_SIZE; column++) {
            if (this.isPredefined(row, column)) {
                continue;
            }
            if (this._board[row][column] === consts.EMPTY_CELL) {
                continue;
            }

            subsetConflicts = this.getConflictsFor(this._board[row][column], row, column);
            currentBox = this.getBoxIndexFor(row, column);

            if (subsetConflicts.length > 0) {
                if (!added[row + ',' + column]) {
                    added[row + ',' + column] = true;
                    conflictCells.push([row, column]);
                }
            }
            for (var i = 0; i < subsetConflicts.length; i++) {
                subConflict = subsetConflicts[i];
                conflictBox = this.getBoxIndexFor(subConflict[0], subConflict[1]);

                if (currentBox != conflictBox) {
                    if (subConflict[0] === row && conflictRows.indexOf(subConflict[0]) === -1) {
                        conflictRows.push(subConflict[0]);
                    }
                    if (subConflict[1] == column && conflictColumns.indexOf(subConflict[1]) === -1) {
                        conflictColumns.push(subConflict[1]);
                    }
                } else {
                    if (conflictBoxes.indexOf(conflictBox) === -1) {
                        conflictBoxes.push(conflictBox);
                    }
                }
                if (!added[subConflict[0] + ',' + subConflict[1]]) {
                    added[subConflict[0] + ',' + subConflict[1]] = true;
                    conflictCells.push(subConflict);
                }
            }
        }
    }

    return {
        cells: conflictCells,
        rows: conflictRows,
        columns: conflictColumns,
        boxes: conflictBoxes
    };
};
/**
 * Gets the box index for a cell at a given row and column
 *
 * @return Number in range the [0-8]
 */
Sudoku.prototype.getBoxIndexFor = function(row, column) {
    return parseInt(row/3) * 3 + parseInt(column/3);
};
/**
 * Gets the box index for a cell at a given row and column
 *
 * @return Number in range the [0-8]
 */
Sudoku.prototype.isSolutionFor = function(guess, row, column) {
    return this.getConflictsFor(guess, row, column, true).length === 0;
};
/**
 * Lists the possible conflicts if avalue is placed at a given row and column
 *
 * @param guess Number
 * @param row Number
 * @param column Number
 * @param onlyOne Boolean 
 * @return Array of pairs where the 1st value in the pair represents the row and the 2sd the column 
 */
Sudoku.prototype.getConflictsFor = function(guess, row, column, onlyOne) {
    guess = parseInt(guess);
    row = parseInt(row);
    column = parseInt(column);

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
/**
 * Tries to set an arbitrary configuration. 
 * The process may fail if the configuration can't be a valid sudoku
 *
 * @param board String
 * @param row Number
 * @param column Number
 * @param onlyOne Boolean 
 * @return Array of pairs where the 1st value in the pair represents the row and the 2sd the column 
 */
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
/**
 * Returns true if the value at a given row and column was predefined or preassigned by the system
 *
 * @return Boolean
 */
Sudoku.prototype.isPredefined = function(row, column) {
    return this._predefined[row * consts.BOARD_SIZE + column] === true;
};
/**
 * Solves the puzzle
 *
 * @return Boolean true if it was successfully solved
 */
Sudoku.prototype.solve = function() {
 
    if (this._hasSolution) {
        // if know a solution for it
        for (var row = 0; row < consts.BOARD_SIZE; row++) {
            for (var column = 0; column < consts.BOARD_SIZE; column++) {
                if (!this.isPredefined(row, column)) {
                    this._board[row][column] = this._solution[row][column];
                }
            }
        }
        return true;
    } else {
        return this._solveGame(false); 
    }
};
/**
 * Solves a game
 * This is a backtracking algorithm, or a simple brute force :( 
 * where we generate all the possible configurations until we find a solution for our original problem
 *
 * @return Boolean true if the game was successfully solved
 */
Sudoku.prototype._solveGame = function(random) {
    var options = [];
    for (var num = 1; num <= 9; num++) {
        options.push(num);
    }

    if (random) {
        // shuffle the array
        options.sort(function() {
            return parseInt(Math.random() * 3) - 1;
        });
    }
 
    function solve(row, column) {
        /*jshint validthis:true */
        var num, nextRow, nextColumn;

        if (row >= consts.BOARD_SIZE) {
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

        for (num = 0; num < 9; num++) {
            if (!this.isSolutionFor(options[num], row, column)) {
                continue;
            }

            this._board[row][column] = options[num];

            if (solve.call(this, nextRow, nextColumn)) {
                return true;
            } else {
                // backtrack
                this._board[row][column] = consts.EMPTY_CELL;
            }
        }
        return false;
    }

    this.clearBoard(true);
    return solve.call(this, 0, 0);
};
/**
 * Checks whether the game is solved
 *
 * @return Boolean true if the game was already solved
 */
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
/**
 * Returns the string representation for the game
 *
 * @return String
 */
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

/**
 * Clones the current state of the game
 *
 * @return Sudoku
 */
Sudoku.prototype.clone = function() {
    var copy = Sudoku.empty();
    for (var row = 0; row < consts.BOARD_SIZE; row++) {
        for (var column = 0; column < consts.BOARD_SIZE; column++) {
            copy._board[row][column] = this._board[row][column];
        }
    }
    return copy;
};
/**
 * Interates through each cell in the board
 *
 * @param fn Function
 * @param target Object The target that fn will be bound to
 * @return Sudoku
 */
Sudoku.prototype.forEachCell = function(fn, target) {
    target = target || this;
    var copy = Sudoku.empty();
    for (var row = 0; row < consts.BOARD_SIZE; row++) {
        for (var column = 0; column < consts.BOARD_SIZE; column++) {
            fn.call(target, this._board[row][column], row, column);
        }
    }
    return copy;
};
/**
 * Gets the value stored at a cell at a given row and column
 *
 * @param row Number
 * @param column Number
 * @return Number
 */
Sudoku.prototype.getCellAt = function(row, column) {
    return this._board[row][column];
};
/**
 * Sets the value for a cell at a given row and column
 *
 * @param num Number
 * @param row Number
 * @param column Number
 */
Sudoku.prototype.setCellAt = function(num, row, column) {
    num = parseInt(num);
    row = parseInt(row);
    column = parseInt(column);

    if (!this.isPredefined(row, column)) {
        this._board[row][column] = num;
    }
};
/**
 * Gets the next value that will solve the puzzle
 *
 * @return Object
 */
Sudoku.prototype.getNextAnswer = function() {
     for (var row = 0; row < consts.BOARD_SIZE; row++) {
        for (var column = 0; column < consts.BOARD_SIZE; column++) {
            if (this.isPredefined(row, column)) {
                continue;
            }
            if (this._board[row][column] === this._solution[row][column]) {
                continue;
            }
            return {
                row: row,
                column: column,
                answer: this._solution[row][column]
            };
        }
    }
    return null;
};

/**
 * Factory methods
 */
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