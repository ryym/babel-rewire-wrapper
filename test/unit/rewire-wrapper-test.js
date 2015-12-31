import rewire from '../../lib/babel-rewire-wrapper';

describe('Unit: babel-rewire wrapper', () => {
  
  describe('#getAllTargets()', () => {
    it('returns all modules registered to be mocked');
  });

  describe('#use()', () => {
    it('throws an error for invalid arguments');
    it('registers a module and mocks to be injected');
    it('does not inject actually unless a execution method is called');
  });

  describe('#remove()', () => {
    it('removes a specified module from injection target list');
    it('can take multiple module names');
    it('does nothing if invalid name is given');
  });

  describe('#injectMocks()', () => {
    it('throws an error if a module has not babel-rewire methods');
    it('injects mocks to all modules via babel-rewire');
  });

  describe('#resetDependencies()', () => {
    it('resets dependencies of all modules via babel-rewire')
  });

  describe('#run()', () => {

    context('as sync', () => {
      it('run synchronously if a given action takes no callback');
      it('injects mocks before running automatically');
      it('resets dependencies after running automatically');
    });

    context('as async', () => {
      it('run asynchronously if a given action takes a callback');
      it('injects mocks before running automatically');
      it('resets dependencies after running automatically');
    });

  });

});
