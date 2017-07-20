const helpers = require('../../lib/helpers');
const Queue = require('bull');
const queue = new Queue('test');

// A promise-based barrier.
function reef(n = 1) {
  const done = helpers.deferred(), end = done.defer();
  return {
    done,
    next() {
      --n;
      if (n < 0) return false;
      if (n === 0) end();
      return true;
    }
  };
}

module.exports = (options) => {
  const {done, next} = reef(options.numRuns);

  queue.process(options.concurrency, () => {
    next();
    return Promise.resolve();
  });

  const startTime = Date.now();
  for (let i = 0; i < options.numRuns; ++i) {
    queue.add({i}, {removeOnComplete: true});
  }
  return done.then(() => {
    const elapsed = Date.now() - startTime;
    return queue.close().then(() => elapsed);
  });
};
