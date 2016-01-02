function isPromise(obj) {
  return !! obj && typeof obj['then'] === 'function';
}

/**
 * Rewirer wraps the functionalities of
 * [babel-plugin-rewire]{@link https://github.com/speedskater/babel-plugin-rewire}.
 */
class Rewirer {
  /**
   * Initialize Rewirer.
   */
  constructor() {
    this._targets = [];
  }

  /**
   * Register a specified module as an rewiring target.
   *
   * @param {!*} module - A module to be injected mocks.
   *     The module must have both `__Rewire__` and
   *     `__ResetDependency__` methods added by 'babel-plugin-rewire'.
   * @param {!object} mocks - A hash object like {name: mock}.
   * @return {Rewirer} this instance
   */
  use(module, mocks) {
    if (arguments.length !== 2) {
      throw new Error('Please specify module and mocks');
    }
    if (! this._isRewirable(module)) {
      throw new Error('A module must have __Rewire__ and __ResetDependency__ methods');
    }
    this._targets.push({
      module, mocks
    });
    return this;
  }

  /**
   * Remove a specified module from rewiring targets.
   * If the given module doesn't be registered, does nothing.
   *
   * @param {*} module - A module to be removed from targets.
   * @return {Rewirer} this instance
   */
  remove(module) {
    this._targets = this._targets.filter(target => {
      return target.module !== module;
    });
    return this;
  }

  /**
   * Rewire all dependencies by mocks on the registered modules.
   */
  rewire() {
    this._eachMocks((module, name, mock) => {
      module.__Rewire__(name, mock);
    });
  }

  /**
   * Reset all dependencies which has been replaced with mocks.
   */
  resetDependencies() {
    this._eachMocks((module, name, mock) => {
      module.__ResetDependency__(name, mock);
    });
  }

  /**
   * Run the action. Rewirer automatically injects mocks
   * before running and resets dependencies after running.
   * If the action is async, please returns Promise
   * so that Rewirer can reset dependencies correctly
   * after the async process.
   *
   * @param {!Rewirer~action} action
   * @return {?Promise} Promise if the action is async.
   */
  run(action) {
    let isSync = true;
    this.rewire();

    try {
      const promiseOrElse = action();
      if (isPromise(promiseOrElse)) {
        isSync = false;
        return this._resetDependenciesAlways(promiseOrElse);
      }
      return promiseOrElse;
    }
    finally {
      isSync && this.resetDependencies();
    }
  }

  _isRewirable(module) {
    return module !== null
      && module['__Rewire__']
      && module['__ResetDependency__'];
  }

  _resetDependenciesAlways(promise) {
    return promise.then(
      result => {
        this.resetDependencies();
        return result;
      },
      error => {
        this.resetDependencies();
        throw error;
      }
    );
  }

  _eachMocks(iteratee) {
    this._targets.forEach(({ module, mocks }) => {
      Object.keys(mocks).forEach(name => {
        iteratee(module, name, mocks[name]);
      });
    });
  }

  /**
   * While this callback is running, it is guaranteed
   * that all the registered modules are rewired.
   * If this returns Promise, Rewirer resets dependencies
   * after the Promise is done.
   *
   * @callback Rewirer~action
   */
}

/**
 * A function that creates a new instance of {@link Rewirer}.
 * @module rewire
 */
export default function rewire() {
  return new Rewirer();
}
