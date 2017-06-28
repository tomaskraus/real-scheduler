require('tap').mochaGlobals();
var assert = require('assert');


var RealScheduler = require('../src/RealScheduler');



describe('RealScheduler', function() {
    it('1st call returns syntheticTime equals to delay', function(done) {
        var scheduler = new RealScheduler((sch) => {

        sch.stop();
        assert.equal(sch.getSyntheticTimeElapsed(), 100);
        done();
    }, 100);
    });
});

describe('RealScheduler', function() {
    it('1st call (with waitForTheFirstCall option false) returns syntheticTime equals to 0', function(done) {
        var scheduler = new RealScheduler((sch) => {

        sch.stop();
        assert.equal(sch.getSyntheticTimeElapsed(), 0);
        done();
    }, 100, {waitForTheFirstCall: false});
    });
});

