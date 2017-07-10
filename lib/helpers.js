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

function toArray(arrayLike) {
  return arraySlice.call(arrayLike);
}

const promiseUtils = require('promise-callbacks');

module.exports = {
  barrier,
  asCallback: promiseUtils.asCallback,
  deferred: promiseUtils.deferred,
  delay: promiseUtils.delay,
  waitOn: promiseUtils.waitOn,
  withTimeout: promiseUtils.withTimeout,
  wrapAsync: promiseUtils.wrapAsync,
  toArray,
};
