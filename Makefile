REPORTER ?= spec

clean:
	rm -rf build

test-all:
	./node_modules/mocha/bin/mocha --ui tdd --check-leaks --colors -t 10000 --reporter $(REPORTER) ./test/*.js