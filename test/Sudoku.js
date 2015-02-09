var assert = require('assert');
var Sudoku = require('../client/js/Sudoku');
var consts = require('../client/js/constants');

describe('Sudoku', function() {
    describe('.beginner()', function() {
        it('should create a board', function() {
            var game = Sudoku.beginner();
            assert.equal(game.getDifficulty(), consts.DIFFICULTY_BEGINNER);
        });
    });

    describe('.easy()', function() {
        it('should create a board', function() {
            var game = Sudoku.easy();
            assert.equal(game.getDifficulty(), consts.DIFFICULTY_EASY);
        });
    });

    describe('.medium()', function() {
        it('should create a board', function() {
            var game = Sudoku.medium();
            assert.equal(game.getDifficulty(), consts.DIFFICULTY_MEDIUM);
        });
    });

    describe('.hard()', function() {
        it('should create a board', function() {
            var game = Sudoku.hard();
            assert.equal(game.getDifficulty(), consts.DIFFICULTY_HARD);
        });
    });

    describe('.expert()', function() {
        it('should create a board', function() {
            var game = Sudoku.expert();
            assert.equal(game.getDifficulty(), consts.DIFFICULTY_EXPERT);
        });
    });

    describe('.empty()', function() {
        it('should create a board', function() {
            var game = Sudoku.empty();
            assert.equal(game.getDifficulty(), consts.DIFFICULTY_EMPTY);
        });
    });
});