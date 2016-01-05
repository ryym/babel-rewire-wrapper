# Wrapper of [babel-plugin-rewire][babel-plugin-rewire]

[![Build Status](https://travis-ci.org/ryym/babel-rewire-wrapper.svg?branch=master)](https://travis-ci.org/ryym/babel-rewire-wrapper.vim)
[![Dependency Status](https://david-dm.org/ryym/babel-rewire-wrapper.svg)](https://david-dm.org/ryym/babel-rewire-wrapper)
[![devDependency Status](https://david-dm.org/ryym/babel-rewire-wrapper/dev-status.svg)](https://david-dm.org/ryym/babel-rewire-wrapper#info=devDependencies)

This is a wrapper to use [babel-plugin-rewire][babel-plugin-rewire] more easily.

[babel-plugin-rewire]: https://github.com/speedskater/babel-plugin-rewire

## Example

To rewire the dependencies of this sample module..

```javascript
/* loggingReader.js */

import fs from 'fs';
import logger from './logger';

export default {
  readFile(filePath) {
    logger.log(`Read ${filePath}`);
    return fs.readFileSync(filePath);
  }
}
```

### Use babel-plugin-rewire directly

```javascript
import reader from './loggingReader';

reader.__Rewire__('fs', {
  readFileSync: filePath => `Content of ${filePath}.`
});
reader.__Rewire__('logger', {
  log: () => {}
});

assert.equal(reader.readFile(filePath), `Content of ${filePath}.`);

reader.__ResetDependency__('fs');
reader.__ResetDependency__('logger');
```

### Use the wrapper

When you pass a callback to `run()` method, `rewire()` injects mocks
and run the callback. All dependencies will be reset automatically
after the running.

```javascript
import reader from './loggingReader';
import rewire from 'babel-rewire-wrapper';

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
    // While running this callback, all dependencies are rewired.
    assert.equal(reader.readFile(filePath), `Content of ${filePath}.`)
  });

  // After the running, all dependencies are reset.
```

#### Rewire several modules

You can chain `use()` methods.

```javascript
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
```

#### Run async function

When running an async function, you have to return Promise
so that the dependencies will be reset correctly after running.

```javascript
import reader from './loggingReader';
import rewire from 'babel-rewire-wrapper';

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
  .then(...);
```

### Call rewiring methods separately

You can also inject mocks and reset dependencies explicitly.
Following is an example used with [mocha](https://mochajs.org/).

```javascript
...

context('with mocha test', () => {
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

  it('can inject mocks', () => {
    assert.equal(reader.readFile('some.file'), 'Expected value');
  });
});
```

## License

MIT
