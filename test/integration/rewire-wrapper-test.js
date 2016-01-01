import assert from 'power-assert';
import rewire from '../../lib/babel-rewire-wrapper';
import greeter from './module/greeter';

/**
 * Do actual rewiring.
 */
describe('Integration: babel-rewire wrapper', () => {
  function assertGreet(expectedGreet) {
    assert.equal(greeter.greet(), expectedGreet);
  }

  it('has babel-plugin-rewire', () => {
    assertGreet('Hello');
    greeter.__Rewire__('greet', () => 'Hi');

    assertGreet('Hi');

    greeter.__ResetDependency__('greet');
    assertGreet('Hello');
  });

  context('run with sync function', () => {
    it('injects mocks while running the action', () => {
      assertGreet('Hello');
      rewire()
        .use(greeter, { greet: () => 'Hi' })
        .run(() => assertGreet('Hi'));
    });

    it('resets injected mocks after the action', () => {
      assertGreet('Hello');
      rewire()
        .use(greeter, { greet: () => 'Hi' })
        .run(() => {});
      assertGreet('Hello');
    });
  });

  context('run with async function', () => {
    it('injects mocks when running the action', done => {
      assertGreet('Hello');
      rewire()
        .use(greeter, { greet: () => 'Hi' })
        .run(reset => {
          setTimeout(() => {
            assertGreet('Hi');
            reset();
          }, 5);
        })
        .then(done, done);
    });

    it('resets injected mocks after the action', done => {
      assertGreet('Hello');
      rewire()
        .use(greeter, { greet: () => 'Hi' })
        .run(reset => {
          setTimeout(reset, 5);
        })
        .then(() => assertGreet('Hello'))
        .then(done, done);
    });
  });
});
