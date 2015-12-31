
/**
 * Do actual injection to test modules.
 */
describe('Integration: babel-rewire wrapper', () => {

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
