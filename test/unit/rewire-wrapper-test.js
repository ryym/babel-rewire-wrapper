import assert from 'power-assert';
import rewire from '../../lib/babel-rewire-wrapper';
import { modules, mocks } from './mock-modules';

describe('Unit: babel-rewire wrapper', () => {

  beforeEach(() => {
    modules.init();
  });

  describe('#use()', () => {
    it('throws an error for invalid arguments');

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

    it('does not inject actually unless a execution method is called', () => {
      const rewirer = rewire();
      rewirer.use(modules.foo, mocks.foo);
      assert(! modules.foo.__Rewire__.called);
    });
  });

  describe('#remove()', () => {
    it('removes a specified module from injection target list', () => {
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

    it('does nothing if unregistered module is given');
  });

  describe('#injectMocks()', () => {
    it('throws an error if a module has not babel-rewire methods');

    it('injects mocks to all modules via babel-rewire', () => {
      const rewirer = rewire().use(modules.foo, mocks.foo);
      rewirer.injectMocks();

      assert.equal(
        modules.foo.__Rewire__.callCount,
        Object.keys(mocks.foo).length
      );
    });
  });

  describe('#resetDependencies()', () => {
    it('resets dependencies of all modules via babel-rewire', () => {
      const rewirer = rewire().use(modules.foo, mocks.foo);
      rewirer.resetDependencies();
      assert.equal(
        modules.foo.__ResetDependency__.callCount,
        Object.keys(mocks.foo).length
      );
    });
  });

  describe('#run()', () => {

    context('as sync', () => {
      it('run synchronously if a given action takes no callback', () => {
        const rewirer = rewire().use(modules.foo, mocks.foo);
        rewirer.run(() => {
          assert(modules.foo.__Rewire__.called);
        });
      });

      it('injects mocks before running automatically');
      it('resets dependencies after running automatically');

      context('when any error occured while running', () => {
        it('resets dependencies');
      });
    });

    context('as async', () => {
      it('run asynchronously if a given action takes a callback', done => {
        const rewierer = rewire().use(modules.foo, mocks.foo);
        rewierer
          .run(reset => {
            assert(modules.foo.__Rewire__.called);
            reset();
          })
          .then(done);
      });

      it('injects mocks before running automatically');
      it('resets dependencies after running automatically');

      context('when any error occured while running', () => {
        it('resets dependencies');
      });
    });

  });

});
