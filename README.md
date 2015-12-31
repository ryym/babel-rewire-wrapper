# Wrapper of [babel-plugin-rewire][babel-plugin-rewire]

A wrapper to use [babel-plugin-rewire][babel-plugin-rewire] more easily.

[babel-plugin-rewire]: https://github.com/speedskater/babel-plugin-rewire

## Example

### Module

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

### Test Code

#### Use babel-plugin-rewire directly

```javascript
import reader from 'reader';

reader.__Rewire__('fs', {
  readFileSync: name => `Content of ${name}.`
});
reader.__Rewire__('logger', {
  log: () => {}
});

assert.equal(reader.readFile(name), `Content of ${name}`);

reader.__ResetDependency__('fs');
reader.__ResetDependency__('logger');
```

#### Use the wrapper

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

#### Run async function

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
  .run(done => {
    fetchFileName()
      .then(name => {
        assert.equal(reader.readFile(name), `Content of ${name}.`)
      })
      .then(done);
  });
```

### Call each method explicitly

You can inject and reset dependencies explicitly.
Following is an example used with [mocha](https://mochajs.org/).

```javascript
...

context('with mocha test', () => {
  let rewirer;

  before(() => {
    const fs = createMockFs();
    const logger = createMockLogger();
    rewirer = rewire()
      .use(reader, { fs, logger })
      .injectMocks();
  });

  after(() => {
    rewirer.resetDependencies();
  });

  it('can use mocks', () => {
    assert.equal(reader.readFile('some.file'), 'Expected value');
  });
});
```
