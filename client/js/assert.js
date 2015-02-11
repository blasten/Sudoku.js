'use strict';

module.exports = function(isTrue, message) {
    if (!isTrue) {
        throw new Error(message);
    }
};