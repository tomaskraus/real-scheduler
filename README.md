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
 * @delay <number> The number of milliseconds to wait before calling the callback
 */
var scheduler = new RealScheduler((sch) => {
        // how many times this callback was called since the scheduler start
        console.log("Call count: " + sch.numOfCalls());
        // a real accumulated time since the scheduler start
        if (sch.timeElapsed() >= 10000) { //10secs
            sch.stop(); // can stop the scheduler at any moment
            console.log("execution stopped");
        }
    }, 1000); //repeat every 1000 milliseconds

```

