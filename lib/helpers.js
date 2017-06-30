const sentinel = Object.create(null);

const arraySlice = Array.prototype.slice;

// Effectively _.after
function barrier(n, done) {
  return () => {
    n -= 1;
    if (n === 0) {
      done();
    }
  };
}

/**
 * Wrap a function that may return a promise or call a callback, making it always return a promise.
 * If catchExceptions is true, synchronous exceptions from the function will reject that promise.
 *
 * @param {Function} fn The asynchronous function.
 * @param {Boolean=} catchExceptions Whether to catch synchronous exceptions, defaults to false.
 * @return {Function} A promise-returning variant of the function.
 */
function wrapAsync(fn, catchExceptions) {
  return function () {
    let syncErr = sentinel;
    const promise = new Promise((resolve, reject) => {
      function cb(err, value) {
        if (syncErr !== sentinel) return;
        if (err) reject(err);
        else resolve(value);
      }
      const args = toArray(arguments);
      args.push(cb);
      let res;
      try {
        res = fn.apply(this, args);
      } catch (e) {
        if (catchExceptions) {
          reject(e);
        } else {
          syncErr = e;
        }
        return;
      }
      if (res && typeof res.then === 'function') {
        resolve(res);
      }
    });
    if (syncErr !== sentinel) throw syncErr;
    return promise;
  };
}

/**
 * Wait for the given EventEmitter to emit the given event. Optionally reject the promise of an
 * error event occurs while waiting.
 *
 * @param {EventEmitter} emitter The emitter to wait on.
 * @param {String} event The event to wait for.
 * @param {Boolean=} waitError Whether to reject if an error occurs, defaults to false.
 * @return {Promise<*>} A promise that resolves or rejects based on events emitted by the emitter.
 */
function waitOn(emitter, event, waitError) {
  if (waitError) {
    return new Promise((resolve, reject) => {
      function unbind() {
        emitter.removeListener('error', onError);
        emitter.removeListener(event, onEvent);
      }

      function onEvent(value) {
        unbind();
        resolve(value);
      }

      function onError(err) {
        unbind();
        reject(err);
      }

      emitter.on('error', onError);
      emitter.on(event, onEvent);
    });
  }
  return new Promise((resolve) => emitter.once(event, resolve));
}

function toArray(arrayLike) {
  return arraySlice.call(arrayLike);
}

const promiseUtils = require('promise-callbacks');

module.exports = {
  barrier,
  withTimeout: promiseUtils.withTimeout,
  asCallback: promiseUtils.asCallback,
  delay: promiseUtils.delay,
  deferred: promiseUtils.deferred,
  toArray,
  wrapAsync,
  waitOn
};
