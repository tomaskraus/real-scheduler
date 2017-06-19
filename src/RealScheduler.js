"use strict";

var debug = require('debug')('RealScheduler');

/**
 * Realtime scheduler
 * Tries to repeat the callback at the realtime.
 * Makes time corrections on the next handler call.
 *
 * @class RealScheduler
 */
class RealScheduler {

   /**
    * Creates an instance of RealScheduler and runs it immediately
    *
    * @callback <function> a function (sch) => {} where sch is an enclosing RealScheduler instance
    *
    * @delay <number> The number of milliseconds to wait before calling the callback
    */
    constructor(callback, delay) {
        this._delay = delay;
        this._maxTimeDeviationAllowed = delay;
        this._runnerId = null;
        this._wantStop = false;

        this._initialTimeMillis = new Date(); //in millis
        this._syntheticTimeoutSum = 0;
        this._trueTimeElapsed = 0;
        this._numberOfCalls = 0;

        this._stats = {delay: delay, numberOfCalls: 0, timeElapsed: 0, minDelta: 0, maxDelta: 0, deltaErrorCount: 0};

        this._runInternal(callback, this._delay);


        debug(`CREATED  delay set to [%d]`, this._delay);
    }


    _runInternal (callback, timeout) {
        if (!this._wantStop) {
            this._runnerId = setTimeout(() => {
                this._numberOfCalls++;
                this._trueTimeElapsed = (new Date()) - this._initialTimeMillis;
                this._syntheticTimeoutSum += this._delay;
                let timeDeviation = this._trueTimeElapsed - this._syntheticTimeoutSum;
                debug("cc: %d te: %d  td: [%d]", this._numberOfCalls, this._trueTimeElapsed, timeDeviation);


                //statistics update
                if (timeDeviation < this._stats.minDelta)
                    this._stats.minDelta = timeDeviation;
                if (timeDeviation > this._stats.maxDelta)
                    this._stats.maxDelta = timeDeviation;
                this._stats.timeElapsed = this._trueTimeElapsed;
                this._stats.numberOfCalls = this._numberOfCalls;
                //deviation acceptance check
                if (Math.abs(timeDeviation) > this._maxTimeDeviationAllowed) {
                    this._stats.deltaErrorCount++;
                    debug(`time deviation too high [${timeDeviation}], max absolute allowed [${this._maxTimeDeviationAllowed}]`);
                }

                if (!this._wantStop) {
                    this._runInternal(callback, Math.max(0, timeout - (timeDeviation)));
                    callback(this);
                }
            }, timeout);
        }

    }

    /**
     * Stops the scheduler execution, so its next callback will not be called
     *
     * @memberof RealScheduler
     */
    stop() {
        this._wantStop = true;
        if (this._runnerId !== null) {
            clearTimeout(this._runnerId);
        }
    }

    /**
     *
     *
     * @returns <number> true time elapsed since the scheduler's start
     * @memberof RealScheduler
     */
    getTimeElapsed() {
        return this._trueTimeElapsed;
    }

    /**
     *
     *
     * @returns number the scheduler's loop was called. Starts from 1.
     * @memberof RealScheduler
     */
    getNumberOfCalls() {
        return this._numberOfCalls;
    }

    getStatistics() {
        return this._stats;
    }
}


module.exports = RealScheduler;
