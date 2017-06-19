real-scheduler
==================

Executes your callback repeatedly. Unlike built-in [setInterval](https://nodejs.org/api/timers.html#timers_setinterval_callback_delay_args) method, real-scheduler avoids the excessive accumulation of timing errors in the long-run by making delay adjustments after each callback call.

Installation
------------

`npm install real-scheduler`

Usage
-----

```javascript
var RealScheduler = require('real-scheduler');

/** create and run automatically
 *
 * @callback <function> a function (sch) => {} where sch is an enclosing scheduler instance
 *
 * @delay <number> The number of milliseconds to wait between callbacks
 */
var scheduler = new RealScheduler((sch) => {

        console.log(
            sch.getTimeElapsed() +   // a real, accumulated time since the scheduler start
            ": Call count: " + sch.getNumberOfCalls()  // how many times this callback was called since the scheduler's start
        );

        if (sch.getNumberOfCalls() == 60) {
            sch.stop(); //stop the scheduler
            console.log("execution stopped");
            //print some stats about scheduler's run
            console.log(scheduler.getStatistics());
        }
    }, 100); //repeat every 100 milliseconds

```

