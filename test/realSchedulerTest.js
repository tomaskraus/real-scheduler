require('tap').mochaGlobals();
var assert = require('assert');


var RealScheduler = require('../src/RealScheduler');

var isStopCalled;
var isDeltaCalled;

var onStopHandler = function () {
    isStopCalled = true;
};
var onDeltaHandler = function () {
    isDeltaCalled = true;
};

var busyWait = function(delay) {
    var startTime = new Date();
    var currentTime = new Date();
    while (currentTime - startTime < delay) {
        currentTime = new Date();
    }
};

beforeEach(function () {
    isStopCalled = false;
    isDeltaCalled = false;
});


describe('RealScheduler', function () {
    it('1st call returns syntheticTime equals to delay', function (done) {
        var scheduler = new RealScheduler((sch) => {

            sch.stop();
            assert.equal(sch.getSyntheticTimeElapsed(), 100);
            assert(sch.getTimeElapsed() > 0);
            done();
        }, 100);
    });

    it('1st call returns numberOfCalls equals to 1', function (done) {
        var scheduler = new RealScheduler((sch) => {

            sch.stop();
            assert.equal(sch.getNumberOfCalls(), 1);
            assert.equal(sch.getStatistics().numberOfCalls, 1);
            assert(sch.getTimeElapsed() > 0);
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

    it('Call onDeltaError handler if defined', function (done) {
        var scheduler = new RealScheduler((sch) => {
            if (sch.getNumberOfCalls() == 8) {
                busyWait(500);
            }
            if (sch.getNumberOfCalls() == 10) {
                sch.stop();
                assert.equal(sch.getNumberOfCalls(), 10);
                assert.equal(isDeltaCalled, true);
                done();
            }
        }, 100, { onStop: onStopHandler, onDeltaError: onDeltaHandler });
    });
});



