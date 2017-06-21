real-scheduler
==================

Executes your callback repeatedly. Unlike built-in [setInterval](https://nodejs.org/api/timers.html#timers_setinterval_callback_delay_args) method, real-scheduler avoids the excessive accumulation of timing errors in the long-run by making delay adjustments after each callback call.

Installation
------------

`npm install real-scheduler`

Usage
-----

executes a `callback` every `delay` milliseconds:
```javascript
    new RealScheduler(callback, delay);
```

complete example
```javascript
var RealScheduler = require('real-scheduler');

// create a Scheduler and run it automatically
// sch is a Scheduler's instance passed to a callback function
var scheduler = new RealScheduler((sch) => {
        console.log(
            sch.getTimeElapsed() +   // a real, accumulated time since the scheduler's start
            ": Call count: " + sch.getNumberOfCalls()  // how many times this callback was called since the scheduler's start
        );
        if (sch.getNumberOfCalls() == 60) {
            sch.stop(); //stop the scheduler
        }
    },
    100); //repeat every 100 milliseconds

```

