

const debug = require('debug')('RealScheduler');
const assert = require('assert');

const defaultOptions = {

  // if true, waits for [delay] milliseconds before the first callback execution
  waitForTheFirstCall: true,

  // callback, called after a scheduler's stop() method is called.
  // A function (sch) => {} where sch is an enclosing RealScheduler instance
  onStop: null,

  // callback, called after a time difference greater than [delay] occured.
  // A function (sch) => {} where sch is an enclosing RealScheduler instance
  onDeltaError: null,
};

function setOptionsFromParam(options = {}) {
  const opts = {};
  // TODO: check param types

  opts.waitForTheFirstCall = Object.prototype.hasOwnProperty.call(options, 'waitForTheFirstCall') ? options.waitForTheFirstCall : defaultOptions.waitForTheFirstCall;
  assert(typeof opts.waitForTheFirstCall === 'boolean', 'RealScheduler parameter [waitForTheFirstCall] must be boolean');
  opts.onStop = options.onStop || defaultOptions.onStop;
  assert(typeof opts.onStop === 'function' || opts.onStop === null, 'RealScheduler parameter [onStop] must be function');
  opts.onDeltaError = options.onDeltaError || defaultOptions.onDeltaError;
  assert(typeof opts.onDeltaError === 'function' || opts.onDeltaError === null, 'RealScheduler parameter [onDeltaError] must be function');
  return opts;
}

/**
 * Realtime scheduler
 *
 * Executes your callback repeatedly.
 * Unlike the built-in [setInterval](https://nodejs.org/api/timers.html#timerssetintervalcallbackdelayargs) method,
 * real-scheduler avoids the excessive accumulation of timing errors in the long-run
 * by making delay adjustments after each callback call.
 *
 * The scheduler uses the setInterval function internally, so you
 * should be aware of 'this' context in callbacks.
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
   * @param {function} callback - A function to be executed repeatedly. Has a
   * form of `(sch) => {}` where `sch` is an enclosing RealScheduler instance
   * @param {number} delay - The number of milliseconds to wait between callback calls
   * @param {object} [options] - Scheduler's options, with the following optional fields:
   * * **waitForTheFirstCall** {boolean} - If true, waits for `delay` milliseconds
   * before the first callback execution. Defaults to `true`.
   * * **onStop** {function} - A callback, called after a scheduler's `stop()`
   * method is called. A function `(sch) => {}` where `sch` is an enclosing
   * RealScheduler instance. Defaults to `null`.
   * **onDeltaError** {function} - A callback, called after a time difference
   * greater than `delay` occured. A function `(sch) => {}` where `sch` is an enclosing
   * RealScheduler instance. Defaults to `null`.
   *
   * @memberof RealScheduler
   */
  constructor(callback, delay, options) {
    assert(typeof callback === 'function', 'RealScheduler parameter [callback] must be function');
    assert(typeof delay === 'number' && delay >= 0, 'RealScheduler parameter [delay] must be non-negative number');
    assert(typeof options === 'object' || 'undefined', 'RealScheduler parameter [options] must be object');

    this.delay = delay;
    this.maxTimeDeviationAllowed = delay;
    this.runnerId = null;
    this.wantStop = false;

    this.initialTimeMillis = new Date(); // in millis
    this.syntheticTimeElapsed = 0;
    this.trueTimeElapsed = 0;
    this.numberOfCalls = 0;

    this.stats = {
      delay,
      numberOfCalls: 0,
      timeElapsed: 0,
      minDelta: 0,
      maxDelta: 0,
      deltaErrorCount: 0,
    };

    this.options = setOptionsFromParam(options);

    if (this.options.waitForTheFirstCall === false) {
      this.numberOfCalls += 1;
      callback(this);
    }
    this.runInternal(callback, this.delay);


    debug('CREATED  delay set to [%d] options: %o', this.delay, this.options);
  }


  runInternal(callback, timeout) {
    if (!this.wantStop) {
      this.runnerId = setTimeout(() => {
        this.numberOfCalls += 1;
        this.trueTimeElapsed = (new Date()) - this.initialTimeMillis;
        this.syntheticTimeElapsed += this.delay;
        const timeDeviation = this.trueTimeElapsed - this.syntheticTimeElapsed;
        debug('cc: %d te|ste: %d|%d  td: [%d]', this.numberOfCalls, this.trueTimeElapsed, this.syntheticTimeElapsed, timeDeviation);


        // statistics update
        if (timeDeviation < this.stats.minDelta) {
          this.stats.minDelta = timeDeviation;
        }
        if (timeDeviation > this.stats.maxDelta) {
          this.stats.maxDelta = timeDeviation;
        }
        this.stats.timeElapsed = this.trueTimeElapsed;
        this.stats.numberOfCalls = this.numberOfCalls;
        // deviation acceptance check
        if (Math.abs(timeDeviation) > this.maxTimeDeviationAllowed) {
          this.stats.deltaErrorCount += 1;
          debug(`time deviation too high [${timeDeviation}], max absolute allowed [${this.maxTimeDeviationAllowed}]`);
          if (this.options.onDeltaError !== null) {
            this.options.onDeltaError(this);
          }
        }

        if (!this.wantStop) {
          this.runInternal(callback, Math.max(0, timeout - (timeDeviation)));
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
    this.wantStop = true;
    if (this.runnerId !== null) {
      clearTimeout(this.runnerId);
    }
    if (this.options.onStop !== null) {
      this.options.onStop(this);
    }
  }

  /**
   *
   *
   * @returns {number} - The time period elapsed since the scheduler's start (in milliseconds)
   * @memberof RealScheduler
   */
  getTimeElapsed() {
    return this.trueTimeElapsed;
  }

  /**
   *
   *
   * @returns {number} - Synthetic time period elapsed since the scheduler's
   * start (in milliseconds) It equals delay*numberOfWaits
   * @memberof RealScheduler
   */
  getSyntheticTimeElapsed() {
    return this.syntheticTimeElapsed;
  }


  /**
   *
   *
   * @returns {number} - The number the scheduler's callback was called. Starts from 1.
   * @memberof RealScheduler
   */
  getNumberOfCalls() {
    return this.numberOfCalls;
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
    return this.stats;
  }
}


module.exports = RealScheduler;
