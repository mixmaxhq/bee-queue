const helpers = require('../../lib/helpers');
const kue = require('kue');
const queue = kue.createQueue();

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

  queue.process('test', options.concurrency, (job, jobDone) => {
    next();
    jobDone();
  });

  const startTime = Date.now();
  for (let i = 0; i < options.numRuns; ++i) {
    queue.create('test', {i}).save();
  }
  await done;

  return Date.now() - startTime;
};
