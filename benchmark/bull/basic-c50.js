require('./harness')({
  numRuns: 10000,
  concurrency: 50
}).then((time) => {
  console.log('Ran 10000 jobs through Bull with concurrency 50 in %d ms', time);
});
