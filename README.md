# Wrapper of [babel-plugin-rewire][babel-plugin-rewire]

[![Build Status](https://travis-ci.org/ryym/babel-rewire-wrapper.svg?branch=master)](https://travis-ci.org/ryym/babel-rewire-wrapper.vim)
[![Dependency Status](https://david-dm.org/ryym/babel-rewire-wrapper.svg)](https://david-dm.org/ryym/babel-rewire-wrapper)
[![devDependency Status](https://david-dm.org/ryym/babel-rewire-wrapper/dev-status.svg)](https://david-dm.org/ryym/babel-rewire-wrapper#info=devDependencies)

This is a wrapper to use [babel-plugin-rewire][babel-plugin-rewire] more easily.

[babel-plugin-rewire]: https://github.com/speedskater/babel-plugin-rewire

## Example

To rewire the dependencies of this sample module..

```javascript
import fs from 'fs';
import logger from './logger';

export default {
  readFile(path) {
    logger.log(`Read ${path}`);
    return fs.readFileSync(path);
  }
}
```

### Use babel-plugin-rewire directly

```javascript
import reader from 'reader';

reader.__Rewire__('fs', {
  readFileSync: name => `Content of ${name}.`
});
reader.__Rewire__('logger', {
  log: () => {}
});

assert.equal(reader.readFile(name), `Content of ${name}.`);

reader.__ResetDependency__('fs');
reader.__ResetDependency__('logger');
```

### Use the wrapper

```javascript
import reader from 'reader';
import rewire from 'babel-rewire-wrapper';

rewire()
  .use(reader, {
    fs: {
      readFileSync: name => `Content of ${name}.`
    },
    logger: {
      log: () => {}
    }
  })
  .run(() => {
    assert.equal(reader.readFile(name), `Content of ${name}.`)
  });
```

### Run async function

When running an async function, you have to return Promise
so that the dependencies will be reset correctly after running.

```javascript
import reader from 'reader';
import rewire from 'babel-rewire-wrapper';

rewire()
  .use(reader, {
    fs: {
      readFileSync: name => `Content of ${name}.`
    },
    logger: {
      log: () => {}
    }
  })
  .run(() => {
    return fetchFileName()
      .then(name => {
        assert.equal(reader.readFile(name), `Content of ${name}.`)
      });
  })
  .then(...);
```

### Call rewiring methods separately

You can inject mocks and reset dependencies explicitly.
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
