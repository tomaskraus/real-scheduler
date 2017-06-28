var RealScheduler = require('./src/RealScheduler');


var onStopHandler = function(sch) {
    console.log("stopped. stats: ", sch.getStatistics());
};

/** create and run automatically
 *
 * @callback <function> a function (sch) => {} where sch is an enclosing scheduler instance
 *
 * @delay <number> The number of milliseconds to wait between callback calls
 */
var scheduler = new RealScheduler((sch) => {

        console.log(
            // a real, accumulated time since the scheduler start
            sch.getTimeElapsed() + "|" + sch.getSyntheticTimeElapsed() +
            // how many times this callback was called since the scheduler's start
            ": Call count: " + sch.getNumberOfCalls()
        );

        if (sch.getNumberOfCalls() == 10) {
            sch.stop(); //stop the scheduler
        }
    }, 100 ,  //repeat every 100 milliseconds
    { waitForTheFirstCall: true, onStop: onStopHandler,
        onDeltaError: (sch) => {console.log("ERROR"); sch.stop()}}
);

