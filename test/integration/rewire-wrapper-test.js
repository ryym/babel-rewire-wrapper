import assert from 'power-assert';
import rewire from '../../lib/babel-rewire-wrapper';
import greeter from './module/greeter';

/**
 * Do actual rewiring to test modules.
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

  it('injects mocks to registered modules');
  it('resets dependencies of registered modules');

  context('run with sync function', () => {
    it('injects mocks while running the action');
    it('resets injected mocks after the action');
  });

  context('run with async function', () => {
    it('injects mocks when running the action');
    it('resets injected mocks after the action');
  });

});
