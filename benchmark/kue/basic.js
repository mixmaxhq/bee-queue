require('./harness')({
  numRuns: 10000,
  concurrency: 1
}).then((time) => {
  console.log('Ran 10000 jobs through Kue with concurrency 1 in %d ms', time);
});
