"use strict";

var debug = require('debug')('RealScheduler');


var defaultOptions = {
    waitForTheFirstCall: true,     //if true, waits for [delay] milliseconds before the first callback execution
    onStop: null,   //callback, called after a scheduler's stop() method is called. A function (sch) => {} where sch is an enclosing RealScheduler instance
    onDeltaError: null //callback, called after a time difference greater than [delay] occured. A function (sch) => {} where sch is an enclosing RealScheduler instance
};

var setOptionsFromParam = function(options) {
    options = options || {};
    var opts = {};
    //TODO: check param types

    opts.waitForTheFirstCall = options.hasOwnProperty('waitForTheFirstCall') ? options.waitForTheFirstCall : defaultOptions.waitForTheFirstCall;
    opts.onStop = options.onStop || defaultOptions.onStop;
    opts.onDeltaError = options.onDeltaError || defaultOptions.onDeltaError;
    return opts;
}

/**
 * Realtime scheduler
 *
 * Executes your callback repeatedly.
 * Unlike built-in [setInterval] method, real-scheduler avoids the excessive accumulation of timing errors in the long-run by making delay adjustments after each callback call.
 *
 * To end the scheduler, call its stop() method.
 *
 * Some scheduler options are available, such as:
 *  * executing the first callback without a delay
 *  * onStop handler, called when scheduler's stop() method is called
 *
 * @class RealScheduler
 */
class RealScheduler {

   /**
    * Creates an instance of RealScheduler and runs it immediately
    *
    * @param {function} callback - A function (sch) => {} where sch is an enclosing RealScheduler instance
    * @param {number} delay - The number of milliseconds to wait between callback calls
    * @param {object} options - Scheduler's options, with the following optional fields:
    *  * waitForTheFirstCall {boolean} - If true, waits for [delay] milliseconds before the first callback execution. Defaults true.
    *  * onStop {function} - A callback, called after a scheduler's stop() method is called. A function (sch) => {} where sch is an enclosing RealScheduler instance. Defaults null.
    *  * onDeltaError {function} - A callback, called after a time difference greater than [delay] occured. A function (sch) => {} where sch is an enclosing RealScheduler instance. Defaults null.
    *
    * @memberof RealScheduler
    */
    constructor(callback, delay, options) {
        this._delay = delay;
        this._maxTimeDeviationAllowed = delay;
        this._runnerId = null;
        this._wantStop = false;

        this._initialTimeMillis = new Date(); //in millis
        this._syntheticTimeElapsed = 0;
        this._trueTimeElapsed = 0;
        this._numberOfCalls = 0;

        this._stats = {delay: delay, numberOfCalls: 0, timeElapsed: 0, minDelta: 0, maxDelta: 0, deltaErrorCount: 0};

        this._options = setOptionsFromParam(options);

        if (this._options.waitForTheFirstCall === false) {
            this._numberOfCalls++;
            callback(this);
        }
        this._runInternal(callback, this._delay);


        debug(`CREATED  delay set to [%d] options: %o`, this._delay, this._options);
    }


    _runInternal (callback, timeout) {
        if (!this._wantStop) {
            this._runnerId = setTimeout(() => {
                this._numberOfCalls++;
                this._trueTimeElapsed = (new Date()) - this._initialTimeMillis;
                this._syntheticTimeElapsed += this._delay;
                let timeDeviation = this._trueTimeElapsed - this._syntheticTimeElapsed;
                debug("cc: %d te|ste: %d|%d  td: [%d]", this._numberOfCalls, this._trueTimeElapsed, this._syntheticTimeElapsed, timeDeviation);


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
                    if (this._options.onDeltaError !== null) {
                        this._options.onDeltaError(this);
                    }
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
        if (this._options.onStop !== null) {
            this._options.onStop(this);
        }
    }

    /**
     *
     *
     * @returns {number} - The time period elapsed since the scheduler's start (in milliseconds)
     * @memberof RealScheduler
     */
    getTimeElapsed() {
        return this._trueTimeElapsed;
    }

    /**
     *
     *
     * @returns {number} - Synthetic time period elapsed since the scheduler's start (in milliseconds) It equals delay*numberOfWaits
     * @memberof RealScheduler
     */
    getSyntheticTimeElapsed() {
        return this._syntheticTimeElapsed;
    }


    /**
     *
     *
     * @returns {number} - The number the scheduler's callback was called. Starts from 1.
     * @memberof RealScheduler
     */
    getNumberOfCalls() {
        return this._numberOfCalls;
    }

    /**
     *
     *
     * @returns {object} - Scheduler's statistics about its run
     * ```
     *   {
     *      delay: 0,
     *      numberOfCalls: 0,
     *      timeElapsed: 0,
     *      minDelta: 0,
     *      maxDelta: 0,
     *      deltaErrorCount: 0
     *   }
     * ```
     * @memberof RealScheduler
     */
    getStatistics() {
        return this._stats;
    }
}


module.exports = RealScheduler;
