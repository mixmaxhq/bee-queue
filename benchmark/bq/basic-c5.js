require('./harness')({
  numRuns: 10000,
  concurrency: 5
}).then((time) => {
  console.log('Ran 10000 jobs through Bee-Queue with concurrency 5 in %d ms', time);
});
