/**
 * This class provides methods to register, un-register, update, and retrieve state, ensuring components are updated efficiently and consistently.
 * However, if you are utilizing React.JS, you can use "useRegisterStates" to automate the states registration, un-registration and component updates.
 */
export class StateManager<StateType> {
  private _options: TypeStateManagerOptions<StateType> = {};

  constructor(
    /**
     * Initial state of the manager.
     */
    private _value: StateType,

    /**
     * Options to configure the state manager.
     */
    options?: TypeStateManagerOptions<StateType>
  ) {
    if (options) this._options = options;
  }

  private _callbacks: Record<string, (newState: StateType) => void> = {};

  public get value(): StateType {
    // Requires deep cloning
    return this._value;
  }

  public set value(newState: StateType) {
    this._value = newState;

    for (const setterId in this._callbacks) {
      /* istanbul ignore next */
      this._callbacks[setterId]?.(this._value);
    }

    this._options.onChange?.(this._value);
  }

  /**
   * Registers a new callback in the state manager.
   */
  public register({
    uid,
    callback,
  }: {
    uid: string;
    callback: (newState: StateType) => void | Promise<void>;
  }) {
    this._callbacks[uid] = callback;
  }

  /**
   * Unregister a callback from the state manger.
   */
  public unregister({ uid }: { uid: string }) {
    delete this._callbacks[uid];
  }

  /**
   * Returns the unique IDs of the registered callbacks.
   */
  public get registeredCallbacks() {
    return Object.keys(this._callbacks);
  }
}

/**
 * This class provides methods to register, un-register, update, and retrieve state, ensuring components are updated efficiently and consistently.
 * However, if you are utilizing React.JS, you can use "useRegisterStates" to automate the states registration, un-registration and component updates.
 * @param initialState
 * @param options
 * @returns an instance of a state manager.
 */
export function manager<StateType>(
  initialState: StateType,
  options?: TypeStateManagerOptions<StateType>
): StateManager<StateType> {
  return new StateManager(initialState, options);
}

// Types **********************************************************************
export type TypeStateManagerOptions<StateType> = {
  /**
   * A callback that receives the new state whenever it is updated.
   * You can utilize "onChange" callback to modify other state manager instances or variables.
   * With "onChange" callback you do not need to cope with creating a unique id to register a callback with "register" method.
   * @param newState
   * @returns void
   */
  onChange?: (newState: StateType) => void;
};
