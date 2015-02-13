'use strict';

var consts = require('./constants');

/*
 * Construct the UI for a board
 *
 * @param selector String
 * @param sudoku Sudoku
 */
function Board(selector, sudoku) {
    var wrapper = document.querySelector(selector);

    if (!(wrapper instanceof HTMLElement)) {
        throw new Error(selector + ' must be an HTMLElement');
    }

    wrapper.innerHTML = '';
    this._container = document.createElement('div');
    wrapper.appendChild(this._container);

    this._sudoku = sudoku;
    this._built = false;
    this._addEventListeners();

    // add the rest of the elements to the DOM tree
    this.build();
}
/*
 * Builds the UI for the game board
 */
Board.prototype.build = function() {
    if (this._built) {
        return;
    }

    var boxes = new Array(consts.BOARD_SIZE);
    var cells = new Array(consts.BOARD_SIZE);
    var firstUserInput;

    for (var i = 0; i < consts.BOARD_SIZE; i++) {
        boxes[i] = document.createElement('div');
        boxes[i].className = 'box';
        cells[i] = new Array(consts.BOARD_SIZE);
    }

    for (var box = 0; box < consts.BOARD_SIZE; box++) {
        var rowOffset = parseInt(box / 3) * 3;
        var columnOffset = (box % 3) * 3;

        for (var row = rowOffset; row < rowOffset + 3; row++) {
            for (var column = columnOffset; column < columnOffset + 3; column++) {
                var cell = document.createElement('div');
                cell.className = 'cell';
                
                // add text input
                var input = document.createElement('input');
                input.setAttribute('type', 'number');

                input.dataset.row = row;
                input.dataset.column = column;

                cell.appendChild(input);

                if (this._sudoku.isPredefined(row, column)) {
                    input.value = this._sudoku.getCellAt(row, column);
                    input.disabled = true;
                    cell.classList.add('cell-is-predefined');
                } else if (!firstUserInput) {
                    firstUserInput = input;
                }

                cells[row][column] = cell;
                boxes[box].appendChild(cell);
            }
        }
        this._container.appendChild(boxes[box]);
    }
    this._built = true;
    this._boxes = boxes;
    this._cells = cells;

    firstUserInput.focus();
   
};
/*
 * Refresh the game board according to the state of each cell in the game
 */
Board.prototype.update = function() {
    var isGameSolved = this._sudoku.isSolved();

    this.build();
    this._checkSolution();
    this._presentConflicts();

    this._sudoku.forEachCell(function(number, row, column) {
        var cell = this._cells[row][column];
        var input = cell.querySelector('input');

        if (number == consts.EMPTY_CELL) {
            cell.classList.remove('cell-fade-in');
            input.value = '';
        } else {
            if (isGameSolved &&  input.value != number) {
                cell.classList.add('cell-fade-in');
            } else {
                cell.classList.remove('cell-fade-in');
            }
            input.value = number;
        }
        cell.classList.remove('cell-hint');
    }, this);
};
/*
 * Get the text field for a given row and column
 */
Board.prototype.getField = function(row, column) {
    var cell = this._cells[row][column];
    var field = cell.querySelector('input');
    return field;
};
/*
 * Set the focus to a text field for given row and column
 */
Board.prototype.focusField = function(row, column) {
    var field = this.getField(row, column);
    field.focus();
    return field;
};
/*
 * Shows the next hint
 */
Board.prototype.nextHint = function() {
    var nextAnswer = this._sudoku.getNextAnswer();
    if (!nextAnswer) {
        return;
    }

    var cell = this._cells[nextAnswer.row][nextAnswer.column];
    var field = this.getField(nextAnswer.row, nextAnswer.column);

    field.blur();
    field.value = nextAnswer.answer;
    this._sudoku.setCellAt(nextAnswer.answer, nextAnswer.row, nextAnswer.column);
    this._presentConflicts();
    this._checkSolution();
    cell.classList.add('cell-hint');

    this._focusNextTextField(nextAnswer.row, nextAnswer.column);

    setTimeout(function() {
        cell.classList.remove('cell-hint');
    }, 500);
};
/*
 * Sets the focus to the text field next to a given row and column
 */
Board.prototype._focusNextTextField = function(fromRow, fromColumn) {
    fromRow = parseInt(fromRow);
    fromColumn = parseInt(fromColumn) + 1;
    var nextFieldFound = false;
    for (var row = fromRow; row < consts.BOARD_SIZE && !nextFieldFound; row++) {
        for (var column = fromColumn; column < consts.BOARD_SIZE && !nextFieldFound; column++) {
            if (!this._sudoku.isPredefined(row, column)) {
                setTimeout(this.focusField.bind(this, row, column), 200);
                nextFieldFound = true;
            }
        }
        fromColumn = 0;
    }
};
/*
 * Add all the event listeners
 */
Board.prototype._addEventListeners = function() {
    // we delegate the event handling for each text input to the this._container
    this._container.addEventListener('keydown', this._keydownHandler.bind(this), false);
};
/*
 * Handles the keydown event
 */
Board.prototype._keydownHandler = function(event) {
    var digit, row, column, conflicts;
    var input = event.target;
    var tab = 9;
    var zero = 48;

    if (event.keyCode === tab) {
        return;
    }
    if (!input && input.tagName !== 'INPUT') {
        return;
    }
    if (this._container.classList.contains('sudoku-solved')) {
        event.preventDefault();
        return false;
    }

    digit = event.keyCode - zero;
    row = input.dataset.row;
    column = input.dataset.column;

    if (digit < 1 || digit > 9) {
        input.value = '';
        this._sudoku.setCellAt(consts.EMPTY_CELL, row, column);
    } else {
        input.value = digit;
        this._sudoku.setCellAt(digit, row, column);
    }

    input.classList.remove('cell-hint');

    conflicts = this._presentConflicts();

    if (conflicts === 0 && digit >= 1 && digit <= 9) {
        this._focusNextTextField(row, column);
    }

    this._checkSolution();
    event.preventDefault();
};
/*
 * Presents the conflicts
 */
Board.prototype._presentConflicts = function() {
    var conflicts = this._sudoku.getAllConflicts();
    var cellWithConflict = {};

    conflicts.cells.forEach(function(pair) {
        cellWithConflict[pair[0] + ',' + pair[1]] = true;
    });

    this._sudoku.forEachCell(function(value, row, column) {
        var box =  this._sudoku.getBoxIndexFor(row, column);
        var cell = this._cells[row][column];

        if (cellWithConflict[row + ',' + column]) {
            cell.classList.add('cell-has-conflict');
        } else {
            cell.classList.remove('cell-has-conflict');
        }

        if (conflicts.rows.indexOf(row) !== -1) {
            cell.classList.add('row-has-conflict');
        } else {
            cell.classList.remove('row-has-conflict');
        }

        if (conflicts.columns.indexOf(column) !== -1) {
            cell.classList.add('column-has-conflict');
        } else {
            cell.classList.remove('column-has-conflict');
        }

        if (conflicts.boxes.indexOf(box) !== -1) {
            this._boxes[box].classList.add('box-has-conflict');
        } else {
            this._boxes[box].classList.remove('box-has-conflict');
        }
    }, this);

    return  conflicts.cells.length;
};

Board.prototype._checkSolution = function() {
    if (this._sudoku.isSolved()) {
        this._container.classList.add('sudoku-solved');
    } else {
        this._container.classList.remove('sudoku-solved');
    }
};

module.exports = Board;