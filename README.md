Sudoku
===========

A fun sudoku game in vanilla javascript. Start playing it now on [blasten.github.io](http://blasten.github.io/)! 

### Compile

```$ gulp build```

You will find the build inside the folder named ``build/``.


### Test

```$ gulp test``` or ```$ make test-all```

### Implementation

There's an ``client/js/app.js`` that serves as the controller between the UI and the Sudoku class.  The ``Sudoku`` class is a standalone module that could be used with any interface such as CLI. It's based on backtracking, so it considers all the possible configurations until it finds the answer for the sudoku. Because the problem size is relatively small, we can use this approach. For more information about Sudoku solving algorithms visit http://en.wikipedia.org/wiki/Sudoku_solving_algorithms