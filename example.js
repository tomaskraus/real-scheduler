var RealScheduler = require('./src/RealScheduler');

/** create and run automatically
 *
 * @callback <function> a function (sch) => {} where sch is an enclosing scheduler instance
 *
 * @delay <number> The number of milliseconds to wait between callbacks
 */
var scheduler = new RealScheduler((sch) => {
        // how many times this callback was called since the scheduler's start
        console.log(sch.getTimeElapsed() + ": Call count: " + sch.getNumberOfCalls());
        // a real, accumulated time since the scheduler start
        if (sch.getNumberOfCalls() == 60) {
            sch.stop(); //stop the scheduler
            console.log("execution stopped");
        }
    }, 1000); //repeat every 1000 milliseconds

