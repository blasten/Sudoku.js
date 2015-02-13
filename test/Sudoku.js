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

    describe('#setBoard()', function() {
        it('should return true if the board is valid', function() {
            var game = Sudoku.empty();
            var valid = game.setBoard(
                'xxx|xxx|xxx' +
                'xxx|x7x|x8x' +
                'xxx|x9x|xxx' +
                '―――――――――――' +
                'xxx|x1x|xx3' +
                '3xx|x5x|xxx' +
                'xx6|xxx|xxx' +
                '―――――――――――' +
                'xxx|3xx|xxx' +
                'xx1|x2x|xxx' +
                'xx3|xx7|91x'
            );
            assert(valid);
        });
    });

    describe('#setBoard()', function() {
        it('should return false if the board is invalid', function() {
            var game = Sudoku.empty();
            var valid = game.setBoard(
                'xxx|xxx|xxx' +
                'xxx|x7x|x8x' +
                'xxx|x9x|xxx' +
                '―――――――――――' +
                'xxx|x1x|xx3' +
                '3xx|x5x|x8x' +
                'xx6|xxx|xxx' +
                '―――――――――――' +
                '1xx|3xx|xx3' +
                'xx1|x2x|x8x' +
                'xx3|xx7|91x'
            );
            assert(!valid);
        });
    });

    describe('#solve()', function() {
        it('should solve the sudoku', function() {
            var game = Sudoku.empty();
            game.setBoard(
                'xxx|xxx|xxx' +
                'xxx|x7x|x8x' +
                'xxx|x9x|xxx' +
                '―――――――――――' +
                'xxx|x1x|xx3' +
                '3xx|x5x|xxx' +
                'xx6|xxx|xxx' +
                '―――――――――――' +
                'xxx|3xx|xxx' +
                'xx1|x2x|xxx' +
                'xx3|xx7|91x'
            );
            var solution = 
                '124|538|679' +
                '539|176|284' +
                '678|294|135' +
                '―――――――――――' +
                '245|719|863' +
                '387|652|491' +
                '916|483|527' +
                '―――――――――――' +
                '892|341|756' +
                '761|925|348' +
                '453|867|912';

            game.solve();
            assert(game.isSolved());
            assert.equal(game.toString().replace(/\n/g, ''), solution);

            var game2 = Sudoku.beginner();
            game2.solve();
            assert(game2.isSolved());

            var game3 = Sudoku.expert();
            game3.solve();
            assert(game3.isSolved());
        });
    });

    describe('#toString()', function() {
        it('should return the string reprentation of the sudoku', function() {
            var game = Sudoku.empty();
            var board = 
                'xxx|xxx|xxx' +
                'xxx|x7x|x8x' +
                'xxx|x9x|xxx' +
                '―――――――――――' +
                'xxx|x1x|xx3' +
                '3xx|x5x|xxx' +
                'xx6|xxx|xxx' +
                '―――――――――――' +
                'xxx|3xx|xxx' +
                'xx1|x2x|xxx' +
                'xx3|xx7|91x';

            game.setBoard(board);
   
            assert.equal(game.toString().replace(/\n/g, ''), board);
        });
    });

    describe('#clone()', function() {
        it('should keep the same board', function() {
            var game = Sudoku.empty();
            var board = 
                'xxx|xxx|xxx' +
                'xxx|x7x|x8x' +
                'xxx|x9x|xxx' +
                '―――――――――――' +
                'xxx|x1x|xx3' +
                '3xx|x5x|xxx' +
                'xx6|xxx|xxx' +
                '―――――――――――' +
                'xxx|3xx|xxx' +
                'xx1|x2x|xxx' +
                'xx3|xx7|91x';

            game.setBoard(board);

            var gameCopy = game.clone();

            assert(game !== gameCopy);
            assert.equal(game.toString(), gameCopy.toString());
        });
    });

});