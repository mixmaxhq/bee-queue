const helpers = require('../../lib/helpers');
const Queue = require('../..');
const queue = new Queue('test', {
  removeOnSuccess: true
});

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

module.exports = async (options) => {
  const {done, next} = reef(options.numRuns);

  queue.process(options.concurrency, async () => next());

  const startTime = Date.now();
  for (let i = 0; i < options.numRuns; ++i) {
    queue.createJob({i}).save();
  }
  return done.then(() => {
    const elapsed = Date.now() - startTime;
    return queue.close().then(() => elapsed);
  });
};
