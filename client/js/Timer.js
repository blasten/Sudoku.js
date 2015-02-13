'use strict';

/**
 * Constructs a Timer
 *
 * @param selector String
 */
function Timer(selector) {
    this._container = document.querySelector(selector);
    this._timer = 0;
    this._time = 0;
    this.start();
}

Timer.prototype.start = function() {
    if (this._timer) {
        return;
    }
    this._step();
    this._timer = setInterval(this._step.bind(this), 1000);
};

Timer.prototype.stop = function() {
    if (this._timer) {
        clearInterval(this._timer);
        this._timer = 0;
    }
};

Timer.prototype.reset = function() {
    this._time = 0;
    this.stop();
    this._step();
    this._time = 0;
};

Timer.prototype._step = function() {
    var hours = parseInt(this._time / 3600);
    var minutes = parseInt(this._time / 60) % 60;
    var seconds = this._time % 60;

    var formattedTime = (hours !== 0) ?  hours + ':' : '';
    formattedTime +=  (minutes < 10) ? '0' + minutes + ':' : minutes + ':';
    formattedTime += (seconds < 10) ? '0' + seconds : seconds;

    this._container.innerHTML = formattedTime;
    this._time++;
};

module.exports = Timer;
