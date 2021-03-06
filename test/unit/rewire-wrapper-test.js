import assert from 'power-assert';
import sinon from 'sinon';
import rewire from '../../lib/babel-rewire-wrapper';
import { modules, mocks } from './mock-modules';

describe('Unit: babel-rewire wrapper', () => {

  beforeEach(() => {
    modules.init();
  });

  describe('#use()', () => {
    it('throws an error for invalid arguments', () => {
      const rewirer = rewire();
      assert.throws(() => rewirer.use());
      assert.throws(() => rewirer.use(modules.foo));
      assert.throws(() => rewirer.use(1, 2, 3));
    });

    it('throws an error if a module has not babel-rewire methods', () => {
      const rewirer = rewire();
      assert.throws(() => rewirer.use(
        {}, { a: 1 }
      ));
      assert.throws(() => rewirer.use(
        { __Rewire__() {} },
        { a: 1 }
      ));
      assert.throws(() => rewirer.use(
        { __ResetDependency__() {} },
        { a: 1 }
      ));
    });

    it('registers a module and mocks to be injected', () => {
      const rewirer = rewire();
      rewirer
        .use(modules.foo, mocks.foo)
        .use(modules.bar, mocks.bar);

      assert.deepEqual(
        rewirer._targets,
        [{
          module: modules.foo,
          mocks: mocks.foo
        }, {
          module: modules.bar,
          mocks: mocks.bar
        }]
      );
    });

    it('does not rewire actually unless a execution method is called', () => {
      const rewirer = rewire();
      rewirer.use(modules.foo, mocks.foo);
      assert(! modules.foo.__Rewire__.called);
    });
  });

  describe('#remove()', () => {
    it('removes a specified module from rewiring target list', () => {
      const rewirer = rewire()
        .use(modules.foo, mocks.foo)
        .use(modules.bar, mocks.bar);

      assert.equal(rewirer._targets.length, 2);

      rewirer.remove(modules.foo);
      assert.deepEqual(
        rewirer._targets,
        [{
          module: modules.bar,
          mocks: mocks.bar
        }]
      );
    });

    it('does nothing if unregistered module is given', () => {
      const rewirer = rewire()
        .use(modules.foo, mocks.foo)
        .use(modules.bar, mocks.bar);

      assert.equal(rewirer._targets.length, 2);

      const newModule = { baz: true };
      rewirer.remove(newModule);

      assert.deepEqual(
        rewirer._targets,
        [{
          module: modules.foo,
          mocks: mocks.foo
        }, {
          module: modules.bar,
          mocks: mocks.bar
        }]
      );
    });
  });

  describe('#rewire()', () => {
    it('injects mocks to all modules via babel-rewire', () => {
      const rewirer = rewire()
        .use(modules.foo, mocks.foo)
        .use(modules.bar, mocks.bar);
      rewirer.rewire();

      assert.deepEqual(
        [
          modules.foo.__Rewire__.callCount,
          modules.bar.__Rewire__.callCount,
        ],
        [
          Object.keys(mocks.foo).length,
          Object.keys(mocks.bar).length
        ]
      );
    });
  });

  describe('#resetDependencies()', () => {
    it('resets dependencies of all modules via babel-rewire', () => {
      const rewirer = rewire()
        .use(modules.foo, mocks.foo)
        .use(modules.bar, mocks.bar);
      rewirer.resetDependencies();

      assert.deepEqual(
        [
          modules.foo.__ResetDependency__.callCount,
          modules.bar.__ResetDependency__.callCount
        ],
        [
          Object.keys(mocks.foo).length,
          Object.keys(mocks.bar).length
        ]
      );
    });
  });

  describe('#run()', () => {
    function spyRewirer(rewirer) {
      rewirer.rewire = sinon.spy();
      rewirer.resetDependencies = sinon.spy();
      return rewirer;
    }

    context('as sync', () => {
      it('run synchronously if a given action does not return Promise', () => {
        const rewirer = rewire().use(modules.foo, mocks.foo);
        const result  = rewirer.run(() => {});
        assert(result === undefined);
      });

      it('injects mocks before running automatically', () => {
        const rewirer = spyRewirer(rewire());
        rewirer.run(() => {
          assert(rewirer.rewire.calledOnce);
        });
      });

      it('resets dependencies after running automatically', () => {
        const rewirer = spyRewirer(rewire());
        rewirer.run(() => {});
        assert(rewirer.resetDependencies.calledOnce);
      });

      context('when any error occurred while running', () => {
        it('throws the error as is', () => {
          const rewirer = spyRewirer(rewire());
          assert.throws(() => {
            rewirer.run(() => { throw new Error('test-error'); });
          }, /test-error/);
        });

        it('resets dependencies', () => {
          const rewirer = spyRewirer(rewire());
          try {
            rewirer.run(() => { throw new Error('test-error'); });
          } catch (e) {
            // Does nothing.
          } finally {
            assert(rewirer.resetDependencies.calledOnce);
          }
        });
      });
    });

    context('as async', () => {
      function toPromise(action) {
        return new Promise(resolve => {
          action();
          resolve();
        });
      }

      it('run asynchronously if a given action returns Promise', done => {
        const rewierer = rewire().use(modules.foo, mocks.foo);
        rewierer
          .run(() => {
            return toPromise(() => {});
          })
          .then(done, done);
      });

      it('injects mocks before running automatically', done => {
        const rewirer = spyRewirer(rewire());
        rewirer.run(() => {
          return toPromise(() => {
            assert(rewirer.rewire.calledOnce);
          });
        }).then(done, done);
      });

      it('resets dependencies after running automatically', done => {
        const rewirer = spyRewirer(rewire());
        rewirer.run(() => {
          return toPromise(() => {
            assert(! rewirer.resetDependencies.called);
          });
        })
        .then(() => assert(rewirer.resetDependencies.calledOnce))
        .then(done, done);
      });

      context('when any error occurred while running', () => {
        it('returns rejected Promise', done => {
          let rejected  = false;
          const rewirer = spyRewirer(rewire());
          rewirer.run(() => {
            return toPromise(() => {
              throw new Error('test-error');
            });
          })
          .catch(err => {
            rejected = true;
            assert.equal(err.message, 'test-error');
          })
          .then(() => assert(rejected))
          .then(done, done);
        });

        it('resets dependencies', done => {
          const rewirer = spyRewirer(rewire());
          rewirer.run(() => {
            return toPromise(() => {
              throw new Error('test-error');
            })
          })
          .catch(err => {
            assert(rewirer.resetDependencies.calledOnce);
          })
          .then(done, done);
        });
      });
    });
  });
});
