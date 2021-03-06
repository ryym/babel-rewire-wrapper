import assert from 'power-assert';
import rewire from '../../lib/babel-rewire-wrapper';
import greeter from './module/greeter';
import reader from './module/loggingReader';

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
    function delay(action, ms = 0) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            action();
            resolve();
          }
          catch (e) { reject(e); }
        }, ms);
      });
    }

    it('injects mocks when running the action', done => {
      assertGreet('Hello');
      rewire()
        .use(greeter, { greet: () => 'Hi' })
        .run(() => {
          return delay(() => {
            assertGreet('Hi');
          }, 5);
        })
        .then(done, done);
    });

    it('resets injected mocks after the action', done => {
      assertGreet('Hello');
      rewire()
        .use(greeter, { greet: () => 'Hi' })
        .run(() => {
          return delay(() => {}, 5);
        })
        .then(() => assertGreet('Hello'))
        .then(done, done);
    });
  });
});


describe('Examples of README', () => {
  const filePath = 'test/file/path';

  function assertMocksNotInjected() {
    assert(reader.getLogger().log == null);
  }

  it('demonstrates basic usage of babel-plugin-rewire', () => {
    reader.__Rewire__('fs', {
      readFileSync: filePath => `Content of ${filePath}.`
    });
    reader.__Rewire__('logger', {
      log: () => {}
    });

    assert.equal(reader.readFile(filePath), `Content of ${filePath}.`);

    reader.__ResetDependency__('fs');
    reader.__ResetDependency__('logger');
  });

  describe('for the wrapper', () => {
    beforeEach(() => {
      assertMocksNotInjected();
    });

    it('demonstrates a sample using the wrapper',  () => {
      rewire()
        .use(reader, {
          fs: {
            readFileSync: filePath => `Content of ${filePath}.`
          },
          logger: {
            log: () => {}
          }
        })
        .run(() => {
          assert.equal(reader.readFile(filePath), `Content of ${filePath}.`)
        });
    });

    it('demonstrates a sample which rewires several modules', () => {
      rewire()
        .use(reader, {
          fs: {
            readFileSync: filePath => `Content of ${filePath}.`
          },
          logger: {
            log: () => {}
          }
        })
        .use(greeter, {
          greet: () => 'Hi'
        })
        .run(() => {
          assert.equal(reader.readFile(filePath), `Content of ${filePath}.`);
          assert.equal(greeter.greet(), 'Hi');
        });
    });

    it('demonstrates a sample using the wrapper in async', done => {
      function fetchFilePath() {
        return Promise.resolve('test-file');
      }
      rewire()
        .use(reader, {
          fs: {
            readFileSync: filePath => `Content of ${filePath}.`
          },
          logger: {
            log: () => {}
          }
        })
        .run(() => {
          return fetchFilePath()
            .then(filePath => {
              assert.equal(reader.readFile(filePath), `Content of ${filePath}.`)
            });
        })
        .then(done, done);
    });

  });

  describe('using separate calls of wrapper functions', () => {
    let rewirer;

    before(() => {
      const fs = createMockFs();
      const logger = createMockLogger();
      rewirer = rewire().use(reader, { fs, logger });
      rewirer.rewire();
    });

    after(() => {
      rewirer.resetDependencies();
    });

    after(() => {
      assertMocksNotInjected();
    });

    it('can inject mocks', () => {
      assert.equal(reader.readFile('some.file'), 'Expected value');
    });

    function createMockFs() {
      return { readFileSync: filePath => 'Expected value' };
    }
    function createMockLogger() {
      return { log() {} }
    }
  });
});
