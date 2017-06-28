require('tap').mochaGlobals();
var assert = require('assert');


var RealScheduler = require('../src/RealScheduler');

var isStopCalled;

var onStopHandler = function () {
    isStopCalled = true;
}

beforeEach(function () {
    isStopCalled = false;
});


describe('RealScheduler', function () {
    it('1st call returns syntheticTime equals to delay', function (done) {
        var scheduler = new RealScheduler((sch) => {

            sch.stop();
            assert.equal(sch.getSyntheticTimeElapsed(), 100);
            done();
        }, 100);
    });

    it('1st call (with waitForTheFirstCall option false) returns syntheticTime equals to 0', function (done) {
        var scheduler = new RealScheduler((sch) => {

            sch.stop();
            assert.equal(sch.getSyntheticTimeElapsed(), 0);
            done();
        }, 100, { waitForTheFirstCall: false });
    });

    it('Call onStop handler if defined', function (done) {
        var scheduler = new RealScheduler((sch) => {

            sch.stop();
            assert.equal(isStopCalled, true);
            done();
        }, 100, { onStop: onStopHandler });
    });
});



