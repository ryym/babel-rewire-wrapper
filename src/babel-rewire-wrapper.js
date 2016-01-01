
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
   * If the action is async, please takes an argument in
   * the action. The argument is a callback to notify Rewirer
   * that the async action is done.
   *
   * @param {!Rewirer~action} action
   * @return {?Promise} Promise if the action is async.
   */
  run(action) {
    if (action.length === 0) {
      this._runWithMocks(action);
    }
    else {
      return this._runWithMocksAsync(action);
    }
  }

  _isRewirable(module) {
    return module !== null
      && module['__Rewire__']
      && module['__ResetDependency__'];
  }

  _runWithMocks(action) {
    this.rewire();
    action();
    this.resetDependencies();
  }

  _runWithMocksAsync(action) {
    this.rewire();
    return new Promise((resolve, reject) => {
      action(err => {
        this.resetDependencies();
        err ? reject(err) : resolve();
      });
    });
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
   *
   * @callback Rewirer~action
   * @param {?Rewirer~done} done - If the action takes this argument,
   *     Rewirer recognizes the action is async. In this case,
   *     You have to call this done callback at the end to reset all
   *     dependencies.
   */

  /**
   * This callback notifies Rewirer that the action is done.
   *
   * @callback Rewirer~done
   * @param {?*} error - Something to indicate the action fails.
   */
}

/**
 * A function that creates a new instance of {@link Rewirer}.
 * @module rewire
 */
export default function rewire() {
  return new Rewirer();
}
