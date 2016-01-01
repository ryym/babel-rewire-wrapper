import sinon from 'sinon';

/**
 * Define the mock methods of 'babel-plugin-rewire'
 * using sinon.js.
 */
function spiedRewire(obj) {
  obj.__Rewire__ = sinon.spy();
  obj.__ResetDependency__ = sinon.spy();
  return obj;
}

/**
 * Mock modules
 */
export const modules = {
  foo: spiedRewire({
    name: 'foo',
    doFoo() { return 'doFoo' }
  }),

  bar: spiedRewire({
    point: 30,
    doBar() { return 'doBar' }
  }),

  init() {
    Object.keys(modules).forEach(m => {
      if (modules[m].hasOwnProperty('__Rewire__')) {
        modules[m] = spiedRewire(modules[m]);
      }
    });
  }
};

/**
 * Mock mocks
 */
export const mocks = {
  foo: {
    name: 'mocked-foo',
    doFoo() { return 'mocked-doFoo' }
  },
  bar: {
    point: 0,
    doBar() { return 'mocked-doBar' }
  }
};
