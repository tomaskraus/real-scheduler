var tap = require('tap');

var RealScheduler = require('../src/RealScheduler');



tap.test('1st call returns syntheticTime equals to delay', function (childTest) {
  var scheduler = new RealScheduler((sch) => {

        sch.stop();
        childTest.equal(sch.getSyntheticTimeElapsed(), 100);
        childTest.end();
    }, 100);
});

tap.test('1st call (with waitForTheFirstCall option false) returns syntheticTime equals to 0', function (childTest) {
  var scheduler = new RealScheduler((sch) => {

        sch.stop();
        childTest.equal(sch.getSyntheticTimeElapsed(), 0);
        childTest.equal(sch.getTimeElapsed(), 0);
        childTest.end();
    }, 100, {waitForTheFirstCall: false});
});

// tap.test('1st call (with waitForTheFirstCall option false) returns syntheticTime equals to 0', function (childTest) {
//   var scheduler = new RealScheduler((sch) => {

//         sch.stop();
//         childTest.equal(sch.getSyntheticTimeElapsed(), 0);
//         childTest.equal(sch.getTimeElapsed(), 0);
//         childTest.end();
//     }, 100, {waitForTheFirstCall: false});
// });


