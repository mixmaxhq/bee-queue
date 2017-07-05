const Emitter = require('events').EventEmitter;

const helpers = require('../lib/helpers');
const expect = require('chai').expect;

describe('helpers', function () {
  describe('waitOn', function () {
    this.timeout(100);

    beforeEach(function () {
      this.emitter = new Emitter();
    });

    it('should wait for the given event', function () {
      const promise = helpers.waitOn(this.emitter, 'special');
      this.emitter.emit('special');
      return promise;
    });

    it('should not resolve sooner', function () {
      const promise = helpers.waitOn(this.emitter, 'special');
      let called = false;
      promise.then(() => called = true, () => called = true);
      expect(called).to.be.false;
    });

    it('should handle errors', function () {
      const promise = helpers.waitOn(this.emitter, 'special', true);
      this.emitter.emit('error', new Error('bad'));
      return promise.then(() => {
        throw new Error('expected rejection');
      }, (err) => {
        expect(err).to.be.an.instanceof(Error)
          .and.to.have.property('message', 'bad');
      });
    });

    it('should unregister after error', function () {
      const promise = helpers.waitOn(this.emitter, 'special', true);
      this.emitter.emit('error', new Error('bad'));
      return promise.catch((err) => {
        expect(err).to.be.an.instanceof(Error)
          .and.to.have.property('message', 'bad');
        // Node 4
        if (this.emitter.eventNames) {
          expect(this.emitter.eventNames()).to.be.empty;
        }
        expect(this.emitter.listeners('special')).to.be.empty;
        expect(this.emitter.listeners('error')).to.be.empty;
      });
    });

    it('should unregister after event', function () {
      const promise = helpers.waitOn(this.emitter, 'special', true);
      this.emitter.emit('special', true);
      return promise.then((value) => {
        expect(value).to.be.true;
        // Node 4
        if (this.emitter.eventNames) {
          expect(this.emitter.eventNames()).to.be.empty;
        }
        expect(this.emitter.listeners('special')).to.be.empty;
        expect(this.emitter.listeners('error')).to.be.empty;
      });
    });
  });

  describe('wrapAsync', function () {
    it('should handle the callback with synchronous errors', function () {
      const fn = helpers.wrapAsync(function poorlyDesigned(done) {
        process.nextTick(() => done(null, true));
        throw new Error('tada');
      });

      expect(fn).to.throw(Error, 'tada');
    });

    it('should handle the callback with caught synchronous errors', function () {
      const fn = helpers.wrapAsync(function poorlyDesigned(done) {
        process.nextTick(() => done(null, true));
        throw new Error('tada');
      }, true /* catchExceptions */);

      return fn().then(() => {
        throw new Error('expected rejection');
      }, (err) => {
        expect(err).to.be.an.instanceof(Error)
          .and.to.have.property('message', 'tada');
      });
    });

    it('should ignore synchronous errors', function () {
      const fn = helpers.wrapAsync(function throwsError() {
        throw new Error('data');
      });

      expect(fn).to.throw(Error, 'data');
    });
  });
});
